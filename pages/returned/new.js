import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../src/styleMUI/catalog/catalog'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import {checkInt, checkFloat, unawaited, getClientTitle, formatAmount} from '../../src/lib';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import {getBrands} from '../../src/gql/items';
import Router from 'next/router'
import TextField from '@material-ui/core/TextField';
import {getClients} from '../../src/gql/client'
import { getClientGqlSsr } from '../../src/getClientGQL'
import Autocomplete from '@material-ui/lab/Autocomplete';
import Divider from '@material-ui/core/Divider';
import initialApp from '../../src/initialApp'
import { getBrandOrganizations } from '../../src/gql/items'
import CircularProgress from '@material-ui/core/CircularProgress';
import ReturnedConfirmed from '../../components/dialog/ReturnedConfirmed'
import Table from '../../components/table/catalogReturned';

const Catalog = React.memo((props) => {
    const classes = pageListStyle();
    //ref
    const contentRef = useRef();
    //props
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {showSnackBar} = props.snackbarActions;
    const {profile} = props.user;
    const {data} = props;
    const {search, filter, isMobileApp} = props.app;
    //client
    const [clients, setClients] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const searchTimeOut = useRef(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if(inputValue.length<3) {
            setClients([]);
            if(open)
                setOpen(false)
            if(loading)
                setLoading(false)
        }
        else {
            if(!loading)
                setLoading(true)
            if(searchTimeOut.current)
                clearTimeout(searchTimeOut.current)
            searchTimeOut.current = setTimeout(async () => {
                setClients(await getClients({search: inputValue, sort: '-name', filter: 'all'}))
                if(!open) setOpen(true)
                setLoading(false)
            }, 500)
        }
    }, [inputValue]);
    const handleChange = event => setInputValue(event.target.value);
    const [client, setClient] = useState(null);
    const handleClient =  (client) => {
        setClient(client)
        setOpen(false)
    };
    //товары
    const [list, setList] = useState([]);
    const getList = async () => {
        setList(await getBrands({organization: organization._id, search, sort: '-priotiry'}));
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        setPagination(100)
    }
    //возврат
    const [items, setItems] = useState({});
    //организация
    let [organization, setOrganization] = useState(null);
    let handleOrganization = (organization) => {
        setItems({})
        setOrganization(organization)
    };
    useEffect(() => {
        if(profile.organization)
            setOrganization(data.brandOrganizations.find(elem=>elem._id===profile.organization))
    }, [])
    //геолокация
    const geo = useRef(null);
    const searchTimeOutGeo = useRef(null);
    useEffect(() => {
        if(navigator.geolocation) {
            searchTimeOutGeo.current = setInterval(() => navigator.geolocation.getCurrentPosition((position) => geo.current = position), 10000)
            return () => clearInterval(searchTimeOutGeo.current)
        } else
            showSnackBar('Геолокация не поддерживается')
    }, [])
    const searchTimeOutBrands = useRef(null);
    const initialRender = useRef(true);
    //смена фильтра или организации обновляет список товаров
    useEffect(() => {
        if(!initialRender.current&&organization)
            unawaited(getList)
    }, [filter, organization])
    //поиск товаров
    useEffect(() => {
        if(initialRender.current)
            initialRender.current = false;
        else if(organization._id) {
            if(searchTimeOutBrands.current)
                clearTimeout(searchTimeOutBrands.current)
            searchTimeOutBrands.current = setTimeout(() => unawaited(getList), 500)
        }
    }, [search])
    //общая цена
    let [allPrice, setAllPrice] = useState(0);
    //количество
    let increment = (idx) => {
        let id = list[idx]._id
        if(!items[id])
            items[id] = {_id: id, item: list[idx].name, count: 0, allPrice: 0, allTonnage: 0, weight: checkInt(list[idx].weight), price: list[idx].price}
        items[id].count+=1
        items[id].allPrice = checkFloat(items[id].count*list[idx].price)
        items[id].allTonnage = checkFloat(items[id].count*items[id].weight)
        setItems({...items})
    }
    let decrement = (idx) => {
        let id = list[idx]._id
        if(!items[id])
            items[id] = {_id: id, item: list[idx].name, count: 0, allPrice: 0, allTonnage: 0, weight: checkInt(list[idx].weight), price: list[idx].price, }
        if(items[id].count>0) {
            items[id].count -= 1
            items[id].allPrice = checkFloat(items[id].count*list[idx].price)
            items[id].allTonnage = checkFloat(items[id].count*items[id].weight)
            setItems({...items})
        }
    }
    let setBasketChange= (idx, count) => {
        let id = list[idx]._id
        if(!items[id])
            items[id] = {_id: id, item: list[idx].name, count: 0, allPrice: 0, allTonnage: 0, weight: checkInt(list[idx].weight), price: list[idx].price}
        items[id].count = checkInt(count)
        items[id].allPrice = checkFloat(items[id].count*list[idx].price)
        items[id].allTonnage = checkFloat(items[id].count*items[id].weight)
        setItems({...items})
    }
    useEffect(() => {
        let keys = Object.keys(items)
        allPrice = 0
        for(let i=0; i<keys.length; i++)
            allPrice += items[keys[i]].allPrice
        setAllPrice(checkFloat(allPrice))
    }, [items])
    //пагинация
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [pagination, list])
    //double
    const double = contentRef.current&&contentRef.current.offsetWidth>=1020
    //middleList
    const middleList = list?Math.ceil(list.length/2):0
   //рендер
    return (
        <App checkPagination={checkPagination} searchShow pageName='Каталог возврата'>
            <Head>
                <title>Каталог возврата</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}} ref={contentRef}>
                    <Autocomplete
                        onClose={() =>setOpen(false)}
                        open={open}
                        disableOpenOnFocus
                        className={classes.input}
                        options={clients}
                        getOptionLabel={option => getClientTitle(option)}
                        onChange={(event, newValue) => {
                            handleClient(newValue)
                        }}
                        noOptionsText='Ничего не найдено'
                        renderInput={params => (
                            <TextField {...params} label='Выберите клиента' variant='outlined' fullWidth
                                       onChange={handleChange}
                                       InputProps={{
                                           ...params.InputProps,
                                           endAdornment: (
                                               <React.Fragment>
                                                   {loading ? <CircularProgress color='inherit' size={20} /> : null}
                                                   {params.InputProps.endAdornment}
                                               </React.Fragment>
                                           ),
                                       }}
                            />
                        )}
                    />
                    <br/>

                    {
                        !profile.organization?
                            <>
                                <Autocomplete
                                    className={classes.input}
                                    options={data.brandOrganizations}
                                    getOptionLabel={option => option.name}
                                    onChange={(event, newValue) => handleOrganization(newValue)}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField {...params} label='Выберите организацию' fullWidth />
                                    )}
                                />
                                <br/>
                            </>
                            :null

                    }
                    {
                        isMobileApp?
                            list.map((row, idx) => {
                                let price
                                if(items[row._id]&&items[row._id].allPrice)
                                    price = items[row._id].allPrice
                                else
                                    price = row.price
                                if(idx<pagination)
                                    return(
                                        <div key={row._id}>
                                            <div className={classes.line}>
                                                <a href={`/item/${row._id}`} target='_blank'>
                                                    <img className={classes.media} src={row.image}/>
                                                </a>
                                                <div className={classes.column}>
                                                    <a href={`/item/${row._id}`} target='_blank'>
                                                        <div className={classes.value}>{row.name}</div>
                                                    </a>
                                                    <b className={classes.value}>
                                                        {`${formatAmount(price)} сом`}
                                                    </b>
                                                    <div className={classes.line}>
                                                        <div className={classes.counter}>
                                                            <div className={classes.counterbtn} onClick={() => decrement(idx)}>
                                                                –
                                                            </div>
                                                            <input readOnly={!row.apiece} type={isMobileApp?'number':'text'} className={classes.counternmbr}
                                                                   value={items[row._id]?items[row._id].count:''} onChange={(event) => {
                                                                setBasketChange(idx, event.target.value)
                                                            }}/>
                                                            <div className={classes.counterbtn} onClick={() => increment(idx)}>
                                                                +
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <br/>
                                            <Divider/>
                                            <br/>
                                        </div>
                                    )
                            })
                            :
                            <div style={{display: 'flex', flexDirection: 'row'}}>
                                <Table contentRef={contentRef} list={double?list.slice(0, middleList):list} items={items} setBasketChange={setBasketChange}/>
                                {double?<Table  middleList={middleList} contentRef={contentRef} list={list.slice(middleList)} items={items} setBasketChange={setBasketChange}/>:null}
                            </div>
                    }
                </CardContent>
            </Card>
            <div style={{height: 70}}/>
            <div className={isMobileApp?classes.bottomBasketM:classes.bottomBasketD}>
                <div className={isMobileApp?classes.allPriceM:classes.allPriceD}>
                    <div className={isMobileApp?classes.value:classes.priceAllText}>Общая стоимость</div>
                    <div className={isMobileApp?classes.nameM:classes.priceAll}>{`${formatAmount(allPrice)} сом`}</div>
                </div>
                <div className={isMobileApp?classes.buyM:classes.buyD} onClick={() => {
                    if(allPrice>0) {
                        if(client) {
                            setMiniDialog('Оформление возврата', <ReturnedConfirmed items={items} client={client} geo={geo.current} allPrice={allPrice} organization={organization}/>)
                            showMiniDialog(true)
                        }
                        else
                            showSnackBar('Пожалуйста выберите клиента')
                    }
                    else
                        showSnackBar('Добавьте товар в корзину')
                }}>
                    Добавить
                </div>
            </div>
        </App>
    )
})

Catalog.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['суперагент','агент','admin','менеджер','суперорганизация', 'организация'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            brandOrganizations: await getBrandOrganizations({search: '', filter: ''}, getClientGqlSsr(ctx.req))
        }
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Catalog);
import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../src/styleMUI/catalog/catalog'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import {checkInt, checkFloat, isNotEmpty} from '../src/lib';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../redux/actions/mini_dialog'
import * as snackbarActions from '../redux/actions/snackbar'
import Router from 'next/router'
import BuyBasket from '../components/dialog/BuyBasket'
import SetPackage from '../components/dialog/SetPackage'
import { getClient, getClients } from '../src/gql/client'
import TextField from '@material-ui/core/TextField';
import { getClientGqlSsr } from '../src/getClientGQL'
import Autocomplete from '@material-ui/lab/Autocomplete';
import { deleteBasketAll } from '../src/gql/basket';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import initialApp from '../src/initialApp'
import { getBrandOrganizations, getBrands } from '../src/gql/items'
import CircularProgress from '@material-ui/core/CircularProgress';
import {getSpecialPriceClients} from '../src/gql/specialPrice';
import {getPlanClient} from '../src/gql/planClient';
import {getSpecialPriceCategories} from '../src/gql/specialPriceCategory';
import {getLimitItemClients} from '../src/gql/limitItemClient';
import {getStocks} from '../src/gql/stock';

const Catalog = React.memo((props) => {
    const classes = pageListStyle();
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    const { showSnackBar } = props.snackbarActions;
    const { profile } = props.user;
    const { data } = props;
    const [clients, setClients] = useState([]);
    let [normalPrices, setNormalPrices] = useState(data.normalPrices);
    let [limitItemClient, setLimitItemClient] = useState({});
    let [stockClient, setStockClient] = useState({});
    const checkMaxCount = (idx) => {
        let maxCount
        if(isNotEmpty(stockClient[list[idx]._id])&&isNotEmpty(limitItemClient[list[idx]._id])) {
            maxCount = stockClient[list[idx]._id]<limitItemClient[list[idx]._id]?stockClient[list[idx]._id]:limitItemClient[list[idx]._id]
        }
        else if(isNotEmpty(stockClient[list[idx]._id])) {
            maxCount = stockClient[list[idx]._id]
        }
        else if(isNotEmpty(limitItemClient[list[idx]._id])) {
            maxCount = limitItemClient[list[idx]._id]
        }
        return maxCount
    }
    const { search } = props.app;
    const [inputValue, setInputValue] = React.useState('');
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    let [searchTimeOut1, setSearchTimeOut1] = useState(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const initialRender = useRef(true);
    const getList = async ()=>{
        normalPrices = {}
        if(organization&&organization._id) {
            list = (await getBrands({organization: organization._id, search, sort: '-priotiry'})).brands
            for(let i=0; i<list.length; i++){
                normalPrices[list[i]._id] = list[i].price
            }
            if(client) {
                const _specialPrices = await getSpecialPriceClients({client: client._id, organization: organization._id})
                const specialPrices = {}
                for(let i=0; i<_specialPrices.length; i++){
                    specialPrices[_specialPrices[i].item._id] = _specialPrices[i].price
                }
                const _specialPriceCategories = await getSpecialPriceCategories({client: client._id, organization: organization._id})
                const specialPriceCategories = {}
                for(let i=0; i<_specialPriceCategories.length; i++){
                    specialPriceCategories[_specialPriceCategories[i].item._id] = _specialPriceCategories[i].price
                }
                for(let i=0; i<list.length; i++){
                    if(isNotEmpty(specialPrices[list[i]._id]))
                        list[i].price = specialPrices[list[i]._id]
                    else if(isNotEmpty(specialPriceCategories[list[i]._id]))
                        list[i].price = specialPriceCategories[list[i]._id]
                }
            }
            setList([...list]);
            (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant'});
            setPagination(100);
        }
        setNormalPrices({...normalPrices})
    }
    useEffect(() => {
        (async()=>{
            if (inputValue.length < 3) {
                setClients([]);
                if (open)
                    setOpen(false)
                if (loading)
                    setLoading(false)
            }
            else {
                if (!loading)
                    setLoading(true)
                if (searchTimeOut)
                    clearTimeout(searchTimeOut)
                searchTimeOut = setTimeout(async () => {
                    setClients((await getClients({search: inputValue, sort: '-name', filter: 'Включенные', catalog: true})).clients)
                    if (!open)
                        setOpen(true)
                    setLoading(false)
                }, 500)
                setSearchTimeOut(searchTimeOut)
            }
        })()
    }, [inputValue]);
    const handleChange = event => {
        setInputValue(event.target.value);
    };
    let [list, setList] = useState(data.brands);
    const [planClient, setPlanClient] = useState(null);
    const [basket, setBasket] = useState({});
    let [organization, setOrganization] = useState(data.organization);
    let [geo, setGeo] = useState(undefined);
    let handleOrganization = async (organization) => {
        await deleteBasketAll()
        setBasket({})
        setOrganization(organization)
    };
    const searchTimeOutRef = useRef(null);
    useEffect(()=>{
        (async()=>{
            if(profile.organization){
                organization = data.brandOrganizations.filter(elem=>elem._id===profile.organization)[0]
                setOrganization({...organization})
            }
            if(sessionStorage.catalog&&sessionStorage.catalog!=='{}'){
                setBasket(JSON.parse(sessionStorage.catalog))
            }
        })()
    },[])
    useEffect(()=>{
        if (navigator.geolocation){
            searchTimeOutRef.current = setInterval(() => {
                navigator.geolocation.getCurrentPosition((position)=>{
                    setGeo(position)
                })
            }, 1000)
            return ()=>{
                clearInterval(searchTimeOutRef.current)
            }
        } else {
            showSnackBar('Геолокация не поддерживается')
        }
    },[])
    useEffect(()=>{
        (async()=>{
            if(!initialRender.current)
                await getList()
        })()
    },[organization])
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            } else {
                if(organization&&organization._id) {
                    if (searchTimeOut1)
                        clearTimeout(searchTimeOut1)
                    searchTimeOut1 = setTimeout(async () => {
                        await getList()
                    }, 500)
                    setSearchTimeOut1(searchTimeOut1)
                }

            }
        })()
    },[search])
    let [client, setClient] = useState(data.client);
    let handleClient = async (client) => {
        for(let i=0; i<list.length; i++){
            if(normalPrices[list[i]._id]!=undefined)
                list[i].price = normalPrices[list[i]._id]
        }
        if(client&&organization&&organization._id){
            const _specialPrices = await getSpecialPriceClients({client: client._id, organization: organization._id})
            const specialPrices = {}
            for(let i=0; i<_specialPrices.length; i++){
                specialPrices[_specialPrices[i].item._id] = _specialPrices[i].price
            }
            const _specialPriceCategories = await getSpecialPriceCategories({client: client._id, organization: organization._id})
            const specialPriceCategories = {}
            for(let i=0; i<_specialPriceCategories.length; i++){
                specialPriceCategories[_specialPriceCategories[i].item._id] = _specialPriceCategories[i].price
            }
            for(let i=0; i<list.length; i++){
                if(isNotEmpty(specialPrices[list[i]._id]))
                    list[i].price = specialPrices[list[i]._id]
                else if(isNotEmpty(specialPriceCategories[list[i]._id]))
                    list[i].price = specialPriceCategories[list[i]._id]
            }
            setPlanClient((await getPlanClient({client: client._id, organization: organization._id})).planClient)
        }
        else {
            setPlanClient(null)
        }
        setList([...list]);
        setClient(client)
        setBasket({})
        setOpen(false)
    };
    let [allPrice, setAllPrice] = useState(0);
    const { isMobileApp } = props.app;
    let increment = async (idx)=>{
        let id = list[idx]._id
        if(!basket[id])
            basket[id] = {_id: id, count: 0, allPrice: 0, consignment: 0}
        basket[id].count = checkInt(basket[id].count)
        basket[id].count+=list[idx].apiece?1:(list[idx].packaging?list[idx].packaging:1)

        const maxCount = checkMaxCount(idx)
        if(isNotEmpty(maxCount)&&basket[id].count>maxCount) {
            basket[id].count = maxCount
        }

        basket[id].allPrice = checkFloat(basket[id].count*list[idx].price)
        setBasket({...basket})
    }
    let decrement = async (idx)=>{
        let id = list[idx]._id
        if(basket[id]){
            if(basket[id].count>0) {
                basket[id].count = checkInt(basket[id].count)
                basket[id].count -= list[idx].apiece?1:(list[idx].packaging?list[idx].packaging:1)
                if(basket[id].count<0) {
                    basket[id].count = 0
                }
                basket[id].allPrice = checkFloat(basket[id].count*list[idx].price)
                setBasket({...basket})
            }
        }
    }
    let incrementConsignment = async(idx)=>{
        let id = list[idx]._id
        if(basket[id]&&basket[id].consignment<basket[id].count) {
            basket[id].consignment += 1
            setBasket({...basket})
        }
    }
    let decrementConsignment = async(idx)=>{
        let id = list[idx]._id
        if(basket[id]&&basket[id].consignment>0) {
            basket[id].consignment -= 1
            setBasket({...basket})
        }

    }
    let showConsignment = (idx)=>{
        let id = list[idx]._id
        if(basket[id]) {
            basket[id].showConsignment = !basket[id].showConsignment
            setBasket({...basket})
        }
    }
    let setBasketChange= async(idx, count)=>{
        let id = list[idx]._id
        if(!basket[id])
            basket[id] = {_id: id, count: 0, allPrice: 0, consignment: 0}
        basket[id].count = checkInt(count)

        const maxCount = checkMaxCount(idx)
        if(isNotEmpty(maxCount)&&basket[id].count>maxCount) {
            basket[id].count = maxCount
        }

        basket[id].allPrice = checkFloat(basket[id].count*list[idx].price)
        setBasket({...basket})
    }
    let setPackage= async(idx, count)=>{
        let id = list[idx]._id
        if(!basket[id])
            basket[id] = {_id: id, count: 0, allPrice: 0, consignment: 0}
        basket[id].count = checkInt(basket[id].count)
        basket[id].count = count*(list[idx].packaging?list[idx].packaging:1)

        const maxCount = checkMaxCount(idx)
        if(isNotEmpty(maxCount)&&basket[id].count>maxCount) {
            basket[id].count = maxCount
        }

        basket[id].allPrice = checkFloat(basket[id].count*list[idx].price)
        setBasket({...basket})
    }
    let setPackageConsignment = async(idx, count)=>{
        let id = list[idx]._id
        if(basket[id]){
            let consignment = count*(list[idx].packaging?list[idx].packaging:1)
            if(consignment<=basket[id].count){
                basket[id].consignment = consignment
                setBasket({...basket})
            }
        }
    }
    useEffect(()=>{
        if(!initialRender.current) {
            sessionStorage.catalog = JSON.stringify(basket)
            let keys = Object.keys(basket)
            allPrice = 0
            for (let i = 0; i < keys.length; i++) {
                allPrice += basket[keys[i]].allPrice
            }
            setAllPrice(checkFloat(allPrice))
        }
    },[basket])
    let [pagination, setPagination] = useState(100);
    const checkPagination = ()=>{
        if(pagination<list.length){
            setPagination(pagination+100)
        }
    }
    useEffect(()=>{
        (async()=>{
            limitItemClient = {}
            stockClient = {}
            if(client) {
                let res = await getLimitItemClients({client: client._id, organization: organization._id})
                if(res) {
                    for(let i=0;i<res.length;i++){
                        limitItemClient[res[i].item._id] = res[i].limit
                    }
                }
                res = await getStocks({client: client._id, search: '', organization: organization._id})
                if(res&&res.stocks) {
                    for(let i=0;i<res.stocks.length;i++){
                        stockClient[res.stocks[i].item._id] = res.stocks[i].count
                    }
                }
            }
            setLimitItemClient({...limitItemClient})
            setStockClient({...stockClient})
        })()
    },[client])
    return (
        <App checkPagination={checkPagination} searchShow={true} pageName='Каталог'>
            <Head>
                <title>Каталог</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    {
                        data.client?
                            <TextField
                                label='Клиент'
                                value={data.client.name}
                                className={classes.input}
                                inputProps={{
                                    'aria-label': 'description',
                                    readOnly: true,
                                }}
                            />
                            :
                            <Autocomplete
                                onClose={()=>setOpen(false)}
                                open={open}
                                disableOpenOnFocus
                                className={classes.input}
                                options={clients}
                                getOptionLabel={option => `${/*option.name*/''}${option.address&&option.address[0]?`${/*' ('*/''}${option.address[0][2]?`${option.address[0][2]}, `:''}${option.address[0][0]}${/*')'*/''}`:''}`}
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
                    }
                    {
                        planClient?
                            <>
                                <Divider style={{marginTop: 10, marginBottom: 5}}/>
                                <div className={classes.row} style={{justifyContent: 'center'}}>
                                    <div className={classes.nameField} style={{marginBottom: 0}}>
                                        План на месяц:&nbsp;
                                    </div>
                                    <div className={classes.valueField} style={{marginBottom: 0}}>
                                        <div className={classes.row}>
                                            {planClient.current} сом / <div style={{color: planClient.current<planClient.month?'orange':'green'}}>{planClient.month} сом</div>
                                        </div>
                                    </div>
                                </div>
                                <Divider style={{marginTop: 5, marginBottom: 15}}/>
                            </>
                            :
                            <div style={{height: 10}}/>
                    }
                    {
                        data.brandOrganizations.length>1&&profile.agentSubBrand?
                            <>
                            <Autocomplete
                                style={{marginBottom: 10}}
                                className={classes.input}
                                options={data.brandOrganizations}
                                getOptionLabel={option => option.name}
                                onChange={(event, newValue) => {
                                    handleOrganization(newValue)
                                }}
                                noOptionsText='Ничего не найдено'
                                renderInput={params => (
                                    <TextField {...params} label='Выберите организацию' variant='outlined' fullWidth />
                                )}
                            />
                            </>
                            :null

                    }
                    <div style={{display: 'flex', width: '100%', justifyContent: 'center', marginBottom: 10}}>
                        {
                            organization&&organization.catalog?
                                <Button className={classes.input} onClick={() => window.open(organization.catalog, '_blank')} size='small' color='primary'>
                                    Открыть каталог
                                </Button>
                                :
                                null
                        }
                        {
                            client?
                                <Button className={classes.input} onClick={() => window.open(`/client/${client._id}`, '_blank')} size='small' color='primary'>
                                    Посмотреть клиента
                                </Button>
                                :
                                null
                        }
                    </div>



                    {
                        list.map((row, idx) => {
                            let price
                            if(basket[row._id]&&basket[row._id].allPrice)
                                price = basket[row._id].allPrice
                            else
                                price = row.price
                            if(idx<pagination)
                                return(
                                        <div>
                                            <div className={classes.line}>
                                                <img className={classes.media} src={row.image}/>
                                                <div className={classes.column} style={{width: 'calc(100% - 142px)'}}>
                                                    <div className={classes.value}>{row.name}</div>
                                                    <b className={classes.value}>
                                                        {`${price} сом`}
                                                    </b>
                                                    <div className={classes.line}>
                                                        <div className={classes.counter}>
                                                            <div className={classes.counterbtn} onClick={() => {
                                                                decrement(idx)
                                                            }}>–
                                                            </div>
                                                            <input readOnly={!row.apiece} type={isMobileApp?'number':'text'} className={classes.counternmbr}
                                                                   value={basket[row._id]?basket[row._id].count:''} onChange={(event) => {
                                                                setBasketChange(idx, event.target.value)
                                                            }}/>
                                                            <div className={classes.counterbtn} onClick={() => {
                                                                increment(idx)
                                                            }}>+
                                                            </div>
                                                        </div>
                                                        &nbsp;&nbsp;&nbsp;
                                                        <div className={classes.showCons} style={{color: basket[row._id]&&basket[row._id].showConsignment?'#ffb300':'#000'}} onClick={()=>{
                                                            showConsignment(idx)
                                                        }}>
                                                            КОНС
                                                        </div>
                                                    </div>
                                                    <div className={classes.row}>
                                                        <div className={classes.addPackaging} style={{color: '#ffb300'}} onClick={()=>{
                                                            setMiniDialog('Упаковок', <SetPackage
                                                                action={setPackage}
                                                                idx={idx}/>)
                                                            showMiniDialog(true)
                                                        }}>
                                                            Упаковок: {basket[row._id]?(basket[row._id].count/(row.packaging?row.packaging:1)).toFixed(1):0}
                                                        </div>
                                                        {
                                                            isNotEmpty(stockClient[row._id])?<div className={classes.stock}>
                                                                Остаток: {stockClient[row._id]}
                                                            </div>:null
                                                        }
                                                        {
                                                            isNotEmpty(limitItemClient[row._id])?<div className={classes.stock}>
                                                                Лимит: {limitItemClient[row._id]}
                                                            </div>:null
                                                        }
                                                    </div>
                                                    {
                                                        basket[row._id]&&basket[row._id].showConsignment?
                                                            <>
                                                            <br/>
                                                            <div className={classes.row}>
                                                                <div className={classes.valuecons}>Консигнация</div>
                                                                <div className={classes.counterbtncons} onClick={()=>{decrementConsignment(idx)}}>-</div>
                                                                <div className={classes.valuecons}>{basket[row._id]?basket[row._id].consignment:0}&nbsp;шт</div>
                                                                <div className={classes.counterbtncons} onClick={()=>{incrementConsignment(idx)}}>+</div>
                                                            </div>
                                                            <div className={classes.addPackaging} style={{color: '#ffb300'}} onClick={()=>{
                                                                setMiniDialog('Упаковок', <SetPackage
                                                                    action={setPackageConsignment}
                                                                    idx={idx}/>)
                                                                showMiniDialog(true)
                                                            }}>
                                                                Упаковок: {basket[row._id]?(basket[row._id].consignment/(row.packaging?row.packaging:1)).toFixed(1):0}
                                                            </div>
                                                            </>
                                                            :
                                                            null
                                                    }
                                                </div>
                                            </div>
                                            <br/>
                                            <Divider/>
                                            <br/>
                                        </div>
                                )
                            }
                        )
                    }
                </CardContent>
            </Card>
            <div style={{height: 70}}/>
            <div className={isMobileApp?classes.bottomBasketM:classes.bottomBasketD}>
                <div className={isMobileApp?classes.allPriceM:classes.allPriceD}>
                    <div className={isMobileApp?classes.value:classes.priceAllText}>Общая стоимость</div>
                    <div className={classes.row} style={{alignItems: 'baseline'}}>
                        <div className={isMobileApp?classes.nameM:classes.priceAll}>{`${allPrice} сом`}</div>
                        {
                            planClient?<>&nbsp;/&nbsp;<div style={{color: allPrice<planClient.visit?'orange':'green'}}>{planClient.visit} сом</div></>:null
                        }
                    </div>
                </div>
                <div className={isMobileApp?classes.buyM:classes.buyD} onClick={async ()=>{
                    if(allPrice>0) {
                        if(client&&client._id) {
                            /*let proofeAddress = client.address[0]&&client.address[0][0]&&client.address[0][0].length > 0&&client.address[0][1]&&client.address[0][1].length > 0
                            if (
                                client._id && proofeAddress && client.name && client.name.length > 0 && client.phone && client.phone.length > 0
                            ) {*/
                                setMiniDialog('Купить', <BuyBasket
                                    geo={geo}
                                    agent={true}
                                    client={client}
                                    basket = {Object.values(basket)}
                                    allPrice={allPrice}
                                    organization={organization}/>)
                                showMiniDialog(true)
                            /*}
                            else {
                                Router.push(`/client/${client._id}`)
                            }*/
                        }
                        else
                            showSnackBar('Пожалуйста выберите клиента')
                    }
                    else
                        showSnackBar('Добавьте товар в корзину')
                }}>
                    КУПИТЬ
                </div>
            </div>
        </App>
    )
})

Catalog.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['агент', 'суперагент', 'экспедитор', 'суперорганизация', 'организация', 'менеджер', 'суперэкспедитор'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    await deleteBasketAll(ctx.req?await getClientGqlSsr(ctx.req):undefined)
    let brands = ctx.store.getState().user.profile.organization?(await getBrands({organization: ctx.store.getState().user.profile.organization, search: '', sort: '-priotiry'}, ctx.req?await getClientGqlSsr(ctx.req):undefined)).brands:[]
    let normalPrices = {}
    for(let i=0; i<brands.length; i++){
        normalPrices[brands[i]._id] = brands[i].price
    }
    let client = ctx.query.client?(await getClient({_id: ctx.query.client}, ctx.req?await getClientGqlSsr(ctx.req):undefined)).client:undefined
    if(ctx.store.getState().user.profile.organization&&ctx.query.client){
        const _specialPrices = await getSpecialPriceClients({client: ctx.query.client, organization: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined)
        const specialPrices = {}
        for(let i=0; i<_specialPrices.length; i++){
            specialPrices[_specialPrices[i].item._id] = _specialPrices[i].price
        }
        const _specialPriceCategories = await getSpecialPriceCategories({client: ctx.query.client, organization: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined)
        const specialPriceCategories = {}
        for(let i=0; i<_specialPriceCategories.length; i++){
            specialPriceCategories[_specialPriceCategories[i].item._id] = _specialPriceCategories[i].price
        }
        for(let i=0; i<brands.length; i++){
            if(isNotEmpty(specialPrices[brands[i]._id]))
                brands[i].price = specialPrices[brands[i]._id]
            else if(isNotEmpty(specialPriceCategories[brands[i]._id]))
                brands[i].price = specialPriceCategories[brands[i]._id]
        }
    }
    return {
        data: {
            brands,
            organization: {_id: ctx.store.getState().user.profile.organization},
            client,
            ...await getBrandOrganizations({search: '', filter: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
            normalPrices
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
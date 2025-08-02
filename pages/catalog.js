import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../src/styleMUI/catalog/catalog'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import {checkInt, checkFloat, isNotEmpty, unawaited} from '../src/lib';
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
import {getDiscountClient} from '../src/gql/discountClient';
import Info from '@material-ui/icons/Info';
import IconButton from '@material-ui/core/IconButton';

const Catalog = React.memo((props) => {
    const {search, isMobileApp} = props.app;
    const classes = pageListStyle();
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {showSnackBar} = props.snackbarActions;
    const {profile} = props.user;
    const {data} = props;
    //первый рендер
    const initialRender = useRef(true);
    //лимиты клиента
    let [limitItemClient, setLimitItemClient] = useState({});
    //остаток клиента
    let [stockClient, setStockClient] = useState({});
    //список товаров
    let [brands, setBrands] = useState(data.brands);
    let [list, setList] = useState([]);
    //клиент
    let [client, setClient] = useState(data.client);
    let handleClient = async (client) => {
        setClient(client)
        setBasket({})
        unawaited(deleteBasketAll)
        setOpen(false)
    };
    const [clients, setClients] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const handleChange = event => setInputValue(event.target.value);
    const searchTimeOutClient = useRef(null);
    useEffect(() => {
        if(inputValue.length < 3) {
            setClients([]);
            if(open)
                setOpen(false)
            if(loading)
                setLoading(false)
        }
        else {
            if(!loading)
                setLoading(true)
            if(searchTimeOutClient.current)
                clearTimeout(searchTimeOutClient.current)
            searchTimeOutClient.current = setTimeout(async () => {
                setClients(await getClients({search: inputValue, sort: '-name', filter: 'Включенные', catalog: true}))
                if(!open)
                    setOpen(true)
                setLoading(false)
            }, 500)
        }
    }, [inputValue]);
    //план клиента
    let [planClient, setPlanClient] = useState(null);
    //корзина
    const [basket, setBasket] = useState({});
    //организация
    let [organization, setOrganization] = useState(null);
    const handleOrganization = async (newOrganization) => {
        //очистить корзину суперагента
        if(
            !profile.organization&&(
                (organization?organization.organization?organization.organization._id:organization._id:null)!==
                (newOrganization.organization?newOrganization.organization._id:newOrganization._id)
            )
        ) {
            setBasket({})
            unawaited(deleteBasketAll)
        }
        //нет организации
        else if(!newOrganization)
            newOrganization = {_id: profile.organization}
        //получаем список товаров
        if(newOrganization)
            brands = await getBrands({organization: newOrganization._id, search, sort: '-priotiry'})
        else
            brands = []
        setBrands([...brands]);
        //прокручиваем вверх
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant'});
        setPagination(100);
        //задаем организацию
        setOrganization({...newOrganization})
    };
    //цена корзины
    let [allPrice, setAllPrice] = useState(0);
    //изменение клиента или списка товаров
    useEffect(() => {(async () => {
        //лимиты клиента
        limitItemClient = {}
        //остатки клиента
        stockClient = {}
        //план клиента
        planClient = null
        //если задан клиент
        if(client&&organization) {
            //данные
            // eslint-disable-next-line no-undef
            let [limitItemClients, stocks, planClientData, specialPricesData, specialPriceCategoriesData, discountClient] = await Promise.all([
                getLimitItemClients({client: client._id, organization: organization._id}),
                getStocks({client: client._id, search: '', organization: organization._id}),
                getPlanClient({client: client._id, organization: organization._id}),
                getSpecialPriceClients({client: client._id, organization: organization._id}),
                getSpecialPriceCategories({category: client.category, organization: organization._id}),
                getDiscountClient({client: client._id, organization: organization._id})
            ]);
            //план клиента
            planClient = planClientData
            //перебор лимитов
            if(limitItemClients&&limitItemClients.length)
                for(const element of limitItemClients)
                    limitItemClient[element.item._id] = element.limit
            //перебор остатков
            if(stocks&&stocks.length)
                for(const stock of stocks)
                    stockClient[stock.item._id] = stock.count
            //спец цена клиента
            const specialPrices = {}
            for(const specialPrice of specialPricesData)
                specialPrices[specialPrice.item._id] = specialPrice.price
            //спец цена категории
            const specialPriceCategories = {}
            for(const specialPriceCategory of specialPriceCategoriesData)
                specialPriceCategories[specialPriceCategory.item._id] = specialPriceCategory.price
            //скидка
            const discount = discountClient?discountClient.discount:0
            //перебор списка товаров и задание цены
            setBrands(brands => {
                for(const brand of brands) {
                    //price
                    if(isNotEmpty(specialPrices[brand._id]))
                        brand.price = specialPrices[brand._id]
                    else if(isNotEmpty(specialPriceCategories[brand._id]))
                        brand.price = specialPriceCategories[brand._id]
                    brand.price = checkFloat(brand.price-brand.price/100*discount)
                    //maxcount
                    if(isNotEmpty(stockClient[brand._id])&&isNotEmpty(limitItemClient[brand._id]))
                        brand.maxCount = stockClient[brand._id]<limitItemClient[brand._id]?stockClient[brand._id]:limitItemClient[brand._id]
                    else if(isNotEmpty(stockClient[brand._id]))
                        brand.maxCount = stockClient[brand._id]
                    else if(isNotEmpty(limitItemClient[brand._id]))
                        brand.maxCount = limitItemClient[brand._id]
                }
                return [...brands]
            });
        }
        setPlanClient(planClient)
        setLimitItemClient({...limitItemClient})
        setStockClient({...stockClient})
    })()}, [client, organization])
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
    //увеличение
    const increment = (idx) => {
        const item = list[idx]
        const basketItem = basket[item._id]||{_id: item._id, count: 0, allPrice: 0}
        basketItem.count = checkInt(basketItem.count) + (item.apiece?1:(item.packaging?item.packaging:1))
        if(basketItem.count<0)
            basketItem.count = 0
        if(isNotEmpty(item.maxCount)&&basketItem.count>item.maxCount)
            basketItem.count = item.maxCount
        basketItem.allPrice = checkFloat(basketItem.count*item.price)
        setBasket({...basket, [item._id]: basketItem})
    }
    //уменьшение
    const decrement = (idx) => {
        const item = list[idx]
        const basketItem = basket[item._id]
        if(basketItem) {
            if(basketItem.count>0) {
                basketItem.count = checkInt(basketItem.count) - (item.apiece?1:(item.packaging?item.packaging:1))
                if(basketItem.count<0)
                    basketItem.count = 0
                basketItem.allPrice = checkFloat(basketItem.count*item.price)
            }
            else if(basketItem.count<0)
                basketItem.count = 0
            setBasket({...basket, [item._id]: basketItem})
        }
    }
    //изменение количества напрямую
    const setBasketChange = (idx, count) => {
        const item = list[idx]
        const basketItem = basket[item._id]||{_id: item._id, count: 0, allPrice: 0}
        basketItem.count = checkInt(count)
        if(isNotEmpty(item.maxCount)&&basketItem.count>item.maxCount)
            basketItem.count = item.maxCount
        basketItem.allPrice = checkFloat(basketItem.count*item.price)
        setBasket({...basket, [item._id]: basketItem})
    }
    //изменить упаковок
    const setPackage = (idx, count) => {
        const item = list[idx]
        const basketItem = basket[item._id]||{_id: item._id, count: 0, allPrice: 0}
        basketItem.count = count*(item.packaging?item.packaging:1)
        if(isNotEmpty(item.maxCount)&&basketItem.count>item.maxCount)
            basketItem.count = item.maxCount
        basketItem.allPrice = checkFloat(basketItem.count*item.price)
        setBasket({...basket, [item._id]: basketItem})
    }
    //первозапуск и сохранение корзины
    useEffect(() => {
        if(initialRender.current) {
            //нахождение организации пользователя
            if(profile.organization)
                setOrganization(data.brandOrganizations.find(elem=>elem._id===profile.organization))
            //возобнавление корзины
            if(sessionStorage.catalog&&sessionStorage.catalog!=='{}')
                setBasket(JSON.parse(sessionStorage.catalog))
            //первозапуск окончен
            initialRender.current = false;
        }
        else {
            sessionStorage.catalog = JSON.stringify(basket)
            allPrice = 0
            for (const key in basket) allPrice += basket[key].allPrice
            setAllPrice(checkFloat(allPrice))
        }
    }, [basket])
    //пагинация
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [pagination, list])
    //поиск
    useEffect(() => {
        setList([...brands.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))])
    }, [search, brands])
    //рендер
    return (
        <App checkPagination={checkPagination} searchShow pageName='Каталог'>
            <Head>
                <title>Каталог</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row} style={{width: '100%'}}>
                        {
                            data.client?
                                <TextField
                                    label='Клиент'
                                    variant='outlined'
                                    value={data.client.name}
                                    className={classes.input}
                                    inputProps={{readOnly: true}}
                                />
                                :
                                <Autocomplete
                                    onClose={()=>setOpen(false)}
                                    open={open}
                                    disableOpenOnFocus
                                    className={classes.input}
                                    options={clients}
                                    getOptionLabel={option => `${option.address&&option.address[0]?`${option.address[0][2]?`${option.address[0][2]}, `:''}${option.address[0][0]}`:''}`}
                                    onChange={(event, newValue) => handleClient(newValue)}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField {...params} label='Выберите клиента' fullWidth variant='outlined'
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
                            client?
                                <IconButton onClick={() => window.open(`/client/${client._id}`, '_blank')}>
                                    <Info/>
                                </IconButton>
                                :
                                null
                        }
                    </div>
                    {
                        planClient&&planClient.current&&planClient.month?
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
                                        <TextField {...params} label='Выберите организацию' fullWidth variant='outlined'/>
                                    )}
                                />
                            </>
                            :null

                    }
                    {
                        organization&&organization.catalog?
                            <Button className={classes.input} onClick={() => window.open(organization.catalog, '_blank')} size='small' color='primary'>
                                Открыть каталог
                            </Button>
                            :
                            null
                    }
                    {
                        list.map((row, idx) => {
                                let price
                                if(basket[row._id]&&basket[row._id].allPrice)
                                    price = basket[row._id].allPrice
                                else
                                    price = row.price
                                if(idx<pagination)
                                    return(
                                        <div key={row._id}>
                                            <div className={classes.line}>
                                                <img className={classes.media} src={row.image}/>
                                                <div className={classes.column} style={{width: 'calc(100% - 142px)'}}>
                                                    <div className={classes.value}>{row.name}</div>
                                                    <b className={classes.value}>
                                                        {`${price} сом`}
                                                    </b>
                                                    <div className={classes.line}>
                                                        <div className={classes.counter}>
                                                            <div className={classes.counterbtn} onClick={() => decrement(idx)}>
                                                                –
                                                            </div>
                                                            <input readOnly={!row.apiece} type={isMobileApp?'number':'text'} className={classes.counternmbr}
                                                                   value={basket[row._id]?basket[row._id].count:''} onChange={(event) => setBasketChange(idx, event.target.value)}/>
                                                            <div className={classes.counterbtn} onClick={() => increment(idx)}>
                                                                +
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={classes.row}>
                                                        <div className={classes.addPackaging} style={{color: '#ffb300'}} onClick={() => {
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
                <div className={isMobileApp?classes.buyM:classes.buyD} onClick={() => {
                    if(allPrice) {
                        if(client) {
                            setMiniDialog('Купить', <BuyBasket
                                geo={geo.current}
                                agent
                                client={client}
                                basket = {Object.values(basket)}
                                allPrice={allPrice}
                                organization={organization}/>)
                            showMiniDialog(true)
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
    const profile = ctx.store.getState().user.profile;
    const organization = profile.organization
    if(!['агент', 'суперагент', 'экспедитор', 'суперорганизация', 'организация', 'менеджер', 'суперэкспедитор'].includes(profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    //данные
    unawaited(() => deleteBasketAll(getClientGqlSsr(ctx.req)))
    // eslint-disable-next-line no-undef
    const [brands, brandOrganizations, client] = await Promise.all([
        organization?getBrands({organization, search: '', sort: '-priotiry'}, getClientGqlSsr(ctx.req)):null,
        getBrandOrganizations({search: '', filter: ''}, getClientGqlSsr(ctx.req)),
        ctx.query.client?getClient(ctx.query.client, getClientGqlSsr(ctx.req)):null
    ])
    return {
        data: {
            brands, client, brandOrganizations
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
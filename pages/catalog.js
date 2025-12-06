import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../src/styleMUI/catalog/catalog'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import {checkInt, checkFloat, isNotEmpty, formatAmount, getClientTitle} from '../src/lib';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../redux/actions/mini_dialog'
import * as snackbarActions from '../redux/actions/snackbar'
import Router, {useRouter} from 'next/router'
import BuyBasket from '../components/dialog/BuyBasket'
import BuyBasket1 from '../components/dialog/BuyBasket1'
import SetPackage from '../components/dialog/SetPackage'
import { getClient, getClients } from '../src/gql/client'
import TextField from '@material-ui/core/TextField';
import { getClientGqlSsr } from '../src/getClientGQL'
import Autocomplete from '@material-ui/lab/Autocomplete';
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
import {getFhoClient} from '../src/gql/fhoClient';
import Confirmation from '../components/dialog/Confirmation';
import Table from '../components/table/catalog';

const Catalog = React.memo((props) => {
    const classes = pageListStyle();
    const router = useRouter();
    //props
    const {search, isMobileApp, district} = props.app;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {showSnackBar} = props.snackbarActions;
    const {profile} = props.user;
    const {data} = props;
    //ref
    const contentRef = useRef();
    const initialRender = useRef(true);
    const searchTimeOutClient = useRef(null);
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
        //задаем клиента
        setClient(client)
        //полностью прописываем ввод
        handleInputValue(client?getClientTitle(client):'', false)
        //сохраняем или удаляем клиента
        if(client)
            sessionStorage.client = JSON.stringify(client)
        else
            sessionStorage.removeItem('client')
        //закрываем поиск
        setOpen(false)
    };
    const [clients, setClients] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const handleInputValue = (inputValue, search = true) => {
        setInputValue(inputValue);
        if(search) {
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
                if (searchTimeOutClient.current)
                    clearTimeout(searchTimeOutClient.current)
                searchTimeOutClient.current = setTimeout(async () => {
                    setClients(await getClients({
                        search: inputValue,
                        sort: '-name',
                        filter: 'Включенные',
                        catalog: true, district
                    }))
                    if (!open)
                        setOpen(true)
                    setLoading(false)
                }, 500)
            }
        }
    }
    //план клиента
    let [planClient, setPlanClient] = useState(null);
    //корзина
    const [basket, setBasket] = useState({});
    //организация
    let [organization, setOrganization] = useState(null);
    const handleOrganization = async (newOrganization) => {
        //нет организации
        if(!newOrganization)
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
                getStocks({unlimited: false, client: client._id, search: '', organization: organization._id}),
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
            if(specialPricesData&&specialPricesData.length)
                for(const specialPrice of specialPricesData)
                    specialPrices[specialPrice.item._id] = specialPrice.price
            //спец цена категории
            const specialPriceCategories = {}
            if(specialPriceCategoriesData&&specialPriceCategoriesData.length)
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
                    //если есть в корзине
                    if(basket[brand._id]) {
                        /*if(!brand.maxCount)
                            delete basket[brand._id];
                        else {*/
                        if (isNotEmpty(brand.maxCount) && basket[brand._id].count > brand.maxCount)
                            basket[brand._id].count = brand.maxCount
                        basket[brand._id].allPrice = checkFloat(basket[brand._id].count * brand.price)
                        /*}*/
                    }
                }
                setBasket({...basket})
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
            //возобновление корзины
            if(sessionStorage.catalog&&sessionStorage.catalog!=='{}')
                setBasket(JSON.parse(sessionStorage.catalog))
            //возобновление клиента
            if(!data.client&&sessionStorage.client&&sessionStorage.client!=='null') {
                client = JSON.parse(sessionStorage.client)
                setClient(client)
                handleInputValue(getClientTitle(client), false)
            }
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
        if(brands&&Array.isArray(brands))
            setList([...brands.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))])
    }, [search, brands])
    //изображения фхо
    const [fhoClient, setFhoClient] = useState(null);
    useEffect(() => {if(isMobileApp) (async () => {
        let fhoClient = null
        if(client)
            fhoClient = await getFhoClient({_id: client._id})
        setFhoClient(fhoClient)
    })()}, [client])
    //clearBasket
    const clearBasket = () => {
        setMiniDialog('Очистить корзину?', <Confirmation action={() => setBasket({})}/>)
        showMiniDialog(true)
    }
    //double
    const double = contentRef.current&&contentRef.current.offsetWidth>=1150
    //middleList
    const middleList = list?Math.ceil(list.length/2):0
    //рендер
    return (
        <App showDistrict checkPagination={checkPagination} clearBasket={clearBasket} searchShow pageName='Каталог'>
            <Head>
                <title>Каталог</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}} ref={contentRef}>
                    <div style={!isMobileApp?{width: '100%', display: 'flex', flexDirection: 'row'}:{}}>
                        <div style={{width: '100%'}}>
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
                                            onClose={() =>setOpen(false)}
                                            open={open}
                                            disableOpenOnFocus
                                            value={client}
                                            inputValue={inputValue}
                                            className={classes.input}
                                            options={clients}
                                            getOptionLabel={option => getClientTitle(option)}
                                            onChange={(event, newValue) => handleClient(newValue)}
                                            noOptionsText='Ничего не найдено'
                                            renderInput={params => (
                                                <TextField {...params} label='Выберите клиента' fullWidth variant={isMobileApp?'outlined':'standard'}
                                                           onChange={event => handleInputValue(event.target.value)}
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
                                        !isMobileApp?<div style={{width: 10}}/>:null
                                }
                            </div>
                            {
                                isMobileApp&&fhoClient||planClient&&planClient.current&&planClient.month?
                                    <>
                                        {isMobileApp?<Divider style={{marginTop: 10, marginBottom: 10}}/>:null}
                                        {planClient&&planClient.current&&planClient.month?<>
                                            <div className={classes.row} style={{justifyContent: 'center'}}>
                                                <div className={classes.nameField} style={{marginBottom: 0}}>
                                                    План на месяц:&nbsp;
                                                </div>
                                                <div className={classes.valueField} style={{marginBottom: 0}}>
                                                    <div className={classes.row}>
                                                        {formatAmount(planClient.current)} сом / <div style={{color: planClient.current<planClient.month?'orange':'green'}}>{formatAmount(planClient.month)} сом</div>
                                                    </div>
                                                </div>
                                            </div></>:null}
                                        {isMobileApp&&fhoClient&&planClient&&planClient.current&&planClient.month?<Divider style={{marginTop: 10, marginBottom: 10}}/>:null}
                                        {isMobileApp&&fhoClient?<center style={{ fontWeight: 'bold', width: '100%', cursor: 'pointer', color: fhoClient.required?'red':'#ffb300'}} onClick={() => router.push(`/fhoclient/${fhoClient._id}`)}>
                                            📷&nbsp;Загрузить фото полки или фхо
                                        </center>:null}
                                        {isMobileApp?<Divider style={{marginTop: 10, marginBottom: 10}}/>:<div style={{height: 10}}/>}
                                    </>
                                    :
                                    <div style={{height: 10}}/>
                            }
                        </div>
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
                                            <TextField {...params} label='Выберите организацию' fullWidth variant={isMobileApp?'outlined':'standard'}/>
                                        )}
                                    />
                                </>
                                :null

                        }
                    </div>
                    {
                        isMobileApp&&organization&&organization.catalog?
                            <Button className={classes.input} onClick={() => window.open(organization.catalog, '_blank')} size='small' color='primary'>
                                Открыть каталог
                            </Button>
                            :
                            null
                    }
                    {
                        isMobileApp?
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
                                                        {formatAmount(price)} сом
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
                                            <Divider style={{marginTop: 10, marginBottom: 10}}/>
                                        </div>
                                    )
                            })
                            :
                            <div style={{display: 'flex', flexDirection: 'row'}}>
                                <Table double={double} contentRef={contentRef} list={double?list.slice(0, middleList):list} stockClient={stockClient} basket={basket} setBasketChange={setBasketChange} setPackage={setPackage}/>
                                {double?<Table  middleList={middleList} double={double} contentRef={contentRef} list={list.slice(middleList)} stockClient={stockClient} basket={basket} setBasketChange={setBasketChange} setPackage={setPackage}/>:null}
                            </div>
                    }
                </CardContent>
            </Card>
            <div style={{height: 70}}/>
            <div className={isMobileApp?classes.bottomBasketM:classes.bottomBasketD}>
                <div className={isMobileApp?classes.allPriceM:classes.allPriceD} style={!isMobileApp?{display: 'flex'}:{}}>
                    <div className={isMobileApp?classes.value:classes.priceAllText}>Итого{!isMobileApp?<>:&nbsp;</>:null}</div>
                    <div className={classes.row} style={{alignItems: 'baseline'}}>
                        <div className={isMobileApp?classes.nameM:classes.priceAll}>{formatAmount(allPrice)} сом</div>
                        {planClient?<>&nbsp;/&nbsp;<div style={{color: allPrice<planClient.visit?'orange':'green'}}>{formatAmount(planClient.visit)} сом</div></>:null}
                    </div>
                </div>
                <div className={isMobileApp?classes.buyM:classes.buyD} onClick={() => {
                    if(fhoClient&&fhoClient.required) showSnackBar('Сначала загрузите фото ФХО')
                    else {
                        if (allPrice) {
                            if (client) {
                                setMiniDialog('Купить', <BuyBasket1
                                    geo={geo.current}
                                    agent
                                    client={client}
                                    basket={Object.values(basket)}
                                    allPrice={allPrice}
                                    organization={organization}/>)
                                showMiniDialog(true)
                            } else
                                showSnackBar('Пожалуйста выберите клиента')
                        } else
                            showSnackBar('Добавьте товар в корзину')
                    }
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
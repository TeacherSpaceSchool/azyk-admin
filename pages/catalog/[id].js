import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../src/styleMUI/catalog/catalog'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import {checkInt, checkFloat, isNotEmpty, isEmpty, formatAmount, mainColor} from '../../src/lib';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import {getBrands} from '../../src/gql/items';
import {getSpecialPriceClients} from '../../src/gql/specialPrice';
import Router from 'next/router'
import BuyBasketV1 from '../../components/dialog/BuyBasket/v1.js'
import BuyBasketV2 from '../../components/dialog/BuyBasket/v2.js'
import Image from '../../components/dialog/Image'
import { useRouter } from 'next/router'
import { getClient } from '../../src/gql/client'
import { getClientGqlSsr } from '../../src/getClientGQL'
import Divider from '@material-ui/core/Divider';
import initialApp from '../../src/initialApp'
import { getOrganization } from '../../src/gql/organization'
import {getAdss} from '../../src/gql/ads'
import {getСlientDistrict} from '../../src/gql/district';
import {getSpecialPriceCategories} from '../../src/gql/specialPriceCategory';
import {getLimitItemClients} from '../../src/gql/limitItemClient';
import {getStocks} from '../../src/gql/stock';
import {getDiscountClient} from '../../src/gql/discountClient';
import {getFhoClient} from '../../src/gql/fhoClient';
import Ads from '../../components/dialog/Ads';
import Help from '@material-ui/icons/Help';

const Catalog = React.memo((props) => {
    const classes = pageListStyle();
    const router = useRouter()
    //props
    const {setMiniDialog, showMiniDialog, setFullDialog, showFullDialog} = props.mini_dialogActions;
    const {showSnackBar} = props.snackbarActions;
    const {profile} = props.user;
    const {data} = props;
    const {isMobileApp, search} = props.app;
    //ref
    const initialRender = useRef(true);
    //limitItemClient
    const [limitItemClient, setLimitItemClient] = useState({});
    //stockClient
    const [stockClient, setStockClient] = useState({});
    //adss
    const [adss, setAdss] = useState([]);
    //client
    const [client, setClient] = useState(null);
    //изображения фхо
    const [fhoClient, setFhoClient] = useState(null);
    //list
    const [brands, setBrands] = useState(data.brands);
    const [list, setList] = useState([]);
    useEffect(() => {
        if(brands&&Array.isArray(brands))
            setList([...brands.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))])
    }, [search, brands])
    //allPrice
    let [allPrice, setAllPrice] = useState(0);
    //basket
    const [basket, setBasket] = useState({});
    useEffect(() => {
        if(sessionStorage.catalog&&sessionStorage.catalog!=='{}'&&sessionStorage.catalogID===router.query.id)
            setBasket(JSON.parse(sessionStorage.catalog))
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
    let addPackaging= async(idx) => {
        const item = list[idx]
        if(item.packaging) {
            const basketItem = basket[item._id]||{_id: item._id, count: 0, allPrice: 0}
            basketItem.count = (checkInt(basketItem.count)/item.packaging+1)*item.packaging
            if(isNotEmpty(item.maxCount)&&basketItem.count>item.maxCount)
                basketItem.count = item.maxCount
            basketItem.allPrice = checkFloat(basketItem.count*item.price)
            setBasket({...basket, [item._id]: basketItem})
        }
    }
    useEffect(() => {
        if(initialRender.current) {
            initialRender.current = false;
        } else {
            sessionStorage.catalogID = router.query.id
            sessionStorage.catalog = JSON.stringify(basket)
            let keys = Object.keys(basket)
            allPrice = 0
            for (let i = 0; i < keys.length; i++) {
                allPrice += basket[keys[i]].allPrice
            }
            setAllPrice(checkFloat(allPrice))
        }
    }, [basket])
    //pagination
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [pagination, list])
    //limit list
    useEffect(() => {(async () => {
            //данные
            // eslint-disable-next-line no-undef
            let [limitItemClients, stocks, specialPricesData, specialPriceCategoriesData, discountClient] = await Promise.all([
                getLimitItemClients({client: profile.client, organization: router.query.id}),
                getStocks({unlimited: false, client: profile.client, search: '', organization: router.query.id}),
                getSpecialPriceClients({client: profile.client, organization: router.query.id}),
                getSpecialPriceCategories({client: profile.client, organization: router.query.id}),
                getDiscountClient({client: profile.client, organization: router.query.id})
            ]);
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
            for(const specialPriceCategory of specialPriceCategoriesData) {
                specialPriceCategories[specialPriceCategory.item._id] = specialPriceCategory.price
            }
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
            setLimitItemClient(limitItemClient)
            setStockClient(stockClient)
    })()}, [])
    //initialData
    useEffect(() => {(async () => {
        //данные
        // eslint-disable-next-line no-undef
        let [adss, client, fhoClient] = await Promise.all([
            getAdss({search: '', organization: router.query.id}),
            getClient(profile.client),
            getFhoClient({_id: profile.client, organization: router.query.id})
        ]);
        setAdss(adss)
        setClient(client)
        setFhoClient(fhoClient)
    })()}, [])
    //
    let [targetAds, setTargetAds] = useState(null);
    useEffect(() => {
        targetAds = null
        if(adss&&adss.length) {
            const sortedAdss = adss.sort((a, b) => a.targetPrice - b.targetPrice)
            const targetAdsIdx = sortedAdss.findIndex(sortedAds => sortedAds.targetPrice > allPrice);
            if(targetAdsIdx!==-1) {
                targetAds = {
                    idx: targetAdsIdx+1,
                    neededAmount: checkInt(sortedAdss[targetAdsIdx].targetPrice - allPrice),
                    ...sortedAdss[targetAdsIdx]
                }
            }
        }
        setTargetAds(targetAds)
    }, [adss, allPrice])
    //render
    return (
        <App defaultOpenSearch={router.query.search} checkPagination={checkPagination} searchShow pageName={data.organization.name}>
            <Head>
                <title>{data.organization.name}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    {/*isMobileApp&&fhoClient&&!fhoClient.images.length?<>
                        <center style={{ fontWeight: 'bold', width: '100%', cursor: 'pointer'}}
                                onClick={() => router.push(`/fhoclient/${fhoClient._id}`)}>
                            📸 Добавьте фото полки или ФХО — и получите 🎁 упаковку воды Tien Shan Legend 1.0L! 💧✨
                        </center>
                        <Divider style={{marginTop: 10, marginBottom: 10}}/>
                    </>:null*/}
                    {
                        data.district?
                            <>
                                {
                                    data.district.agent&&data.district.agent.name&&data.district.agent.phone&&data.district.agent.phone[0]?
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>
                                                Агент:&nbsp;
                                            </div>
                                            <a href={`tel:${data.district.agent.phone[0]}`} className={classes.valueField}>
                                                {data.district.agent.name}
                                            </a>
                                        </div>
                                        :
                                        null
                                }
                                {
                                    data.district.manager&&data.district.manager.name&&data.district.manager.phone&&data.district.manager.phone[0]?
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>
                                                Супервайзер:&nbsp;
                                            </div>
                                            <a href={`tel:${data.district.manager.phone[0]}`} className={classes.valueField}>
                                                {data.district.manager.name}
                                            </a>
                                        </div>
                                        :
                                        null
                                }
                                {
                                    data.district.forwarder&&data.district.forwarder.name&&data.district.forwarder.phone&&data.district.forwarder.phone[0]?
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>
                                                Экспедитор:&nbsp;
                                            </div>
                                            <a href={`tel:${data.district.forwarder.phone[0]}`} className={classes.valueField}>
                                                {data.district.forwarder.name}
                                            </a>
                                        </div>
                                        :
                                        null
                                }
                                <Divider style={{marginBottom: 10}}/>
                            </>
                            :
                            null
                    }
                    {
                        list?
                            list.map((row, idx) => {
                                let price
                                if(basket[row._id]&&basket[row._id].allPrice)
                                    price = basket[row._id].allPrice
                                else
                                    price = row.price
                                if(idx<pagination&&(isEmpty(stockClient[row._id])||stockClient[row._id]>0))
                                    return(
                                        <div key={row._id} style={{width: '100%'}}>
                                            <div className={classes.line}>
                                                <img className={classes.media} style={{border: `solid ${row.hit? 'yellow': row.latest? 'green': 'transparent'} 1px`}} src={row.image} onClick={() => {
                                                    setFullDialog(row.name, <Image imgSrc={row.image}/>)
                                                    showFullDialog(true)
                                                }}/>
                                                <div className={classes.column} style={{width: 'calc(100% - 142px)'}}>
                                                    <div className={classes.value}>{row.name}</div>
                                                    <b className={classes.value}>
                                                        {formatAmount(price)} сом
                                                    </b>
                                                    <div className={classes.line}>
                                                        <div className={classes.counter}>
                                                            <div className={classes.counterbtn} onClick={() => decrement(idx)}>–
                                                            </div>
                                                            <input readOnly={!row.apiece} type={isMobileApp?'number':'text'} className={classes.counternmbr}
                                                                   value={basket[row._id]?basket[row._id].count:''} onChange={(event) => setBasketChange(idx, event.target.value)}/>
                                                            <div className={classes.counterbtn} onClick={() => increment(idx)}>+
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {row.apiece?
                                                        <div className={classes.addPackaging} style={{color: '#ffb300'}} onClick={() => addPackaging(idx)}>
                                                            Добавить упаковку
                                                        </div>
                                                        :
                                                        <div className={classes.addPackaging} style={{color: '#ffb300'}}>
                                                            Упаковок: {basket[row._id]?(basket[row._id].count/row.packaging).toFixed(1):0}
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            <Divider style={{marginTop: 10, marginBottom: 10}}/>
                                        </div>
                                    )
                            })
                            :
                            null
                    }
                </CardContent>
            </Card>
            <div style={{height: 70}}/>
            <div className={isMobileApp?classes.bottomBasketM:classes.bottomBasketD}>
                <div className={isMobileApp?classes.allPriceM:classes.allPriceD}>
                    <div className={isMobileApp?classes.value:classes.priceAllText}>
                        {targetAds?<div style={{display: 'flex', alignItems: 'center'}} onClick={() => {
                            setMiniDialog(`Акция №${targetAds.idx}`, <Ads ads={targetAds}/>)
                            showMiniDialog(true)
                        }}>До&nbsp;<b>{targetAds.idx}й</b>&nbsp;акции&nbsp;<b style={{color: mainColor}}>{targetAds.neededAmount}</b>&nbsp;сом&nbsp;<Help fontSize='small' style={{color: 'grey'}}/></div>:'Общая стоимость'}
                    </div>
                    <div className={isMobileApp?classes.nameM:classes.priceAll}>
                        {formatAmount(allPrice)} сом
                    </div>
                </div>
                <div className={isMobileApp?classes.buyM:classes.buyD} onClick={() => {
                    if(allPrice>0) {
                        setMiniDialog('Купить', <BuyBasketV2
                            agent={false}
                            client={client}
                            basket = {Object.values(basket)}
                            allPrice={allPrice}
                            adss={adss}
                            organization={data.organization}/>)
                        showMiniDialog(true)
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
    ctx.store.getState().app.sort = '-priotiry'
    if('client'!==ctx.store.getState().user.profile.role)
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    if(ctx.query.search) {
        ctx.store.getState().app.search = ctx.query.search
    }

    const search = ctx.query.search || ''
    const sort = ctx.store.getState().app.sort
    const gqlClient = getClientGqlSsr(ctx.req)

    // Все асинхронные запросы запускаются параллельно
    // eslint-disable-next-line no-undef
    const [brands, district, organization] = await Promise.all([
        getBrands({ organization: ctx.query.id, search, sort }, gqlClient),
        getСlientDistrict(ctx.query.id, getClientGqlSsr(ctx.req)),
        getOrganization(ctx.query.id, getClientGqlSsr(ctx.req)),
    ])
    return {
        data: {brands, district, organization}
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
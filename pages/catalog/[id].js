import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../src/styleMUI/catalog/catalog'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import {checkInt, checkFloat, isNotEmpty, isEmpty} from '../../src/lib';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import {getBrands} from '../../src/gql/items';
import {getSpecialPriceClients} from '../../src/gql/specialPrice';
import Router from 'next/router'
import BuyBasket from '../../components/dialog/BuyBasket'
import Image from '../../components/dialog/Image'
import { useRouter } from 'next/router'
import { getClient } from '../../src/gql/client'
import { getClientGqlSsr } from '../../src/getClientGQL'
import { deleteBasketAll } from '../../src/gql/basket';
import Divider from '@material-ui/core/Divider';
import initialApp from '../../src/initialApp'
import { getOrganization } from '../../src/gql/organization'
import {getAdss} from '../../src/gql/ads'
import {getСlientDistrict} from '../../src/gql/district';
import {getSpecialPriceCategories} from '../../src/gql/specialPriceCategory';
import {getLimitItemClients} from '../../src/gql/limitItemClient';
import {getStocks} from '../../src/gql/stock';

const Catalog = React.memo((props) => {
    const classes = pageListStyle();
    const { setMiniDialog, showMiniDialog, setFullDialog, showFullDialog } = props.mini_dialogActions;
    const { showSnackBar } = props.snackbarActions;
    const { data } = props;
    const router = useRouter()
    const { search, filter, sort } = props.app;
    const [list, setList] = useState(data.brands);
    const [basket, setBasket] = useState({});
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    const initialRender = useRef(true);
    const checkMaxCount = (idx) => {
        let maxCount
        if(isNotEmpty(data.stockClient[list[idx]._id])&&isNotEmpty(data.limitItemClient[list[idx]._id])) {
            maxCount = data.stockClient[list[idx]._id]<data.limitItemClient[list[idx]._id]?data.stockClient[list[idx]._id]:data.limitItemClient[list[idx]._id]
        }
        else if(isNotEmpty(data.stockClient[list[idx]._id])) {
            maxCount = data.stockClient[list[idx]._id]
        }
        else if(isNotEmpty(data.limitItemClient[list[idx]._id])) {
            maxCount = data.limitItemClient[list[idx]._id]
        }
        return maxCount
    }
    const getList = async ()=>{
        setList((await getBrands({organization: router.query.id, search, sort})).brands)
        setPagination(100);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(()=>{
        (async()=>{
            if(sessionStorage.catalog&&sessionStorage.catalog!=='{}'&&sessionStorage.catalogID===router.query.id){
                setBasket(JSON.parse(sessionStorage.catalog))
            }
        })()
    },[])
    useEffect(()=>{
        (async()=>{
            if(!initialRender.current) {
                await getList()
            }
        })()
    },[filter, sort])
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            } else {
                if(searchTimeOut)
                    clearTimeout(searchTimeOut)
                searchTimeOut = setTimeout(async()=>{
                    await getList()
                }, 500)
                setSearchTimeOut(searchTimeOut)

            }
        })()
    },[search])
    let [allPrice, setAllPrice] = useState(0);
    const { isMobileApp } = props.app;
    let increment = async (idx)=>{
        let id = list[idx]._id
        if(!basket[id])
            basket[id] = {_id: id, count: 0, allPrice: 0, consignment: 0}
        basket[id].count = checkInt(basket[id].count)
        basket[id].count+=list[idx].apiece?1:list[idx].packaging

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
                basket[id].count -= list[idx].apiece?1:list[idx].packaging
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
    let addPackaging= async(idx)=>{
        let id = list[idx]._id
        if(!basket[id])
            basket[id] = {_id: id, count: 0, allPrice: 0, consignment: 0}
        basket[id].count = checkInt(basket[id].count)
        if(list[idx].packaging){
            basket[id].count = (parseInt(basket[id].count/list[idx].packaging)+1)*list[idx].packaging

            const maxCount = checkMaxCount(idx)
            if(isNotEmpty(maxCount)&&basket[id].count>maxCount) {
                basket[id].count = maxCount
            }

            basket[id].allPrice = checkFloat(basket[id].count*list[idx].price)
            setBasket({...basket})
        }
    }
    let addPackagingConsignment = async(idx)=>{
        let id = list[idx]._id
        if(basket[id]){
            let consignment = (parseInt(basket[id].consignment/list[idx].packaging)+1)*list[idx].packaging
            if(consignment<=basket[id].count){
                basket[id].consignment = consignment
                setBasket({...basket})
            }
        }
    }
    useEffect(()=>{
        if(!initialRender.current) {
            sessionStorage.catalogID = router.query.id
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
    return (
        <App defaultOpenSearch={router.query.search} checkPagination={checkPagination} sorts={data?data.sortItem:undefined} searchShow={true} pageName={data.organization.name}>
            <Head>
                <title>{data.organization.name}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    {
                        data.clientDistrict?
                            <>
                                {
                                    data.clientDistrict.agent&&data.clientDistrict.agent.name&&data.clientDistrict.agent.phone[0]?
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>
                                                Агент:&nbsp;
                                            </div>
                                            <a href={`tel:${data.clientDistrict.agent.phone[0]}`} className={classes.valueField}>
                                                {data.clientDistrict.agent.name}
                                            </a>
                                        </div>
                                        :
                                        null
                                }
                                {
                                    data.clientDistrict.manager&&data.clientDistrict.manager.name&&data.clientDistrict.manager.phone[0]?
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>
                                                Супервайзер:&nbsp;
                                            </div>
                                            <a href={`tel:${data.clientDistrict.manager.phone[0]}`} className={classes.valueField}>
                                                {data.clientDistrict.manager.name}
                                            </a>
                                        </div>
                                        :
                                        null
                                }
                                {
                                    data.clientDistrict.ecspeditor&&data.clientDistrict.ecspeditor.name&&data.clientDistrict.ecspeditor.phone[0]?
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>
                                                Экспедитор:&nbsp;
                                            </div>
                                            <a href={`tel:${data.clientDistrict.ecspeditor.phone[0]}`} className={classes.valueField}>
                                                {data.clientDistrict.ecspeditor.name}
                                            </a>
                                        </div>
                                        :
                                        null
                                }
                                <Divider/>
                                <br/>
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
                                if(idx<pagination&&(isEmpty(data.stockClient[row._id])||data.stockClient[row._id]>0))
                                    return(
                                        <div style={{width: '100%'}}>
                                            <div className={classes.line}>
                                                <img className={classes.media} style={{border: `solid ${row.hit? 'yellow': row.latest? 'green': 'transparent'} 1px`}} src={row.image} onClick={()=>{
                                                    setFullDialog(row.name, <Image imgSrc={row.image}/>)
                                                    showFullDialog(true)
                                                }}/>
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
                                                        {
                                                            row.organization.consignation?
                                                                <>
                                                                    &nbsp;&nbsp;&nbsp;
                                                                    <div className={classes.showCons} style={{color: basket[row._id]&&basket[row._id].showConsignment?'#ffb300':'#000'}} onClick={()=>{
                                                                        showConsignment(idx)
                                                                    }}>
                                                                        КОНС
                                                                    </div>
                                                                </>
                                                                :
                                                                null
                                                        }
                                                    </div>
                                                    {row.apiece?
                                                        <div className={classes.addPackaging} style={{color: '#ffb300'}} onClick={()=>{
                                                            addPackaging(idx)
                                                        }}>
                                                            Добавить упаковку
                                                        </div>
                                                        :
                                                        <div className={classes.addPackaging} style={{color: '#ffb300'}}>
                                                            Упаковок: {basket[row._id]?(basket[row._id].count/row.packaging).toFixed(1):0}
                                                        </div>
                                                    }
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
                                                                    addPackagingConsignment(idx)
                                                                }}>
                                                                    Добавить упаковку
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
                            })
                            :
                            null
                    }
                </CardContent>
            </Card>
            <div style={{height: 70}}/>
            <div className={isMobileApp?classes.bottomBasketM:classes.bottomBasketD}>
                <div className={isMobileApp?classes.allPriceM:classes.allPriceD}>
                    <div className={isMobileApp?classes.value:classes.priceAllText}>Общая стоимость</div>
                    <div className={isMobileApp?classes.nameM:classes.priceAll}>{`${allPrice} сом`}</div>
                </div>
                <div className={isMobileApp?classes.buyM:classes.buyD} onClick={async ()=>{
                    if(allPrice>0) {
                        /*let proofeAddress = data.client.address[0]&&data.client.address[0][0].length > 0
                        if (
                            data.client._id && proofeAddress && data.client.name.length > 0 && data.client.phone.length > 0
                        ) {*/
                            setMiniDialog('Купить', <BuyBasket
                                agent={false}
                                client={data.client}
                                basket = {Object.values(basket)}
                                allPrice={allPrice}
                                adss={data.adss}
                                organization={data.organization}/>)
                            showMiniDialog(true)
                        /*}
                        else {
                            Router.push(`/client/${data.client._id}`)
                        }*/
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
    await deleteBasketAll(ctx.req?await getClientGqlSsr(ctx.req):undefined)
    if(ctx.query.search){
        ctx.store.getState().app.search = ctx.query.search
    }

    const { client, category } = ctx.store.getState().user.profile
    const organization = ctx.query.id
    const search = ctx.query.search || ''
    const sort = ctx.store.getState().app.sort
    const gqlClient = ctx.req ? await getClientGqlSsr(ctx.req) : undefined

// Все асинхронные запросы запускаются параллельно
    const [
        brandsRes,
        specialPrices,
        specialCategoryPrices,
        limitItemClientRes,
        stockRes
        // eslint-disable-next-line no-undef
    ] = await Promise.all([
        getBrands({ organization, search, sort }, gqlClient),
        getSpecialPriceClients({ client, organization }, gqlClient),
        getSpecialPriceCategories({ category, organization }, gqlClient),
        getLimitItemClients({ client, organization }, gqlClient),
        getStocks({ client, search: '', organization }, gqlClient)
    ])

    const brands = brandsRes.brands || []
// Обновляем цены по клиентским спецценам
    // eslint-disable-next-line no-undef
    const specialPriceMap = new Map(specialPrices.map(sp => [sp.item._id, sp.price]))
    for (const brand of brands) {
        if (specialPriceMap.has(brand._id)) {
            brand.price = specialPriceMap.get(brand._id)
        }
    }


// Обновляем цены по спецценам категории (перезаписывает клиентские)
    // eslint-disable-next-line no-undef
    const categoryPriceMap = new Map(specialCategoryPrices.map(sp => [sp.item._id, sp.price]))
    for (const brand of brands) {
        if (categoryPriceMap.has(brand._id)) {
            brand.price = categoryPriceMap.get(brand._id)
        }
    }


// Словарь лимитов на товары
    const limitItemClient = Object.fromEntries(
        limitItemClientRes.map(r => [r.item._id, r.limit])
    )


// Словарь остатков
    const stockClient = stockRes?.stocks
        ? Object.fromEntries(stockRes.stocks.map(s => [s.item._id, s.count]))
        : {}


    return {
        data: {
            brands,
            ...(ctx.store.getState().user.profile._id?await getClient({_id: ctx.store.getState().user.profile._id}, ctx.req?await getClientGqlSsr(ctx.req):undefined):{}),
            ...await getOrganization({_id: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
            ...await getСlientDistrict({organization: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
            ...await getAdss({search: '', organization: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
            limitItemClient,
            stockClient
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
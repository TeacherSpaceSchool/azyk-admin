import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import App from '../../layouts/App';
import pageListStyle from '../../src/styleMUI/client/clientList'
import {getClientsTrash, getClientsTrashSimpleStatistic} from '../../src/gql/client'
import {getOrdersTrash, getInvoicesTrashSimpleStatistic} from '../../src/gql/order'
import {getReturnedsTrash, getReturnedsTrashSimpleStatistic} from '../../src/gql/returned'
import {getEmploymentsTrash} from '../../src/gql/employment'
import {getOrganizationsTrash} from '../../src/gql/organization'
import {getAdssTrash} from '../../src/gql/ads'
import {getItemsTrash} from '../../src/gql/items'
import { connect } from 'react-redux'
import Router from 'next/router'
import { urlMain } from '../../redux/constants/other'
import { forceCheck } from 'react-lazyload';
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import CardClientPlaceholder from '../../components/client/CardClientPlaceholder'
import CardClient from '../../components/client/CardClient'
import CardOrder from '../../components/order/CardOrder'
import CardReturned from '../../components/returned/CardReturned'
import CardAds from '../../components/ads/CardAds'
import CardItem from '../../components/items/CardItem'
import CardOrganization from '../../components/organization/CardOrganization'
import CardEmployment from '../../components/employment/CardEmployment'
import LazyLoad from 'react-lazyload';
const height = 140;


const Trash = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    let [list, setList] = useState(data.clientsTrash);
    let [type, setType] = useState('Клиенты');
    let [simpleStatistic, setSimpleStatistic] = useState(['0']);
    let [paginationWork, setPaginationWork] = useState(true);
    const { search, filter } = props.app;
    let [pagination, setPagination] = useState(100);
    const checkPagination = async()=>{
        if(paginationWork){
            if(['Клиенты', 'Заказы', 'Возвраты'].includes(filter)){
                let addedList
                if(filter==='Клиенты')
                    addedList = (await getClientsTrash({search, skip: list.length})).clientsTrash
                else if(filter==='Заказы')
                    addedList = (await getOrdersTrash({search, skip: list.length})).invoicesTrash
                else if(filter==='Возвраты')
                    addedList = (await getReturnedsTrash({search, skip: list.length})).returnedsTrash
                if(addedList.length>0){
                    setList([...list, ...addedList])
                }
                else
                    setPaginationWork(false)
            }
            else if(['Товары', 'Организации', 'Сотрудники'].includes(filter)){
                setPagination(pagination+100)
            }
        }
    }
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    useEffect(()=>{
        (async()=>{
            if(searchTimeOut)
                clearTimeout(searchTimeOut)
            searchTimeOut = setTimeout(async()=>{
                if(filter==='Клиенты'){
                    list = (await getClientsTrash({search, skip: 0})).clientsTrash
                    simpleStatistic = (await getClientsTrashSimpleStatistic({search})).clientsTrashSimpleStatistic

                }
                else if(filter==='Заказы'){
                    list = (await getOrdersTrash({search, skip: 0})).invoicesTrash
                    simpleStatistic = (await getInvoicesTrashSimpleStatistic({search})).invoicesTrashSimpleStatistic
                }
                else if(filter==='Возвраты'){
                    list = (await getReturnedsTrash({search, skip: 0})).returnedsTrash
                    simpleStatistic = (await getReturnedsTrashSimpleStatistic({search})).returnedsTrashSimpleStatistic
                }
                else if(filter==='Товары'){
                    list = (await getItemsTrash({search})).itemsTrash
                    simpleStatistic = [list.length]
                }
                else if(filter==='Организации'){
                    list = (await getOrganizationsTrash({search})).organizationsTrash
                    simpleStatistic = [list.length]
                }
                else if(filter==='Акции'){
                    list = (await getAdssTrash({search})).adssTrash
                    simpleStatistic = [list.length]
                }
                else if(filter==='Сотрудники'){
                    list = (await getEmploymentsTrash({search})).employmentsTrash
                    simpleStatistic = [list.length]
                }
                setList(list)
                setSimpleStatistic(simpleStatistic)
                setType(filter)
                forceCheck()
                setPaginationWork(true);
                setPagination(100);
                (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
            }, 500)
            setSearchTimeOut(searchTimeOut)
        })()
    },[filter, search])
    const filters = [
        {name: 'Акции', value: 'Акции'},
        {name: 'Возвраты', value: 'Возвраты'},
        {name: 'Заказы', value: 'Заказы'},
        {name: 'Клиенты', value: 'Клиенты'},
        {name: 'Организации', value: 'Организации'},
        {name: 'Сотрудники', value: 'Сотрудники'},
        {name: 'Товары', value: 'Товары'},
        ]
    return (
        <App checkPagination={checkPagination} searchShow={true} filters={filters} pageName='Корзина'>
            <Head>
                <title>Корзина</title>
                <meta name='description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:title' content='Корзина' />
                <meta property='og:description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:type' content='website' />
                <meta property='og:image' content={`${urlMain}/static/512x512.png`} />
                <meta property='og:url' content={`${urlMain}/statistic/trash`} />
                <link rel='canonical' href={`${urlMain}/statistic/trash`}/>
            </Head>
            <div className='count'>
                {`Всего: ${simpleStatistic[0]}`}
            </div>
            <div className={classes.page}>
                {list?list.map((element, idx)=> {
                    return(
                        <LazyLoad scrollContainer={'.App-body'} key={element._id} height={height} offset={[height, 0]}
                                  debounce={0} once={true} placeholder={<CardClientPlaceholder height={height}/>}>
                            {
                                type===filter?
                                    type==='Клиенты'?
                                        <CardClient list={list} idx={idx} key={element._id} setList={setList} element={element}/>
                                        :
                                    type==='Заказы'?
                                        <CardOrder selected={[]} list={list} idx={idx} setList={setList} key={element._id} element={element}/>
                                        :
                                    type==='Возвраты'&&element.items?
                                        <CardReturned selected={[]} list={list} idx={idx} setList={setList} key={element._id} element={element}/>
                                        :
                                    type==='Товары'?
                                        <CardItem setList={setList} key={element._id} element={element} list={list}/>
                                        :
                                    type==='Организации'?
                                        <CardOrganization list={list} key={element._id} setList={setList} element={element}/>
                                        :
                                    type==='Акции'?
                                        <CardAds edit={true} list={list} key={element._id} setList={setList} element={element}/>
                                            :
                                    type==='Сотрудники'?
                                        <CardEmployment list={list} key={element._id} setList={setList} element={element}/>
                                        :
                                        null
                                :
                                    null
                            }
                        </LazyLoad>
                    )}
                ):null}
            </div>
        </App>
    )
})

Trash.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    let role = ctx.store.getState().user.profile.role
    ctx.store.getState().app.filter = 'Клиенты'
    let authenticated = ctx.store.getState().user.authenticated
    if(authenticated&&'admin'!==role)
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            ...(await getClientsTrashSimpleStatistic({search: '', skip: 0}, ctx.req?await getClientGqlSsr(ctx.req):undefined)),
        }
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Trash);
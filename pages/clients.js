import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../layouts/App';
import pageListStyle from '../src/styleMUI/client/clientList'
import {getClients, getClientsSimpleStatistic} from '../src/gql/client'
import CardClient from '../components/client/CardClient'
import { connect } from 'react-redux'
import Router from 'next/router'
import { urlMain } from '../redux/constants/other'
import { forceCheck } from 'react-lazyload';
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import CardClientPlaceholder from '../components/client/CardClientPlaceholder'
import LazyLoad from 'react-lazyload';
import Link from 'next/link';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
const height = 140;


const Client = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    let [list, setList] = useState(data.clients);
    let [simpleStatistic, setSimpleStatistic] = useState(data.clientsSimpleStatistic[0]);
    let [paginationWork, setPaginationWork] = useState(true);
    const checkPagination = async()=>{
        if(paginationWork){
            let addedList = (await getClients({search, sort, filter: filter, date: date, skip: list.length, city: city})).clients
            if(addedList.length>0){
                setList([...list, ...addedList])
            }
            else
                setPaginationWork(false)
        }
    }
    const getList = async ()=>{
        setList((await getClients({search, sort, filter: filter, date: date, skip: 0, city: city})).clients);
        setSimpleStatistic((await getClientsSimpleStatistic({search, filter: filter, date: date, city: city})).clientsSimpleStatistic[0]);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant'});
        forceCheck();
        setPaginationWork(true);
    }
    const { search, filter, sort, date, city } = props.app;
    const { profile } = props.user;
    const initialRender = useRef(true);
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    useEffect(()=>{
        (async()=>{
            if(!initialRender.current) {
                await getList()
            }
        })()
    },[filter, sort, date, city])
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            } else {
                if (searchTimeOut)
                    clearTimeout(searchTimeOut)
                searchTimeOut = setTimeout(async () => {
                    await getList()
                }, 500)
                setSearchTimeOut(searchTimeOut)
            }
        })()
    },[search])
    return (
        <App cityShow checkPagination={checkPagination} searchShow={true} dates={true} filters={data.filterClient} sorts={data.sortClient} pageName='Клиенты'>
            <Head>
                <title>Клиенты</title>
                <meta name='description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:title' content='Клиенты' />
                <meta property='og:description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:type' content='website' />
                <meta property='og:image' content={`${urlMain}/static/512x512.png`} />
                <meta property='og:url' content={`${urlMain}/clients`} />
                <link rel='canonical' href={`${urlMain}/clients`}/>
            </Head>
            <div className='count'>
                {`Всего: ${simpleStatistic}`}
            </div>
            <div className={classes.page}>
                {list?list.map((element, idx)=> {
                    return(
                        <LazyLoad scrollContainer={'.App-body'} key={element._id} height={height} offset={[height, 0]}
                                  debounce={0} once={true} placeholder={<CardClientPlaceholder height={height}/>}>
                            <CardClient buy list={list} idx={idx} key={element._id} setList={setList} element={element}/>
                        </LazyLoad>
                    )}
                ):null}
            </div>
            {profile.role==='admin'||(profile.addedClient&&['суперорганизация', 'организация', 'агент'].includes(profile.role))?
                <Link href='/client/[id]' as={`/client/new`}>
                    <Fab color='primary' aria-label='add' className={classes.fab}>
                        <AddIcon />
                    </Fab>
                </Link>
                :
                null
            }
        </App>
    )
})

Client.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    let role = ctx.store.getState().user.profile.role
    let authenticated = ctx.store.getState().user.authenticated
    if(authenticated&&!['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент', 'экспедитор'].includes(role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            ...(await getClients({search: '', sort: '-createdAt', filter: '', skip: 0, city: ctx.store.getState().app.city}, ctx.req?await getClientGqlSsr(ctx.req):undefined)),
            ...(await getClientsSimpleStatistic({search: '', sort: '-createdAt', filter: '', city: ctx.store.getState().app.city}, ctx.req?await getClientGqlSsr(ctx.req):undefined))
        }
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Client);
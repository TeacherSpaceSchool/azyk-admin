import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import pageListStyle from '../../src/styleMUI/statistic/statisticsList'
import {getItemsForStocks, getStocks} from '../../src/gql/stock'
import CardStock from '../../components/stock/CardStock'
import { connect } from 'react-redux'
import Router from 'next/router'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import { useRouter } from 'next/router'
import {getWarehouses} from '../../src/gql/warehouse';

const Stock = React.memo((props) => {
    const { profile } = props.user;
    const classes = pageListStyle();
    const { data } = props;
    let [list, setList] = useState(data.stocks);
    const { search } = props.app;
    const router = useRouter()
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    const initialRender = useRef(true);
    const getList = async ()=>{
        setList((await getStocks({organization: router.query.id, search})).stocks)
        setPagination(100);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(()=>{
        (async()=>{
            if(!initialRender.current) {
                await getList()
            }
        })()
    },[])
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
    let [pagination, setPagination] = useState(100);
    const checkPagination = ()=>{
        if(pagination<list.length){
            setPagination(pagination+100)
        }
    }
    return (
        <App checkPagination={checkPagination} searchShow={true} filters={data.filterStock} sorts={data.sortStock} pageName='Остатки'>
            <Head>
                <title>Остатки</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                {`Всего: ${list.length}`}
            </div>
            <div className={classes.page}>
                {
                    ['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                        <CardStock list={list} setList={setList} warehouses={data.warehouses} items={data.itemsForStocks} organization={router.query.id}/>
                        :
                        null
                }
                {list?list.map((element, idx)=> {
                    if(idx<pagination)
                        return(
                            <CardStock list={list} idx={idx} key={element._id} warehouses={data.warehouses}  items={data.itemsForStocks} organization={router.query.id} setList={setList} element={element}/>
                        )}
                ):null}
            </div>
        </App>
    )
})

Stock.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            warehouses: await getWarehouses({organization: ctx.query.id, search: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
            ...(await getStocks({organization: ctx.query.id, search: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined)),
            ...(await getItemsForStocks({organization: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined)),
        }
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Stock);
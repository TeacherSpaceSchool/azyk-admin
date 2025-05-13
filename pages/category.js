import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../layouts/App';
import { connect } from 'react-redux'
import { getCategorys } from '../src/gql/category'
import pageListStyle from '../src/styleMUI/category/categoryList'
import CardCategory from '../components/category/CardCategory'
import { urlMain } from '../redux/constants/other'
import Router from 'next/router'
import LazyLoad from 'react-lazyload';
import { forceCheck } from 'react-lazyload';
import CardCategoryPlaceholder from '../components/category/CardCategoryPlaceholder'
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'

const Index = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    let [list, setList] = useState(data.categorys);
    const { search, filter, sort } = props.app;
    const { profile } = props.user;
    let height = profile.role==='admin'?161:83
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    const initialRender = useRef(true);
    const getList = async ()=>{
        setList((await getCategorys({search, sort, filter: filter})).categorys);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        setPagination(100);
        forceCheck();
    }
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
    let [pagination, setPagination] = useState(100);
    const checkPagination = ()=>{
        if(pagination<list.length){
            setPagination(pagination+100)
        }
    }
    return (
        <App checkPagination={checkPagination} searchShow={true} filters={data.filterCategory} sorts={data.sortCategory} pageName='Категории'>
            <Head>
                <title>Категории</title>
                <meta name='description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:title' content='Категории' />
                <meta property='og:description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:type' content='website' />
                <meta property='og:image' content={`${urlMain}/static/512x512.png`} />
                <meta property='og:url' content={`${urlMain}`} />
                <link rel='canonical' href={`${urlMain}`}/>
            </Head>
            <div className={classes.page}>
                <div className='count'>
                    {`Всего: ${list.length}`}
                </div>
                {profile.role==='admin'?
                    <>
                    <CardCategory list={list} setList={setList}/>
                    </>
                    :
                    null
                }
                <CardCategory element={{image: '/static/allitem.svg', name: 'Все подкатегории', _id: 'all'}} setList='all'/>
                {list?list.map((element, idx)=> {
                    if(idx<pagination)
                        return(
                            <LazyLoad scrollContainer={'.App-body'} key={element._id} height={height} offset={[height, 0]} debounce={0} once={true}  placeholder={<CardCategoryPlaceholder height={height}/>}>
                                <CardCategory list={list} idx={idx}  key={element._id} setList={setList} element={element}/>
                            </LazyLoad>
                        )}
                ):null}
            </div>
        </App>
    )
})

Index.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    let role = ctx.store.getState().user.profile.role
    ctx.store.getState().app.sort = 'name'
    let authenticated = ctx.store.getState().user.authenticated
    if(!['admin', 'client'].includes(role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: ['суперагент','агент'].includes(role)?'/catalog':!authenticated?'/contact':'/items/all'
            })
            ctx.res.end()
        }
        else {
            Router.push(['суперагент','агент'].includes(role)?'/catalog':!authenticated?'/contact':'/items/all')
        }
    return {
        data: await getCategorys({search: '', sort: ctx.store.getState().app.sort, filter: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined)
    };
};

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app,
    }
}

export default connect(mapStateToProps)(Index);
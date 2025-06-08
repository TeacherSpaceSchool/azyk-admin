import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import { getSubCategorys } from '../../src/gql/subcategory'
import { getCategorys } from '../../src/gql/category'
import pageListStyle from '../../src/styleMUI/subcategory/subcategoryList'
import SubCardCategory from '../../components/subcategory/SubCardCategory'
import { useRouter } from 'next/router'
import { urlMain } from '../../redux/constants/other'
import LazyLoad from 'react-lazyload';
import { forceCheck } from 'react-lazyload';
import SubCardCategoryPlaceholder from '../../components/subcategory/SubCardCategoryPlaceholder'
import Link from 'next/link';
import Typography from '@material-ui/core/Typography';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import Router from 'next/router'

const Subcategory = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    const router = useRouter()
    let [list, setList] = useState(data.subCategorys);
    const { search, filter, sort } = props.app;
    const { profile } = props.user;
    let height = profile.role==='admin'?189:38
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    const initialRender = useRef(true);
    const getList = async ()=>{
        setList((await getSubCategorys({category: router.query.id, search, sort, filter: filter})).subCategorys)
        setPagination(100);
        forceCheck();
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
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
        <App checkPagination={checkPagination} searchShow={true} filters={data.filterSubCategory} sorts={data.sortSubCategory} pageName={router.query.id==='all'?'Все':data.category?data.category.name:'Ничего не найдено'}>
            <Head>
                <title>{router.query.id==='all'?'Все':data.category?data.category.name:'Ничего не найдено'}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            {
                ['client', 'admin'].includes(profile.role)?
                    <Breadcrumbs style={{margin: 20}} aria-label='breadcrumb'>
                        <Link href='/category'>
                            <a>
                                Категории
                            </a>
                        </Link>
                        <Typography color='textPrimary'>
                            {router.query.id==='all'?'Все':data.category?data.category.name:'Ничего не найдено'}
                        </Typography>
                    </Breadcrumbs>
                    :
                    null
            }

            <div className={classes.page}>
                <div className='count'>
                    {`Всего: ${list.length}`}
                </div>
                {profile.role==='admin'?
                    <>
                    <SubCardCategory list={list} categorys={data.categorys} setList={setList}/>
                    </>
                    :null}
                <SubCardCategory element={{_id: 'all', name: 'Все товары'}}/>
                {data.subCategorys.length>0||router.query.id==='all'?
                    list?list.map((element, idx)=> {
                        if(idx<pagination)
                            return(
                                <LazyLoad scrollContainer={'.App-body'} key={element._id} height={height} offset={[height, 0]} debounce={0} once={true}  placeholder={<SubCardCategoryPlaceholder height={height}/>}>
                                    <SubCardCategory list={list} idx={idx} categorys={data.categorys} setList={setList} element={element}/>
                                </LazyLoad>
                            )}
                    ):null
                    :null
                }
            </div>
        </App>
    )
})

Subcategory.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!ctx.store.getState().user.profile.role)
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    ctx.store.getState().app.sort = 'name'
    return {
        data: {
            ...await getSubCategorys({category: ctx.query.id, search: '', sort: ctx.store.getState().app.sort, filter: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
            ...ctx.store.getState().user.profile.role==='admin'?await getCategorys({search: '', sort: 'name', filter: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined):{}
        }
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Subcategory);
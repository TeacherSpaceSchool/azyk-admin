import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../src/styleMUI/item/itemList'
import CardItem from '../../components/items/CardItem'
import { useRouter } from 'next/router'
import {getItems} from '../../src/gql/items';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { urlMain } from '../../redux/constants/other'
import initialApp from '../../src/initialApp'
import LazyLoad from 'react-lazyload';
import { forceCheck } from 'react-lazyload';
import CardItemPlaceholder from '../../components/items/CardItemPlaceholder'
import Link from 'next/link';
import Typography from '@material-ui/core/Typography';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { getClientGqlSsr } from '../../src/getClientGQL'
import Router from 'next/router'
const height = 377;

const Items = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    const router = useRouter()
    let [list, setList] = useState(data.items);
    const { search, sort, organization } = props.app;
    const { profile } = props.user;
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    const initialRender = useRef(true);
    const getList = async ()=>{
        setList((await getItems({organization: organization, subCategory: router.query.id, search, sort})).items)
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
    },[sort, organization])
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
        <App organizations checkPagination={checkPagination} searchShow={true} sorts={data.sortItem} pageName={router.query.id==='all'?'Все':data.subCategory!==null?data.subCategory.name:'Ничего не найдено'}>
            <Head>
                <title>{router.query.id==='all'?'Все':data.subCategory!==null?data.subCategory.name:'Ничего не найдено'}</title>
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
                        {
                            data.subCategory?
                                <Link href='/subcategory/[id]' as={`/subcategory/${data.subCategory.category._id}`}>
                                    <a>
                                        {data.subCategory.category.name}
                                    </a>
                                </Link>
                                :
                                <Link href='/subcategory/[id]' as={`/subcategory/all`}>
                                    <a>
                                        Все подкатегории
                                    </a>
                                </Link>
                        }
                        {
                            data.subCategory?
                                <Typography color='textPrimary'>
                                    {data.subCategory.name}
                                </Typography>
                                :
                                <Typography color='textPrimary'>
                                    Все товары
                                </Typography>
                        }
                    </Breadcrumbs>
                    :null}
            <div className={classes.page}>
                <div className='count'>
                    {`Всего: ${list.length}`}
                </div>

                {list?list.map((element, idx)=> {
                    if(idx<pagination)
                        return(
                            <LazyLoad scrollContainer={'.App-body'} key={element._id} height={height} offset={[height, 0]} debounce={0} once={true}  placeholder={<CardItemPlaceholder/>}>
                                <CardItem nl list={list} idx={idx} setList={setList} key={element._id} element={element} subCategory={router.query.id==='all'?'all':data.subCategory._id}/>
                            </LazyLoad>
                        )}
                ):null}
            </div>
            {['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                <Link href='/item/[id]' as={`/item/new`}>
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

Items.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!ctx.store.getState().user.profile.role)
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    ctx.store.getState().app.sort = '-priotiry'
    return {
        data: await getItems({subCategory: ctx.query.id, search: '', sort: ctx.store.getState().app.sort}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Items);
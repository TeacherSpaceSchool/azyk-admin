import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import { getAutos } from '../../src/gql/auto'
import { getEcspeditors } from '../../src/gql/employment'
import pageListStyle from '../../src/styleMUI/auto/autoList'
import CardAuto from '../../components/auto/CardAuto'
import { getClientGqlSsr } from '../../src/getClientGQL'
import Router from 'next/router'
import initialApp from '../../src/initialApp'
import { useRouter } from 'next/router'

const Autos = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    let [list, setList] = useState(data.autos);
    const { search, sort } = props.app;
    const router = useRouter()
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    const initialRender = useRef(true);
    const getList = async ()=>{
        setList((await getAutos({search, sort, organization: router.query.id})).autos)
        setPagination(100);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(()=>{
        (async()=>{
            if(!initialRender.current) {
                await getList()
            }
        })()
    },[sort])
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
        <App checkPagination={checkPagination} searchShow={true} sorts={data.sortAuto} pageName={'Транспорт'}>
            <Head>
                <title>Транспорт</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                {`Всего: ${list.length}`}
            </div>
            <div className={classes.page}>
                <CardAuto organization={router.query.id} list={list} employments={data.ecspeditors} setList={setList}/>
                {list?list.map((element, idx)=> {
                    if(idx<pagination)
                        return(
                            <CardAuto organization={router.query.id} list={list} employments={data.ecspeditors} idx={idx} key={element._id} setList={setList} element={element}/>
                        )
                }):null}
            </div>
        </App>
    )
})

Autos.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация', 'организация', 'менеджер'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            ...await getAutos({search: '', sort: '-createdAt', organization: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
            ...await getEcspeditors({_id: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined)
        }
    };
};

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app,
    }
}

export default connect(mapStateToProps)(Autos);
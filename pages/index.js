import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../layouts/App';
import { connect } from 'react-redux'
import { getBrandOrganizations} from '../src/gql/items'
import pageListStyle from '../src/styleMUI/organization/orgaizationsList'
import CardBrand from '../components/brand/CardBrand'
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import Router from 'next/router'
import {isNotTestUser, isPWA} from '../src/lib';

const Organization = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
     const { search, filter, sort, isMobileApp, city, device } = props.app;
    const { profile } = props.user;
    let [list, setList] = useState(data.brandOrganizations);
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    let [type, setType] = useState('👁');
    const initialRender = useRef(true);
    const getList = async ()=>{
        setList((await getBrandOrganizations({search, sort, filter: filter, city: city})).brandOrganizations);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        setPagination(100);
    }
    useEffect(()=>{
        (async()=>{
            if(!initialRender.current) {
                await getList()
            }
        })()
    },[filter, sort, city])
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
    //установка pwa
    let [deferredPrompt, setDeferredPrompt] = useState(device.vendor==='Apple');
    useEffect(()=>{
        window.addEventListener('beforeinstallprompt', (e) => {
            // Сохраняем событие для последующего использования
            setDeferredPrompt(e);
        });
    },[])
    const prompt = () => {
        if(device.vendor==='Apple') {
            Router.push('/howtoinstall/ios')

        }
        else {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    setDeferredPrompt(null)
                }
            });
        }
    }
    //pagination
    let [pagination, setPagination] = useState(100);
    const checkPagination = ()=>{
        if(pagination<list.length){
            setPagination(pagination+100)
        }
    }
    return (
        <App cityShow checkPagination={checkPagination} searchShow={true} filters={data.filterOrganization} pageName='Бренды'>
            <Head>
                <title>Бренды</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                {`Всего: ${list.length}`}
            </div>
            {
                isNotTestUser(profile)&&isMobileApp&&(profile.role!=='client'||deferredPrompt&&!isPWA())?
                    <div className={classes.scrollDown} onClick={()=>{
                        if(profile.role==='client') {
                            prompt()
                        }
                        else {
                            setType(type==='👁'?'⚙':'👁')
                        }
                    }}>
                        <div className={classes.scrollDownContainer}>
                            {profile.role==='client'?'📲УСТАНОВИТЬ ПРИЛОЖЕНИЕ':type}
                            <div className={classes.scrollDownDiv}/>
                        </div>
                    </div>
                    :
                    null
            }
            <div className={classes.page}>
                {list?list.map((element, idx)=> {
                    if(idx<pagination)
                        return(
                            <CardBrand key={element._id} element={element} idx={idx} list={list} setList={setList} type={type}/>
                        )
                }):null}
            </div>
        </App>
    )
})

Organization.getInitialProps = async function(ctx) {
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
        data: {
            height: role==='admin'?149:80,
            ...await getBrandOrganizations({search: '', sort: ctx.store.getState().app.sort, filter: '', city: ctx.store.getState().app.city}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
        }
    };
};

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app,
    }
}

export default connect(mapStateToProps)(Organization);
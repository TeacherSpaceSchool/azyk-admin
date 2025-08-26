import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../layouts/App';
import { connect } from 'react-redux'
import { getBrandOrganizations} from '../src/gql/items'
import pageListStyle from '../src/styleMUI/organization/orgaizationsList'
import CardBrand from '../components/card/CardBrand'
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import Router from 'next/router'
import {formatAmount, isNotTestUser, isPWA, unawaited} from '../src/lib';
import {viewModes} from '../src/enum';
import Table from '../components/table/organizations';

const filters = [{name: 'Все', value: ''}, {name: 'Активные', value: 'active'}, {name: 'Неактивные', value: 'deactive'}]

const Organization = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
     const {search, filter, sort, isMobileApp, city, device, viewMode} = props.app;
    const {profile} = props.user;
    let [list, setList] = useState(data.brandOrganizations);
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    const getList = async () => {
        setList(await getBrandOrganizations({search, sort, filter, city}));
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        setPagination(100);
    }
    useEffect(() => {
        if(!initialRender.current) 
            unawaited(getList)
    }, [filter, sort, city])
    useEffect(() => {
            if(initialRender.current) 
                initialRender.current = false;
            else {
                if(searchTimeOut.current)
                    clearTimeout(searchTimeOut.current)
                searchTimeOut.current = setTimeout(() =>unawaited(getList), 500)
            }
    }, [search])
    //установка pwa
    let [deferredPrompt, setDeferredPrompt] = useState(device.vendor==='Apple');
    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Сохраняем событие для последующего использования
            setDeferredPrompt(e);
        });
    }, [])
    const prompt = () => {
        if(device.vendor==='Apple') {
            Router.push('/howtoinstall/ios')

        }
        else {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if(choiceResult.outcome === 'accepted') {
                    setDeferredPrompt(null)
                }
            });
        }
    }
    //pagination
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [pagination, list])
    return (
        <App cityShow checkPagination={checkPagination} searchShow filters={profile.role==='admin'&&filters} pageName='Бренды'>
            <Head>
                <title>Бренды</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                Всего: {formatAmount(list.length)}
            </div>
            {
                isNotTestUser(profile)&&isMobileApp&&deferredPrompt&&!isPWA()?
                    <div className={classes.scrollDown} onClick={prompt}>
                        <div className={classes.scrollDownContainer}>
                            📲УСТАНОВИТЬ ПРИЛОЖЕНИЕ
                            <div className={classes.scrollDownDiv}/>
                        </div>
                    </div>
                    :
                    null
            }
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                {list?profile.role==='client'||viewMode===viewModes.card?
                        list.map((element, idx) => {
                            if(idx<pagination)
                                return <CardBrand key={element._id} element={element} idx={idx} list={list} setList={setList}/>
                        })
                        :
                        <Table pagination={pagination} path='brand' list={list}/>
                    :null}
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
            brandOrganizations: await getBrandOrganizations({search: '', sort: ctx.store.getState().app.sort, filter: '', city: ctx.store.getState().app.city}, getClientGqlSsr(ctx.req))
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
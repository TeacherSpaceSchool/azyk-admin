import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../../../layouts/App';
import pageListStyle from '../../../../src/styleMUI/client/clientList'
import {getClients, getClientsSimpleStatistic} from '../../../../src/gql/client'
import { connect } from 'react-redux'
import Router from 'next/router'
import { getClientGqlSsr } from '../../../../src/getClientGQL'
import initialApp from '../../../../src/initialApp'
import {formatAmount, unawaited} from '../../../../src/lib';
import Table from '../../../../components/table/clientsWithoutAds';
import {getClientsWithoutAds, setClientWithoutAds} from '../../../../src/gql/clientWithoutAdsAzyk';
import {getOrganization} from '../../../../src/gql/organization';

const Client = React.memo((props) => {
    const classes = pageListStyle();
    //ref
    const paginationWork = useRef(true);
    const initialRender = useRef(true);
    const searchTimeOut = useRef(null);
    //props
    const {data} = props;
    const {search, clientNetwork, district} = props.app;
    //deps
    const deps = [clientNetwork, district]
    //listArgs
    const listArgs = {search, district, city: data.organization.cities[0], network: clientNetwork, filter: '', sort: '-createdAt'}
    //simpleStatistic
    let [simpleStatistic, setSimpleStatistic] = useState('');
    const getSimpleStatistic = async () => setSimpleStatistic(await getClientsSimpleStatistic(listArgs))
    //list
    let [list, setList] = useState(data.clients);
    const getList = async (skip) => {
        console.log(district)
        const gettedData = await getClients({...listArgs, skip: skip||0})
        if(!skip) {
            unawaited(getSimpleStatistic)
            setList(gettedData)
            paginationWork.current = true;
            (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        }
        else if(gettedData.length) {
            setList(list => [...list, ...gettedData])
            paginationWork.current = true
        }
    }
    //pagination
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            await getList(list.length)
        }
    }, [list, search, ...deps])
    //filter
    useEffect(() => {
        if(!initialRender.current) unawaited(getList)
    }, deps)
    //search
    useEffect(() => {
            if(initialRender.current) {
                initialRender.current = false;
                unawaited(getSimpleStatistic)
            }
            else {
                if(searchTimeOut.current)
                    clearTimeout(searchTimeOut.current)
                searchTimeOut.current = setTimeout(() => unawaited(getList), 500)
            }
    }, [search])
    //clientsWithoutAds
    let [clientsWithoutAds, setClientsWithoutAds] = useState(data.clientsWithoutAds);
    const handleClientWithoutAds = async (client) => {
        setClientsWithoutAds(clientsWithoutAds => {
            const index = clientsWithoutAds.indexOf(client)
            if(index===-1)
                clientsWithoutAds.push(client)
            else
                clientsWithoutAds.splice(index, 1)
            return [...clientsWithoutAds]
        })
        await setClientWithoutAds({client, organization: data.organization._id})
    }
    //render
    return (
        <App checkPagination={checkPagination} showDistrict searchShow clientNetworkShow pageName='Клиенты без акции'>
            <Head>
                <title>Клиенты без акции</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                Всего: {formatAmount(simpleStatistic)}
            </div>
            <div className={classes.page} style={{paddingTop: 0}}>
                <Table list={list} clientsWithoutAds={clientsWithoutAds} handleClientWithoutAds={handleClientWithoutAds}/>
            </div>
        </App>
    )
})

Client.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    let role = ctx.store.getState().user.profile.role
    if(!['admin', 'суперорганизация', 'организация', 'менеджер'].includes(role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    ctx.store.getState().app.organization = ctx.query.id
    const organization = await getOrganization(ctx.query.id, getClientGqlSsr(ctx.req))
    // eslint-disable-next-line no-undef
    const [clients, clientsWithoutAds] = await Promise.all([
        getClients({
            search: ctx.store.getState().app.search, sort: ctx.store.getState().app.sort, filter: ctx.store.getState().app.filter, skip: 0,
            city: organization.cities[0], district: ctx.store.getState().app.district
        }, getClientGqlSsr(ctx.req)),
        getClientsWithoutAds({organization: ctx.query.id}, getClientGqlSsr(ctx.req))
    ])
    return {data: {clients, clientsWithoutAds, organization}};
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Client);
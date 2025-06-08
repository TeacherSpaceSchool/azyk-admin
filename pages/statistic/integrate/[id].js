import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import { getOrganization } from '../../../src/gql/organization'
import { getIntegrate1Cs, getAgentsIntegrate1C, getClientsIntegrate1C, getEcspeditorsIntegrate1C, getItemsIntegrate1C, getIntegrate1CsSimpleStatistic } from '../../../src/gql/integrate1C'
import pageListStyle from '../../../src/styleMUI/subcategory/subcategoryList'
import CardIntegrate from '../../../components/integrate/CardIntegrate'
import { useRouter } from 'next/router'
import { urlMain } from '../../../redux/constants/other'
import LazyLoad from 'react-lazyload';
import { forceCheck } from 'react-lazyload';
import CardIntegratePlaceholder from '../../../components/integrate/CardIntegratePlaceholder'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import initialApp from '../../../src/initialApp'
import Router from 'next/router'

const Integrate = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    const router = useRouter()
    let [list, setList] = useState(data.integrate1Cs);
    let [simpleStatistic, setSimpleStatistic] = useState(['0']);
    let [items, setItems] = useState(data.itemsIntegrate1C);
    let [agents, setAgents] = useState(data.agentsIntegrate1C);
    let [ecspeditors, setEcspeditors] = useState(data.ecspeditorsIntegrate1C);
    let [clients, setClients] = useState(data.clientsIntegrate1C);
    const { search, filter, city } = props.app;
    let [showStat, setShowStat] = useState(false);
    let height = 189
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    let [paginationWork, setPaginationWork] = useState(true);
    const checkPagination = async()=>{
        if(paginationWork){
            let addedList = (await getIntegrate1Cs({search, filter, skip: list.length}, router.query.id)).integrate1Cs
            if(addedList.length>0){
                setList([...list, ...addedList])
            }
            else
                setPaginationWork(false)
        }
    }
    const getList = async()=>{
        setList((await getIntegrate1Cs({search, filter, skip: 0}, router.query.id)).integrate1Cs)
        setSimpleStatistic((await getIntegrate1CsSimpleStatistic({search, filter}, router.query.id)).integrate1CsSimpleStatistic[0])
        setPaginationWork(true);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        forceCheck()
        setItems((await getItemsIntegrate1C({organization: router.query.id, city})).itemsIntegrate1C)
        setAgents((await getAgentsIntegrate1C(router.query.id)).agentsIntegrate1C)
        setEcspeditors((await getEcspeditorsIntegrate1C(router.query.id)).ecspeditorsIntegrate1C)
        setClients((await getClientsIntegrate1C({organization: router.query.id, city})).clientsIntegrate1C)
    }
    useEffect(()=>{
        if(searchTimeOut)
            clearTimeout(searchTimeOut)
        searchTimeOut = setTimeout(async()=>{
            await getList()
        }, 500)
        setSearchTimeOut(searchTimeOut)
    },[filter, search, city])
    return (
        <App cityShow checkPagination={checkPagination} searchShow={true} filters={data.filterIntegrate1C} pageName={data.organization?data.organization.name:'AZYK.STORE'}>
            <Head>
                <title>{data.organization?data.organization.name:'AZYK.STORE'}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                <div className='count' onClick={()=>setShowStat(!showStat)}>
                    {`Всего: ${simpleStatistic}`}
                    {
                        showStat?
                            <>
                            <br/>
                            <br/>
                            {`Осталось агентов: ${agents.length}`}
                            <br/>
                            <br/>
                            {`Осталось экспедиторов: ${ecspeditors.length}`}
                            <br/>
                            <br/>
                            {`Осталось товаров: ${items.length}`}
                            <br/>
                            <br/>
                            {`Осталось клиентов: ${clients.length}`}
                            </>
                            :
                            null
                    }
                </div>
                <CardIntegrate list={list} organization={router.query.id} items={items} clients={clients} agents={agents} ecspeditors={ecspeditors} setList={setList}/>
                {
                    list?list.map((element, idx)=> {
                            return(
                                <LazyLoad scrollContainer={'.App-body'} key={element._id} height={height} offset={[height, 0]} debounce={0} once={true}  placeholder={<CardIntegratePlaceholder height={height}/>}>
                                    <CardIntegrate list={list} idx={idx} element={element} organization={router.query.id} items={items} clients={clients} agents={agents} ecspeditors={ecspeditors} setList={setList}/>
                                </LazyLoad>
                            )}
                    ):null
                }
            </div>
        </App>
    )
})

Integrate.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            ...(await getIntegrate1Cs({search: '', filter: '', skip: 0}, ctx.query.id, ctx.req?await getClientGqlSsr(ctx.req):null)),
            ...(await getOrganization({_id: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):null)),
            ...(await getItemsIntegrate1C({organization: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):null)),
            ...(await getAgentsIntegrate1C(ctx.query.id, ctx.req?await getClientGqlSsr(ctx.req):null)),
            ...(await getEcspeditorsIntegrate1C(ctx.query.id, ctx.req?await getClientGqlSsr(ctx.req):null)),
            ...(await getClientsIntegrate1C({organization: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):null)),
        }
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Integrate);
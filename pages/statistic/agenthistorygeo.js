import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import { urlMain } from '../../redux/constants/other'
import initialApp from '../../src/initialApp'
import Table from '../../components/app/Table'
import { getClientGqlSsr } from '../../src/getClientGQL'
import { getAgentHistoryGeos } from '../../src/gql/agentHistoryGeo'
import { getActiveOrganization } from '../../src/gql/statistic'
import { getAgents } from '../../src/gql/employment'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../redux/actions/app'
import {checkInt} from '../../src/lib'

const AgentHistoryGeo = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    const { isMobileApp, date, city } = props.app;
    const { profile } = props.user;
    const initialRender = useRef(true);
    let [activeOrganization, setActiveOrganization] = useState(profile.organization?[]:data.activeOrganization);
    let [agentHistoryGeo, setAgentHistoryGeo] = useState(undefined);
    let [organization, setOrganization] = useState({_id: profile.organization?profile.organization:undefined});
    let [agents, setAgents] = useState([]);
    let [agent, setAgent] = useState({_id: undefined});
    let [count, setCount] = useState(0);
    let [order, setOrder] = useState(0);
    let [cancel, setCancel] = useState(0);
    const { showLoad } = props.appActions;
    let [showStat, setShowStat] = useState(false);
    useEffect(()=>{
        (async()=>{
            if(profile.role!=='admin') {
                setCount(0)
                setAgents((await getAgents({})).agents)
                setAgent({_id: undefined})
            }
        })()
    },[])
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                await showLoad(true)
                setOrganization(undefined)
                setActiveOrganization([{name: 'AZYK.STORE', _id: 'super'}, ...(await getActiveOrganization(city)).activeOrganization])
                setCount(0)
                setAgents((await getAgents({})).agents)
                setAgent({_id: undefined})
                await showLoad(false)
            }
        })()
    },[city])
    useEffect(()=>{
        (async()=>{
            if(organization&&organization._id) {
                setCount(0)
                setAgents((await getAgents({_id: organization._id})).agents)
                setAgent({_id: undefined})
            }
        })()
    },[organization])
    useEffect(()=>{
        (async()=>{
            if(organization&&organization._id){
                await showLoad(true)
                let agentHistoryGeos = (await getAgentHistoryGeos({
                    agent: agent?agent._id:undefined,
                    date: date,
                    organization: organization._id
                })).agentHistoryGeos
                setAgentHistoryGeo(agentHistoryGeos)
                count = 0
                cancel = 0
                order = 0
                for(let i=0;i<agentHistoryGeos.row.length;i++){
                    if(agent&&agent._id) {
                        count += 1
                        if (agentHistoryGeos.row[i].data[4]==='заказ')
                            order+=1
                        else
                            cancel+=1
                    }
                    else {
                        count+=checkInt(agentHistoryGeos.row[i].data[1])
                        order+=checkInt(agentHistoryGeos.row[i].data[2])
                        cancel+=checkInt(agentHistoryGeos.row[i].data[3])
                    }
                }
                setCount(count)
                setOrder(order)
                setCancel(cancel)
                await showLoad(false)
            }
        })()
    },[agent, date])
    useEffect(()=>{
        if(process.browser){
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    },[process.browser])
    return (
        <App cityShow pageName='История посещений' dates={true}>
            <Head>
                <title>История посещений</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        {
                            profile.role==='admin'?
                                <Autocomplete
                                    className={classes.input}
                                    options={activeOrganization}
                                    getOptionLabel={option => option.name}
                                    value={organization}
                                    onChange={(event, newValue) => {
                                        setOrganization(newValue)
                                    }}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField {...params} label='Организация' fullWidth />
                                    )}
                                />
                                :
                                null
                        }
                        <Autocomplete
                            className={classes.input}
                            options={agents}
                            getOptionLabel={option => option.name}
                            value={agent}
                            onChange={(event, newValue) => {
                                setAgent(newValue)
                            }}
                            noOptionsText='Ничего не найдено'
                            renderInput={params => (
                                <TextField {...params} label='Агент' fullWidth />
                            )}
                        />
                    </div>
                    {
                        agentHistoryGeo?
                            <Table type='item' row={agentHistoryGeo.row} columns={agentHistoryGeo.columns}/>
                            :null
                    }
                </CardContent>
            </Card>
            {
                agentHistoryGeo?
                    <div className='count' onClick={()=>{setShowStat(!showStat)}}>
                        {`Посещений: ${count}`}
                        {
                            showStat?
                                <>
                                <br/>
                                <br/>
                                {`Заказов: ${order}`}
                                <br/>
                                <br/>
                                {`Отказов: ${cancel}`}
                                </>
                                :
                                null
                        }
                    </div>
                    :null
            }
        </App>
    )
})

AgentHistoryGeo.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            activeOrganization: [{name: 'AZYK.STORE', _id: 'super'}, ...(await getActiveOrganization(ctx.store.getState().app.city, ctx.req?await getClientGqlSsr(ctx.req):undefined)).activeOrganization]
        }
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {

        appActions: bindActionCreators(appActions, dispatch),

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AgentHistoryGeo);
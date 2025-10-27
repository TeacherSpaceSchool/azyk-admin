import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import initialApp from '../../../src/initialApp'
import StatisticTable from '../../../components/app/StatisticTable'
import { getAgentHistoryGeos } from '../../../src/gql/agentHistoryGeo'
import { getEmployments } from '../../../src/gql/employment'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import {checkInt, dayStartDefault, pdDatePicker} from '../../../src/lib'
import {getOrganizations} from '../../../src/gql/organization';
import {getClientGqlSsr} from '../../../src/getClientGQL';

const AgentHistoryGeo = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    const {isMobileApp, city} = props.app;
    const {profile} = props.user;
    let [agentHistoryGeo, setAgentHistoryGeo] = useState(null);
    let [agents, setAgents] = useState([]);
    let [agent, setAgent] = useState(null);
    let [count, setCount] = useState(0);
    let [order, setOrder] = useState(0);
    const initialRender = useRef(true);
    let [cancel, setCancel] = useState(0);
    let [organizations, setOrganizations] = useState(data.organizations);
    let [organization, setOrganization] = useState(profile.organization?{_id: profile.organization}:null);
    let [dateStart, setDateStart] = useState(data.dateStart);
    useEffect(() => {
        if(process.browser) {
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    }, [process.browser])
    const {showLoad} = props.appActions;
    let [showStat, setShowStat] = useState(false);
    useEffect(() => {
        showLoad(true)
        setCount(0)
        setAgent(null)
        if(organization)
            (async () => {
                setAgents(await getEmployments({organization: organization._id, search: '', filter: 'агент', sort: 'name'}))
            })()
        else
            setAgents()
        showLoad(false)
    }, [organization])
    useEffect(() => {
        (async () => {
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                showLoad(true)
                setOrganization(null)
                setOrganizations(await getOrganizations({search: '', filter: '', city}))
                showLoad(false)
            }
        })()
    }, [city])
    useEffect(() => {
        (async () => {
            if(organization) {
                showLoad(true)
                let agentHistoryGeos = await getAgentHistoryGeos({
                    agent: agent?agent._id:null,
                    date: dateStart,
                    organization: organization._id
                })
                setAgentHistoryGeo(agentHistoryGeos)
                count = 0
                cancel = 0
                order = 0
                for(let i=0;i<agentHistoryGeos.row.length;i++) {
                    if(agent&&agent._id) {
                        count += 1
                        if(agentHistoryGeos.row[i].data[4]==='заказ')
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
                showLoad(false)
            }
        })()
    }, [agent, dateStart, organization])
    const inputClass = !isMobileApp&&profile.role==='admin'?classes.inputThird:classes.inputHalf
    const filterHeight = 58+(isMobileApp&&profile.role==='admin'?58:0)
    return (
        <App cityShow pageName='История посещений'>
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
                                    className={inputClass}
                                    options={organizations}
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
                            className={inputClass}
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
                        <TextField
                            className={inputClass}
                            label='Дата начала'
                            type='date'
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={dateStart}
                            onChange={ event => setDateStart(event.target.value) }
                        />
                    </div>
                    {
                        agentHistoryGeo?
                            <StatisticTable filterHeight={filterHeight} type='item' row={agentHistoryGeo.row} columns={agentHistoryGeo.columns}/>
                            :null
                    }
                </CardContent>
            </Card>
            {
                agentHistoryGeo?
                    <div className='count' onClick={() => {setShowStat(!showStat)}}>
                        {`Посещений: ${count}`}
                        {
                            showStat?
                                <>
                                <br/>
                                Заказов: {order}
                                <br/>
                                Отказов: {cancel}
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
    let dateStart = new Date()
    if(dateStart.getHours()<dayStartDefault)
        dateStart.setDate(dateStart.getDate() - 1)
    return {
        data: {
            organizations: await getOrganizations({city: ctx.store.getState().app.city, search: '', filter: ''}, getClientGqlSsr(ctx.req)),
            dateStart: pdDatePicker(dateStart)
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
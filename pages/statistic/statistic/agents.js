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
import { getClientGqlSsr } from '../../../src/getClientGQL'
import { getStatisticAgents } from '../../../src/gql/statistic'
import { getOrganizations } from '../../../src/gql/organization'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import {dayStartDefault, handleDateRange, pdDatePicker} from '../../../src/lib'

const AgentsStatistic = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    const {isMobileApp, city} = props.app;
    const {profile} = props.user;
    const initialRender = useRef(true);
    let [organizations, setOrganizations] = useState(data.organizations);
    const [dateRange, setDateRange] = useState({ start: data.dateStart, end: null });
    let [statistic, setStatistic] = useState(null);
    let [showStat, setShowStat] = useState(false);
    let [organization, setOrganization] = useState(profile.organization?{_id: profile.organization}:null);
    const {showLoad} = props.appActions;
    useEffect(() => {
        (async () => {
                showLoad(true)
                setStatistic(await getStatisticAgents({
                    organization: organization?organization._id:null,
                    dateStart: dateRange.start ? dateRange.start : null,
                    dateEnd: dateRange.end ? dateRange.end : null,
                    city
                }))
                showLoad(false)
        })()
    }, [organization, dateRange, organizations])
    useEffect(() => {
        if(process.browser) {
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    }, [process.browser])
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
    return (
        <App cityShow pageName='Агенты'>
            <Head>
                <title>Агенты</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        {
                            profile.role==='admin'?
                                <Autocomplete
                                    className={isMobileApp?classes.input:classes.inputThird}
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
                        <TextField
                            className={isMobileApp||profile.role!=='admin'?classes.inputHalf:classes.inputThird}
                            label='Дата от'
                            type='date'
                            InputLabelProps={{shrink: true}}
                            value={dateRange.start}
                            onChange={e => handleDateRange({type: 'start', value: e.target.value, setDateRange})}
                        />
                        <TextField
                            className={isMobileApp||profile.role!=='admin'?classes.inputHalf:classes.inputThird}
                            label='Дата до'
                            type='date'
                            InputLabelProps={{shrink: true}}
                            value={dateRange.end}
                            onChange={e => handleDateRange({type: 'end', value: e.target.value, setDateRange})}
                        />
                    </div>
                    {
                        statistic?
                            <StatisticTable type='item' row={(statistic.row).slice(1)} columns={statistic.columns}/>
                            :null
                    }
                </CardContent>
            </Card>
            <div className='count' onClick={() =>setShowStat(!showStat)}>
                {
                    statistic?
                        <>
                        <div className={classes.rowStatic}>Агентов: {statistic.row[0].data[0]}</div>
                        {
                            showStat?
                                <>
                                <div className={classes.rowStatic}>Выручка: {statistic.row[0].data[1]} сом</div>
                                <div className={classes.rowStatic}>Выполнено: {statistic.row[0].data[2]} шт</div>
                                <div className={classes.rowStatic}>Отказов: {statistic.row[0].data[3]} сом</div>
                                </>
                                :
                                null
                        }
                        </>
                        :null
                }
            </div>
        </App>
    )
})

AgentsStatistic.getInitialProps = async function(ctx) {
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

export default connect(mapStateToProps, mapDispatchToProps)(AgentsStatistic);
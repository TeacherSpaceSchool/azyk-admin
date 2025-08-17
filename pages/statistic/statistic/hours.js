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
import {dayStartDefault, handleDateRange, pdDatePicker} from '../../../src/lib'
import { getStatisticHours } from '../../../src/gql/statistic'
import { getOrganizations } from '../../../src/gql/organization'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'

const filters = [{name: 'Часы', value: 'hours'}, {name: 'Дни недели', value: 'weekDay'}, {name: 'Месяц', value: 'month'}]

const HoursStatistic = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    const {isMobileApp, city, filter} = props.app;
    const {profile} = props.user;
    const initialRender = useRef(true);
    let [organizations, setOrganizations] = useState(data.organizations);
    let [statisticHours, setStatisticHours] = useState(null);
    let [showStat, setShowStat] = useState(false);
    let [organization, setOrganization] = useState(profile.organization?{_id: profile.organization}:null);
    const {showLoad} = props.appActions;
    const [dateRange, setDateRange] = useState({ start: data.dateStart, end: null });
    useEffect(() => {(async () => {
            if(organization) {
                showLoad(true)
                setStatisticHours(await getStatisticHours({
                    organization: organization._id,
                    dateStart: dateRange.start ? dateRange.start : null,
                    dateEnd: dateRange.end ? dateRange.end : null,
                    city,
                    type: filter,
                }))
                showLoad(false)
            } else setStatisticHours(null)
    })()}, [organization, dateRange, filter])
    useEffect(() => {
        if(process.browser) {
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    }, [process.browser])
    useEffect(() => {(async () => {
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                showLoad(true)
                setOrganization(null)
                setOrganizations(await getOrganizations({search: '', filter: '', city}))
                showLoad(false)
            }
    })()}, [city])
    return (
        <App cityShow pageName='Часы' filters={filters}>
            <Head>
                <title>Часы</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        {
                            profile.role==='admin' ?
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
                                        <TextField {...params} label='Организация' fullWidth/>
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
                        statisticHours?
                            <StatisticTable filterHeight={58} type='item' row={(statisticHours.row).slice(1)} columns={statisticHours.columns}/>
                            :null
                    }
                </CardContent>
            </Card>
            {
                statisticHours?
                    <div className='count' onClick={() =>setShowStat(!showStat)}>
                        <div className={classes.rowStatic}>Выручка: {statisticHours.row[0].data[0]} сом</div>
                        {
                            showStat?
                                <>
                                <div className={classes.rowStatic}>Выручка online: {statisticHours.row[0].data[1]} сом</div>
                                <div className={classes.rowStatic}>Выручка offline: {statisticHours.row[0].data[2]} сом</div>
                                <div className={classes.rowStatic}>Выполнено: {statisticHours.row[0].data[3]} шт</div>
                                <div className={classes.rowStatic}>Выполнено online: {statisticHours.row[0].data[4]} шт</div>
                                <div className={classes.rowStatic}>Выполнено offline: {statisticHours.row[0].data[5]} шт</div>
                                </>
                                :
                                null
                        }
                    </div>
                    :
                    null
            }
        </App>
    )
})

HoursStatistic.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    ctx.store.getState().app.filter = 'hours'
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

export default connect(mapStateToProps, mapDispatchToProps)(HoursStatistic);
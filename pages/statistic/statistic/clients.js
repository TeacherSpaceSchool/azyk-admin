import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import initialApp from '../../../src/initialApp'
import Table from '../../../components/app/StatisticTable'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import { getStatisticClients } from '../../../src/gql/statistic'
import { getOrganizations } from '../../../src/gql/organization'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import {dayStartDefault, handleDateRange, pdDatePicker} from '../../../src/lib'
import {getDistricts} from '../../../src/gql/district';

const filters = [{name: 'Все', value: null}, {name: 'Online', value: 'online'}, {name: 'Offline', value: 'offline'}]

const ClientStatistic = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    const {isMobileApp, filter, city} = props.app;
    const {profile} = props.user;
    const initialRender = useRef(true);
    let [organizations, setOrganizations] = useState(data.organizations);
    const [dateRange, setDateRange] = useState({ start: data.dateStart, end: null });
    let [statisticClients, setStatisticClients] = useState(null);
    let [showStat, setShowStat] = useState(false);
    let [organization, setOrganization] = useState(profile.organization?{_id: profile.organization}:null);
    let [districts, setDistricts] = useState([]);
    let [district, setDistrict] = useState(null);
    const {showLoad} = props.appActions;
    useEffect(() => {
        (async () => {
                showLoad(true)
                setStatisticClients(await getStatisticClients({
                    organization: organization?organization._id:null,
                    dateStart: dateRange.start ? dateRange.start : null,
                    dateEnd: dateRange.end ? dateRange.end : null,
                    ...filter? {filter}:{},
                    ...district? {district: district._id}:{},
                    city
                }))
                showLoad(false)
        })()
    }, [organization, dateRange, filter, district])
    useEffect(() => {(async () => {
        showLoad(true)
        setDistrict(null)
        if(organization)
            setDistricts(await getDistricts({search: '', sort: '-name', organization: organization._id}))
        else
            setDistricts([])
        showLoad(false)
    })()}, [organization])
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

    const filterHeight = 58+58

    return (
        <App cityShow pageName='Клиенты' filters={filters} style={{overflow: 'hidden'}}>
            <Head>
                <title>Клиенты</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        {
                            profile.role==='admin' ?
                                <Autocomplete
                                    className={classes.inputHalf}
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
                        <Autocomplete
                            className={profile.role==='admin'?classes.inputHalf:classes.input}
                            options={districts}
                            getOptionLabel={option => option.name}
                            value={district}
                            onChange={(event, newValue) => {
                                setDistrict(newValue)
                            }}
                            noOptionsText='Ничего не найдено'
                            renderInput={params => (
                                <TextField {...params} label='Район' fullWidth />
                            )}
                        />
                    </div>
                    <div className={classes.row}>
                    <TextField
                            className={classes.inputHalf}
                            label='Дата от'
                            type='date'
                            InputLabelProps={{shrink: true}}
                            value={dateRange.start}
                            onChange={e => handleDateRange({type: 'start', value: e.target.value, setDateRange})}
                        />
                        <TextField
                            className={classes.inputHalf}
                            label='Дата до'
                            type='date'
                            InputLabelProps={{shrink: true}}
                            value={dateRange.end}
                            onChange={e => handleDateRange({type: 'end', value: e.target.value, setDateRange})}
                        />
                    </div>
                    {
                        statisticClients?
                            <Table filterHeight={filterHeight} type='client' row={(statisticClients.row).slice(1)} columns={statisticClients.columns}/>
                            :null
                    }
                </CardContent>
            </Card>
            <div className='count' onClick={()=>setShowStat(!showStat)}>
                {
                    statisticClients?
                        <>
                        <div className={classes.rowStatic}>Клиентов: {statisticClients.row[0].data[0]}</div>
                            {
                                showStat?
                                    <>
                                        <div className={classes.rowStatic}>Выручка: {statisticClients.row[0].data[1]} сом</div>
                                        {statisticClients.row[0].data[2]?
                                            <div className={classes.rowStatic}>Выручка online: {statisticClients.row[0].data[2]} сом</div>:null}
                                        {statisticClients.row[0].data[3]?
                                            <div className={classes.rowStatic}>Выручка offline: {statisticClients.row[0].data[3]} сом</div>:null}
                                        <div className={classes.rowStatic}>Выполнено: {statisticClients.row[0].data[4]} шт`}</div>
                                        {statisticClients.row[0].data[5]?
                                            <div className={classes.rowStatic}>Выполнено online: {statisticClients.row[0].data[5]} шт</div>:null}
                                        {statisticClients.row[0].data[6]?
                                            <div className={classes.rowStatic}>Выполнено offline: {statisticClients.row[0].data[6]} шт</div>:null}
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

ClientStatistic.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    ctx.store.getState().app.filter = false
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

export default connect(mapStateToProps, mapDispatchToProps)(ClientStatistic);
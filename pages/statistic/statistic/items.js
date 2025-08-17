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
import { getStatisticItems } from '../../../src/gql/statistic'
import { getOrganizations } from '../../../src/gql/organization'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import {dayStartDefault, handleDateRange, pdDatePicker} from '../../../src/lib'
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const dayStarts = [{name:`0${dayStartDefault}:00`, value: dayStartDefault}, {name:'00:00', value: 0}]
const filters = [{name: 'Все', value: false}, {name: 'Online', value: true}]

const ItemStatistic = React.memo((props) => {

    const classes = pageListStyle();
    const {data} = props;
    const {isMobileApp, filter, city} = props.app;
    const {profile} = props.user;
    const initialRender = useRef(true);
    let [dayStart, setDayStart] = useState(dayStarts[0]);
    let handleDayStart =  (event) => {
        setDayStart({value: event.target.value, name: event.target.name})
    };
    let [organizations, setOrganizations] = useState(data.organizations);
    const [dateRange, setDateRange] = useState({ start: data.dateStart, end: null });
    let [statisticItem, setStatisticItem] = useState(null);
    let [showStat, setShowStat] = useState(false);
    let [organization, setOrganization] = useState(profile.organization?{_id: profile.organization}:null);
    const {showLoad} = props.appActions;
    useEffect(() => {
        (async () => {
                showLoad(true)
                setStatisticItem(await getStatisticItems({
                    organization: organization ? organization._id : null,
                    dateStart: dateRange.start ? dateRange.start : null,
                    dateEnd: dateRange.end ? dateRange.end : null,
                    online: filter, dayStart: dayStart.value, city
                }))
                showLoad(false)
        })()
    }, [organization, dateRange, filter, dayStart])
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
        <App cityShow pageName='Товары' filters={filters}>
            <Head>
                <title>Товары</title>
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
                                    onChange={(event, newValue) => setOrganization(newValue)}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField {...params} label='Организация' fullWidth/>
                                    )}
                                />
                                :
                                null
                        }
                        <FormControl className={profile.role==='admin'?classes.inputHalf:classes.input}>
                            <InputLabel>Начало дня</InputLabel>
                            <Select value={dayStart.value} onChange={handleDayStart}>
                                {dayStarts.map((element)=>
                                    <MenuItem key={element.value} value={element.value}>{element.name}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </div>
                    <div className={classes.row}>
                        <TextField
                            className={classes.inputHalf}
                            label='Дата от'
                            type='date'
                            InputLabelProps={{shrink: true}}
                            value={dateRange.start}
                            onChange={e => handleDateRange({type: 'start', value: e.target.value, setDateRange, maxMonthPeriod: 1})}
                        />
                        <TextField
                            className={classes.inputHalf}
                            label='Дата до'
                            type='date'
                            InputLabelProps={{shrink: true}}
                            value={dateRange.end}
                            onChange={e => handleDateRange({type: 'end', value: e.target.value, setDateRange, maxMonthPeriod: 1})}
                        />
                    </div>
                    {
                        statisticItem?
                            <Table filterHeight={filterHeight} type='item' row={(statisticItem.row).slice(1)} columns={statisticItem.columns}/>
                            :null
                    }
                </CardContent>
            </Card>
            <div className='count' onClick={()=>setShowStat(!showStat)}>
                {
                    statisticItem?
                        <>
                        <div className={classes.rowStatic}>{`Товаров: ${statisticItem.row[0].data[0]}`}</div>
                        {
                            showStat?
                                <>
                                <div className={classes.rowStatic}>{`Выручка: ${statisticItem.row[0].data[1]} сом`}</div>
                                <div className={classes.rowStatic}>{`Заказов: ${statisticItem.row[0].data[2]} шт`}</div>
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

ItemStatistic.getInitialProps = async function(ctx) {
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

export default connect(mapStateToProps, mapDispatchToProps)(ItemStatistic);
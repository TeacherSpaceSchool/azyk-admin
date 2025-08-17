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
import {dayStartDefault, handleDateRange, pdDatePicker} from '../../../src/lib'
import { getStatisticOrdersOffRoute } from '../../../src/gql/statistic'
import { getOrganizations } from '../../../src/gql/organization'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import {getDistricts} from '../../../src/gql/district';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const types = [{name:'Район', value: 'район'}, {name:'Клиент', value: 'клиент'}]
const filters = [{name: 'Все', value: false}, {name: 'Online', value: true}]

const OrderOffRouteStatistic = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    const {isMobileApp, filter, city} = props.app;
    const {profile} = props.user;
    const initialRender = useRef(true);
    let [organizations, setOrganizations] = useState(data.organizations);
    const [dateRange, setDateRange] = useState({ start: data.dateStart, end: null });
    let [districts, setDistricts] = useState([]);
    let [district, setDistrict] = useState(null);
    let [statisticOrdersOffRoute, setStatisticOrdersOffRoute] = useState(null);
    let [showStat, setShowStat] = useState(false);
    let [organization, setOrganization] = useState(profile.organization?{_id: profile.organization}:null);
    let [type, setType] = useState({name:'Район', value: 'район'});
    let handleType =  (event) => {
        setType({value: event.target.value, name: event.target.name})
    };
    const {showLoad} = props.appActions;
    useEffect(() => {
        (async () => {
                showLoad(true)
                setStatisticOrdersOffRoute(organization?await getStatisticOrdersOffRoute({
                    organization: organization._id,
                    dateStart: dateRange.start ? dateRange.start : null,
                    dateEnd: dateRange.end ? dateRange.end : null,
                    ...district? {district: district._id}:{},
                    online: filter,
                    type: type.value,
                    city
                }):null)
                showLoad(false)
        })()
    }, [organization, dateRange, filter, district, type])
    useEffect(() => {
        (async () => {
            showLoad(true)
            setDistrict(null)
            let districts = []
            if(organization) {
                districts = await getDistricts({search: '', sort: '-name', organization: organization._id})
            }
            setDistricts(districts)
            showLoad(false)
        })()
    }, [organization])
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
    const inputClass = profile.role==='admin'?classes.inputThird:classes.inputHalf
    const filterHeight = 58+58
    return (
        <App cityShow pageName='Заказы вне маршрута' filters={filters}>
            <Head>
                <title>Заказы вне маршрута</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        {
                            profile.role==='admin' ?
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
                                        <TextField {...params} label='Организация' fullWidth/>
                                    )}
                                />
                                :
                                null
                        }
                        <FormControl className={inputClass}>
                            <InputLabel>Тип</InputLabel>
                            <Select value={type.value} onChange={handleType}>
                                {types.map((element)=>
                                    <MenuItem key={element.value} value={element.value}>{element.name}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                        <Autocomplete
                            className={inputClass}
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
                        statisticOrdersOffRoute?
                            <Table filterHeight={filterHeight} type='item' row={(statisticOrdersOffRoute.row).slice(1)} columns={statisticOrdersOffRoute.columns}/>
                            :null
                    }
                </CardContent>
            </Card>
            <div className='count' onClick={()=>setShowStat(!showStat)}>
                {
                    statisticOrdersOffRoute?
                        <>
                            <div className={classes.rowStatic}> {`Выполнено: ${statisticOrdersOffRoute.row[0].data[0]} шт`}</div>
                            {
                            showStat?
                                <>
                                <div className={classes.rowStatic}> {`Выручка: ${statisticOrdersOffRoute.row[0].data[1]} сом`}</div>
                                <div className={classes.rowStatic}>{`Отказов: ${statisticOrdersOffRoute.row[0].data[2]} сом`}</div>
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

OrderOffRouteStatistic.getInitialProps = async function(ctx) {
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

export default connect(mapStateToProps, mapDispatchToProps)(OrderOffRouteStatistic);
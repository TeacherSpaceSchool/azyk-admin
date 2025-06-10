import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import initialApp from '../../src/initialApp'
import Table from '../../components/app/Table'
import { getClientGqlSsr } from '../../src/getClientGQL'
import { pdDatePicker } from '../../src/lib'
import { getStatisticOrdersOffRoute, getActiveOrganization } from '../../src/gql/statistic'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as appActions from '../../redux/actions/app'
import {getDistricts} from "../../src/gql/district";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

const OrderOffRouteStatistic = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    const { isMobileApp, filter, city } = props.app;
    const { profile } = props.user;
    const initialRender = useRef(true);
    let [activeOrganization, setActiveOrganization] = useState(data.activeOrganization);
    let [dateStart, setDateStart] = useState(data.dateStart);
    let [dateType, setDateType] = useState('day');
    let [districts, setDistricts] = useState();
    let [district, setDistrict] = useState();
    let [statisticOrdersOffRoute, setStatisticOrdersOffRoute] = useState(undefined);
    let [showStat, setShowStat] = useState(false);
    let [organization, setOrganization] = useState(profile.organization?{_id: profile.organization}:undefined);
    let [type, setType] = useState({name:'Районы', value: 'районы'});
    const types = [{name:'Районы', value: 'районы'}, {name:'Клиенты', value: 'клиенты'}]
    let handleType =  (event) => {
        setType({value: event.target.value, name: event.target.name})
    };
    const { showLoad } = props.appActions;
    useEffect(()=>{
        (async()=>{
                await showLoad(true)
                setStatisticOrdersOffRoute((await getStatisticOrdersOffRoute({
                    company: organization ? organization._id : undefined,
                    dateStart: dateStart ? dateStart : null,
                    dateType: dateType,
                    ...district? {district: district._id}:{},
                    online: filter,
                    type: type.value,
                    city
                })).statisticOrdersOffRoute)
                await showLoad(false)
        })()
    },[organization, dateStart, dateType, filter, activeOrganization, district, type])
    useEffect(()=>{
        (async()=>{
            await showLoad(true)
            setDistrict(undefined)
            let districts = []
            if(organization){
                districts = (await getDistricts({search: '', sort: '-name', organization: organization._id})).districts
            }
            setDistricts(districts)
            await showLoad(false)
        })()
    },[organization])
    useEffect(()=>{
        if(process.browser){
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    },[process.browser])
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                await showLoad(true)
                setOrganization(undefined)
                setActiveOrganization((await getActiveOrganization(city)).activeOrganization)
                await showLoad(false)
            }
        })()
    },[city])
    const filters = [{name: 'Все', value: false}, {name: organization&&organization._id==='super'? 'Суперагент' : 'Online', value: true}]
    return (
        <App cityShow pageName='Статистика заказов' filters={filters}>
            <Head>
                <title>Статистика заказов</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={()=>setDateType('day')} size='small' color={dateType==='day'?'primary':''}>
                            День
                        </Button>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={()=>setDateType('week')} size='small' color={dateType==='week'?'primary':''}>
                            Неделя
                        </Button>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={()=>setDateType('month')} size='small' color={dateType==='month'?'primary':''}>
                            Месяц
                        </Button>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={()=>setDateType('year')} size='small' color={dateType==='year'?'primary':''}>
                            Год
                        </Button>
                    </div>
                    <div className={classes.row}>
                        {
                            profile.role === 'admin' ?
                                <Autocomplete
                                    className={profile.role === 'admin'?classes.inputFour:classes.inputThird}
                                    options={activeOrganization}
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
                        <FormControl className={profile.role === 'admin'?classes.inputFour:classes.inputThird}>
                            <InputLabel>Тип полок</InputLabel>
                            <Select value={type.value} onChange={handleType}>
                                {types.map((element)=>
                                    <MenuItem key={element.value} value={element.value} ola={element.name}>{element.name}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                        {
                            organization?<Autocomplete
                                className={profile.role === 'admin'?classes.inputFour:classes.inputThird}
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
                            />:null
                        }
                        <TextField
                            className={profile.role === 'admin'?classes.inputFour:classes.inputThird}
                            label='Дата начала'
                            type='date'
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={dateStart}
                            inputProps={{
                                'aria-label': 'description',
                            }}
                            onChange={ event => setDateStart(event.target.value) }
                        />
                    </div>
                    {
                        statisticOrdersOffRoute?
                            <Table type='item' row={(statisticOrdersOffRoute.row).slice(1)} columns={statisticOrdersOffRoute.columns}/>
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
                                <div className={classes.rowStatic}>{`Конс: ${statisticOrdersOffRoute.row[0].data[3]} сом`}</div>
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
    if (dateStart.getHours()<3)
        dateStart.setDate(dateStart.getDate() - 1)
    return {
        data: {
            ...await getActiveOrganization(ctx.store.getState().app.city, ctx.req?await getClientGqlSsr(ctx.req):undefined),
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
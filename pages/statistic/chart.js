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
import { getClientGqlSsr } from '../../src/getClientGQL'
import { getStatisticOrderChart, getActiveOrganization } from '../../src/gql/statistic'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../redux/actions/app'
import { Chart } from 'react-charts'
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const ChartStatistic = React.memo((props) => {

    const classes = pageListStyle();
    const { data } = props;
    const { isMobileApp, filter, city } = props.app;
    const { profile } = props.user;
    const initialRender = useRef(true);
    let [activeOrganization, setActiveOrganization] = useState(data.activeOrganization);
    let [dateStart, setDateStart] = useState(null);
    let [dateType, setDateType] = useState({name:'День', value: 'day'});
    const dateTypes = [{name:'Часы', value: 'time'}, {name:'День', value: 'day'}, {name:'Месяц', value: 'month'}, {name:'Год', value: 'year'}]
    let handleDateType =  (event) => {
        setDateType({value: event.target.value, name: event.target.name})
    };
    const typesChart = [{name:'Бар', value: 'bar'}, {name:'Линии', value: 'line'}]
    let [typeChart, setTypeChart] = useState({name:'Бар', value: 'bar'});
    let handleTypeChart =  (event) => {
        setTypeChart({value: event.target.value, name: event.target.name})
    };
    let [type, setType] = useState({name:'Выручка', value: 'money'});
    const types = [{name:'Выручка', value: 'money'}, {name:'Заказы', value: 'order'}, {name:'Клиенты', value: 'clients'}]
    let handleType =  (event) => {
        setType({value: event.target.value, name: event.target.name})
    };
    let [statisticOrderChart, setStatisticOrderChart] = useState(undefined);
    let [showStat, setShowStat] = useState(false);
    let [organization, setOrganization] = useState(undefined);
    const { showLoad } = props.appActions;
    useEffect(()=>{
        (async()=>{
                await showLoad(true)
                dateStart=dateStart?dateStart:new Date();
                let _statisticOrderChart = (await getStatisticOrderChart({
                    company: organization ? organization._id : undefined,
                    dateStart: dateStart,
                    dateType: dateType.value,
                    type: type.value,
                    online: filter,
                    city: city
                })).statisticOrderChart
                for(let i=0; i<_statisticOrderChart.chartStatistic.length;i++){
                    for(let i1=0; i1<_statisticOrderChart.chartStatistic[i].data.length;i1++){
                        _statisticOrderChart.chartStatistic[i].data[i1] = [_statisticOrderChart.chartStatistic[i].data[i1][0], parseInt(_statisticOrderChart.chartStatistic[i].data[i1][1])]
                    }
                }
                setStatisticOrderChart(_statisticOrderChart)
                await showLoad(false)
        })()
    },[organization, dateStart, dateType, type, filter, activeOrganization])
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                setOrganization(undefined)
                setActiveOrganization((await getActiveOrganization(city)).activeOrganization)
            }
        })()
    },[city])
    useEffect(()=>{
        if(process.browser){
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    },[process.browser])

    const axesBar = React.useMemo(
        () => [
            { primary: true, type: 'ordinal', position: 'bottom' },
            { position: 'left', type: 'linear', stacked: true }
        ],
        []
    )
    const axesLines = React.useMemo(
        () => [
            { primary: true, type: 'ordinal', position: 'bottom' },
            { type: 'linear', position: 'left', stacked: false }
        ],
        []
    )
    const seriesBar = React.useMemo(
        () => ({
            type: 'bar'
        }),
        []
    )
    const seriesLines = React.useMemo(
        () => ({
        }),
        []
    )
    const filters = [{name: 'Все', value: false}, {name: 'Online', value: true}]
    return (
        <App cityShow pageName='Графики заказов' filters={filters}>
            <Head>
                <title>Графики заказов</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        <FormControl className={classes.inputThird}>
                            <InputLabel>Тип графика</InputLabel>
                            <Select value={typeChart.value} onChange={handleTypeChart}>
                                {typesChart.map((element)=>
                                    <MenuItem key={element.value} value={element.value} ola={element.name}>{element.name}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                        <FormControl className={classes.inputThird}>
                            <InputLabel>Тип данных</InputLabel>
                            <Select value={type.value} onChange={handleType}>
                                {types.map((element)=>
                                    <MenuItem key={element.value} value={element.value} ola={element.name}>{element.name}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                        <FormControl className={classes.inputThird}>
                            <InputLabel>Тип даты</InputLabel>
                            <Select value={dateType.value} onChange={handleDateType}>
                                {dateTypes.map((element)=>
                                    <MenuItem key={element.value} value={element.value} ola={element.name}>{element.name}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </div>
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
                                :null}
                        <TextField
                            className={classes.input}
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
                        statisticOrderChart?
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: isMobileApp?'calc(100vw - 32px)':'calc(100vw - 332px)'
                            }}>
                                <div
                                    style={{
                                        width: isMobileApp?'calc(100vw - 42px)':'calc(100vw - 350px)',
                                        height: isMobileApp?'calc(100vh - 260px)':'calc(100vh - 275px)'
                                    }}
                                >
                                    {
                                        dateType==='day'?
                                            <Chart
                                                series={typeChart.value==='line'?seriesLines:seriesBar}
                                                data={statisticOrderChart.chartStatistic}
                                                axes={typeChart.value==='line'?axesLines:axesBar}
                                                tooltip
                                                primaryCursor
                                                secondaryCursor
                                            />
                                            :
                                            dateType==='month'?
                                                <Chart
                                                    series={typeChart.value==='line'?seriesLines:seriesBar}
                                                    data={statisticOrderChart.chartStatistic}
                                                    axes={typeChart.value==='line'?axesLines:axesBar}
                                                    tooltip
                                                    primaryCursor
                                                    secondaryCursor
                                                />
                                                :
                                                <Chart
                                                    series={typeChart.value==='line'?seriesLines:seriesBar}
                                                    data={statisticOrderChart.chartStatistic}
                                                    axes={typeChart.value==='line'?axesLines:axesBar}
                                                    tooltip
                                                    primaryCursor
                                                    secondaryCursor
                                                />
                                    }
                                </div>
                            </div>
                            :
                            null
                    }
                </CardContent>
            </Card>
            <div className='count' onClick={()=>setShowStat(!showStat)}>
                {
                    statisticOrderChart?
                        `${statisticOrderChart.all} ${type.value==='money'?'сом':type.value==='clients'?'клиенты':'заказы'}`
                        :null
                }
            </div>
        </App>
    )
})

ChartStatistic.getInitialProps = async function(ctx) {
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
    return {
        data: {
            ...await getActiveOrganization(ctx.store.getState().app.city, ctx.req?await getClientGqlSsr(ctx.req):undefined),
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

export default connect(mapStateToProps, mapDispatchToProps)(ChartStatistic);
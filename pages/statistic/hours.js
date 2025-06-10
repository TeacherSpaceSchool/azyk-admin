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
import { getStatisticHours, getActiveOrganization } from '../../src/gql/statistic'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as appActions from '../../redux/actions/app'

const HoursStatistic = React.memo((props) => {

    const classes = pageListStyle();
    const { data } = props;
    const { isMobileApp, city, filter } = props.app;
    const { profile } = props.user;
    const initialRender = useRef(true);
    let [activeOrganization, setActiveOrganization] = useState(data.activeOrganization);
    let [statisticHours, setStatisticHours] = useState(undefined);
    let [showStat, setShowStat] = useState(false);
    let [organization, setOrganization] = useState(undefined);
    const { showLoad } = props.appActions;
    let [dateStart, setDateStart] = useState(data.dateStart);
    let [dateType, setDateType] = useState('day');
    useEffect(()=>{
        (async()=>{
            if(organization) {
                await showLoad(true)
                setStatisticHours((await getStatisticHours({
                    organization: organization._id,
                    dateStart: dateStart?dateStart:null,
                    dateType,
                    city,
                    type: filter,
                })).statisticHours)
                await showLoad(false)
            }
        })()
    },[organization, dateStart, dateType, filter])
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
    const filters = [{name: 'Часы', value: 'hours'}, {name: 'Дни недели', value: 'weekDay'}, {name: 'Месяц', value: 'month'}]
    return (
        <App cityShow pageName='Статистика часов' filters={filters}>
            <Head>
                <title>Статистика часов</title>
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
                                    className={classes.input}
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
                        statisticHours?
                            <Table type='item' row={(statisticHours.row).slice(1)} columns={statisticHours.columns}/>
                            :null
                    }
                </CardContent>
            </Card>
            {
                statisticHours?
                    <div className='count' onClick={()=>setShowStat(!showStat)}>
                        <div className={classes.rowStatic}> {`Выручка: ${statisticHours.row[0].data[0]} сом`}</div>
                        {
                            showStat?
                                <>
                                <div className={classes.rowStatic}> {`Выручка online: ${statisticHours.row[0].data[1]} сом`}</div>
                                <div className={classes.rowStatic}> {`Выручка offline: ${statisticHours.row[0].data[2]} сом`}</div>
                                <div className={classes.rowStatic}> {`Выполнено: ${statisticHours.row[0].data[3]} шт`}</div>
                                <div className={classes.rowStatic}> {`Выполнено online: ${statisticHours.row[0].data[4]} шт`}</div>
                                <div className={classes.rowStatic}> {`Выполнено offline: ${statisticHours.row[0].data[5]} шт`}</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(HoursStatistic);
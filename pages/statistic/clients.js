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
import { getStatisticClients, getActiveOrganization } from '../../src/gql/statistic'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as appActions from '../../redux/actions/app'
import { pdDatePicker } from '../../src/lib'
import {getDistricts} from "../../src/gql/district";
import {getDistributer} from "../../src/gql/distributer";

const ClientStatistic = React.memo((props) => {

    const classes = pageListStyle();
    const { data } = props;
    const { isMobileApp, filter, city } = props.app;
    const { profile } = props.user;
    const initialRender = useRef(true);
    let [activeOrganization, setActiveOrganization] = useState(data.activeOrganization);
    let [dateStart, setDateStart] = useState(data.dateStart);
    let [dateType, setDateType] = useState('day');
    let [statisticClients, setStatisticClients] = useState(undefined);
    let [showStat, setShowStat] = useState(false);
    let [organization, setOrganization] = useState(undefined);
    let [districts, setDistricts] = useState();
    let [district, setDistrict] = useState();
    const { showLoad } = props.appActions;
    useEffect(()=>{
        (async()=>{
                await showLoad(true)
                setStatisticClients((await getStatisticClients({
                    company: organization ? organization._id : 'all',
                    dateStart: dateStart ? dateStart : null,
                    dateType: dateType,
                    ...filter? {filter}:{},
                    ...district? {district: district._id}:{},
                    city
                })).statisticClients)
                await showLoad(false)
        })()
    },[organization, dateStart, dateType, filter, activeOrganization, district])
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

    const filters = [{name: 'Все', value: undefined}, {name: 'Online', value: 'online'}, {name: 'Offline', value: 'offline'}]
    return (
        <App cityShow pageName='Статистика клиентов' filters={filters} style={{overflow: 'hidden'}}>
            <Head>
                <title>Статистика клиентов</title>
                <meta name='description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:title' content='Статистика клиентов' />
                <meta property='og:description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:type' content='website' />
                <meta property='og:image' content={`${urlMain}/static/512x512.png`} />
                <meta property='og:url' content={`${urlMain}/statistic/client`} />
                <link rel='canonical' href={`${urlMain}/statistic/client`}/>
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
                    <div className={classes.row} style={{flexWrap: 'nowrap'}}>
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
                        {
                            organization?<Autocomplete
                                className={classes.input}
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
                        statisticClients?
                            <Table type='client' row={(statisticClients.row).slice(1)} columns={statisticClients.columns}/>
                            :null
                    }
                </CardContent>
            </Card>
            <div className='count' onClick={()=>setShowStat(!showStat)}>
                {
                    statisticClients?
                        <>
                        <div className={classes.rowStatic}>{`Клиентов: ${parseInt(statisticClients.row[0].data[0])}`}</div>
                            {
                                showStat?
                                    <>
                                        <div className={classes.rowStatic}> {`Выручка: ${statisticClients.row[0].data[1]} сом`}</div>
                                        {statisticClients.row[0].data[2]?
                                            <div className={classes.rowStatic}> {`Выручка online: ${statisticClients.row[0].data[2]} сом`}</div>:null}
                                        {statisticClients.row[0].data[3]?
                                            <div className={classes.rowStatic}> {`Выручка offline: ${statisticClients.row[0].data[3]} сом`}</div>:null}
                                        <div className={classes.rowStatic}> {`Выполнено: ${statisticClients.row[0].data[4]} шт`}</div>
                                        {statisticClients.row[0].data[5]?
                                            <div className={classes.rowStatic}> {`Выполнено online: ${statisticClients.row[0].data[5]} шт`}</div>:null}
                                        {statisticClients.row[0].data[6]?
                                            <div className={classes.rowStatic}> {`Выполнено offline: ${statisticClients.row[0].data[6]} шт`}</div>:null}
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

export default connect(mapStateToProps, mapDispatchToProps)(ClientStatistic);
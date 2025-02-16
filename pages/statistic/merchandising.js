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
import { pdDatePicker } from '../../src/lib'
import { getStatisticMerchandising, getActiveOrganization } from '../../src/gql/statistic'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../redux/actions/app'
import Button from '@material-ui/core/Button';
import { getAgents } from '../../src/gql/employment'

const MerchandisingStatistic = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    const { isMobileApp, city } = props.app;
    const { profile } = props.user;
    const initialRender = useRef(true);
    let [activeOrganization, setActiveOrganization] = useState(data.activeOrganization);
    let [statisticMerchandising, setStatisticMerchandising] = useState(undefined);
    let [showStat, setShowStat] = useState(false);
    let [agents, setAgents] = useState([]);
    let [agent, setAgent] = useState({_id: undefined});
    let [organization, setOrganization] = useState(data.organization);
    let [dateStart, setDateStart] = useState(data.dateStart);
    let [dateType, setDateType] = useState('day');
    const { showLoad } = props.appActions;
    useEffect(()=>{
        (async()=>{
            await showLoad(true)
            setStatisticMerchandising((await getStatisticMerchandising({
                organization: organization ? organization._id : undefined,
                dateStart: dateStart ? dateStart : null,
                dateType: dateType,
                agent: agent?agent._id:undefined
            })).statisticMerchandising)
            await showLoad(false)
        })()
    },[organization, dateStart, dateType, activeOrganization, agent])
    useEffect(()=>{
        if(process.browser){
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    },[process.browser])
    useEffect(()=>{
        (async()=>{
            setAgents(organization?(await getAgents({_id: organization._id?organization._id:'super'})).agents:[])
            setAgent({_id: undefined})
        })()
    },[organization])
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                await showLoad(true)
                setOrganization(undefined)
                setActiveOrganization((await getActiveOrganization(city)).activeOrganization)
                setAgents((await getAgents({})).agents)
                setAgent({_id: undefined})
                await showLoad(false)
            }
        })()
    },[city])
    return (
        <App cityShow pageName='Статистика мерчендайзинга'>
            <Head>
                <title>Статистика мерчендайзинга</title>
                <meta name='description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:title' content='Статистика мерчендайзинга' />
                <meta property='og:description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:type' content='website' />
                <meta property='og:image' content={`${urlMain}/static/512x512.png`} />
                <meta property='og:url' content={`${urlMain}/statistic/merchandisings`} />
                <link rel='canonical' href={`${urlMain}/statistic/merchandisings`}/>
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
                                    className={agents&&agents.length?classes.inputThird:classes.input}
                                    options={[{name: 'AZYK.STORE', _id: undefined}, ...activeOrganization]}
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
                            agents&&agents.length?
                                <Autocomplete
                                    className={profile.role === 'admin'?classes.inputThird:classes.input}
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
                                :
                                null
                        }
                        <TextField
                            className={agents&&agents.length&&profile.role === 'admin'?classes.inputThird:classes.input}
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
                        statisticMerchandising?
                            <Table type='item' row={(statisticMerchandising.row).slice(1)} columns={statisticMerchandising.columns}/>
                            :null
                    }
                </CardContent>
            </Card>
            <div className='count' onClick={()=>setShowStat(!showStat)}>
                {
                    statisticMerchandising?
                        !agent._id?
                        <>
                        <div className={classes.rowStatic}>{`Всего(хол|теп): ${statisticMerchandising.row[0].data[0]}`}</div>
                        {
                            showStat?
                                <>
                                <div className={classes.rowStatic}> {`Проверено(хол|теп): ${statisticMerchandising.row[0].data[1]}`}</div>
                                <div className={classes.rowStatic}> {`Обработка(хол|теп): ${statisticMerchandising.row[0].data[2]}`}</div>
                                </>
                                :
                                null
                        }
                        </>
                            :
                            <>
                            <div className={classes.rowStatic}> {`Сделано(хол|теп): ${statisticMerchandising.row[0].data[0]}`}</div>
                            <div className={classes.rowStatic}> {`Пропущено: ${statisticMerchandising.row[0].data[1]}`}</div>
                            </>
                        :null
                }
            </div>
        </App>
    )
})

MerchandisingStatistic.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация',  'организация', 'менеджер'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    let organization
    if(ctx.store.getState().user.profile.role==='admin')
        organization = {name: 'AZYK.STORE', _id: undefined}
    else
        organization = {_id: ctx.store.getState().user.profile.organization}

    let dateStart = new Date()
    if (dateStart.getHours()<3)
        dateStart.setDate(dateStart.getDate() - 1)
    return {
        data: {
            ...await getActiveOrganization(ctx.store.getState().app.city, ctx.req?await getClientGqlSsr(ctx.req):undefined),
            organization,
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

export default connect(mapStateToProps, mapDispatchToProps)(MerchandisingStatistic);
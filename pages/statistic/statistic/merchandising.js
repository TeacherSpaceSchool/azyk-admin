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
import { getStatisticMerchandising } from '../../../src/gql/statistic'
import { getOrganizations } from '../../../src/gql/organization'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {getEmployments} from '../../../src/gql/employment';

const types = [{name:'Все', value: null}, {name:'Холодные полки', value: 'холодные полки'}, {name:'Теплые полки', value: 'теплые полки'}]

const MerchandisingStatistic = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    const {isMobileApp, city} = props.app;
    const {profile} = props.user;
    const initialRender = useRef(true);
    let [organizations, setOrganizations] = useState(data.organizations);
    let [statisticMerchandising, setStatisticMerchandising] = useState(null);
    let [showStat, setShowStat] = useState(false);
    let [agents, setAgents] = useState([]);
    let [agent, setAgent] = useState(null);
    let [organization, setOrganization] = useState(profile.organization?{_id: profile.organization}:null);
    const [dateRange, setDateRange] = useState({ start: data.dateStart, end: null });
    let [type, setType] = useState({name:'Все', value: null});
    let handleType =  (event) => {
        setType({value: event.target.value, name: event.target.name})
    };
    const {showLoad} = props.appActions;
    useEffect(() => {
        if(organization)
            (async () => {
                showLoad(true)
                setStatisticMerchandising(await getStatisticMerchandising({
                    organization: organization._id,
                    dateStart: dateRange.start ? dateRange.start : null,
                    dateEnd: dateRange.end ? dateRange.end : null,
                    agent: agent?agent._id:null,
                    type: type?type.value:null
                }))
                showLoad(false)
            })()
    }, [organization, dateRange, agent, type])
    useEffect(() => {
        if(process.browser) {
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    }, [process.browser])
    useEffect(() => {
        (async () => {
            setAgents(organization?await getEmployments({organization: organization._id?organization._id:'super', search: '', filter: 'агент', sort: 'name'}):[])
            setAgent(null)
        })()
    }, [organization])
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
        <App cityShow pageName='Мерчендайзинг'>
            <Head>
                <title>Мерчендайзинг</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        {
                            profile.role==='admin' ?
                                <Autocomplete
                                    className={inputClass}
                                    options={[{name: 'AZYK.STORE', _id: null}, ...organizations]}
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
                            <InputLabel>Тип полок</InputLabel>
                            <Select value={type.value} onChange={handleType}>
                                {types.map((element) =>
                                    <MenuItem key={element.value} value={element.value}>{element.name}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                        <Autocomplete
                            className={inputClass}
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
                        statisticMerchandising?
                            <StatisticTable filterHeight={filterHeight} type='item' row={(statisticMerchandising.row).slice(1)} columns={statisticMerchandising.columns}/>
                            :null
                    }
                </CardContent>
            </Card>
            <div className='count' onClick={() =>setShowStat(!showStat)}>
                {
                    statisticMerchandising?
                        !(agent&&agent._id)?
                        <>
                        <div className={classes.rowStatic}>{`Всего: ${statisticMerchandising.row[0].data[0]}`}</div>
                        {
                            showStat?
                                <>
                                <div className={classes.rowStatic}> {`Проверено: ${statisticMerchandising.row[0].data[1]}`}</div>
                                <div className={classes.rowStatic}> {`Обработка: ${statisticMerchandising.row[0].data[2]}`}</div>
                                </>
                                :
                                null
                        }
                        </>
                            :
                            <>
                            <div className={classes.rowStatic}> {`Сделано: ${statisticMerchandising.row[0].data[0]}`}</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(MerchandisingStatistic);
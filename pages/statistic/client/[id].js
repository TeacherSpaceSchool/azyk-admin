import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import { urlMain } from '../../../redux/constants/other'
import initialApp from '../../../src/initialApp'
import Table from '../../../components/app/Table'
import { pdDatePicker } from '../../../src/lib'
import { getStatisticClient } from '../../../src/gql/statistic'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import { useRouter } from 'next/router'
import {  getClients } from '../../../src/gql/client'
import CircularProgress from '@material-ui/core/CircularProgress';
import { getClientGqlSsr } from '../../../src/getClientGQL'

const ClientStatistic = React.memo((props) => {
    const router = useRouter()
    const classes = pageListStyle();
    const { data } = props;
    let [dateStart, setDateStart] = useState(pdDatePicker(new Date()));
    let [dateType, setDateType] = useState('day');
    let [statisticClient, setStatisticClient] = useState(data.statisticClient?data.statisticClient:undefined);
    let [showStat, setShowStat] = useState(false);
    let [client, setClient] = useState(data.statisticClient?{_id: router.query.id}:undefined);
    const { showLoad } = props.appActions;
    const { isMobileApp, filter, city } = props.app;
    const [clients, setClients] = useState([]);
    const [inputValue, setInputValue] = React.useState('');
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        (async()=>{
            if (inputValue.length<3) {
                setClients([]);
                if(open)
                    setOpen(false)
                if(loading)
                    setLoading(false)
            }
            else {
                if(!loading)
                    setLoading(true)
                if(searchTimeOut)
                    clearTimeout(searchTimeOut)
                searchTimeOut = setTimeout(async()=>{
                    setClients((await getClients({search: inputValue, sort: '-name', filter: 'all', city})).clients)
                    if(!open)
                        setOpen(true)
                    setLoading(false)
                }, 500)
                setSearchTimeOut(searchTimeOut)
            }
        })()
    }, [inputValue]);
    const handleChange = event => {
        setInputValue(event.target.value);
    };
    let handleClient =  (client) => {
        setClient(client)
        setOpen(false)
    };
    useEffect(()=>{
        (async()=>{
            if(client) {
                await showLoad(true)
                setStatisticClient((await getStatisticClient({
                    client: client._id,
                    dateStart: dateStart ? dateStart : null,
                    dateType: dateType,
                    online: filter
                })).statisticClient)
                await showLoad(false)
            }
        })()
    },[client, dateStart, dateType, filter])
    useEffect(()=>{
        if(process.browser){
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    },[process.browser])
    const filters = [{name: 'Все', value: false}, {name: 'Online', value: true}]
    return (
        <App cityShow pageName='Статистика клиента' filters={filters}>
            <Head>
                <title>Статистика клиента</title>
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
                    <br/>
                    <div className={classes.row}>
                        {
                            !data.statisticClient?
                                <Autocomplete
                                    onClose={()=>setOpen(false)}
                                    open={open}
                                    disableOpenOnFocus
                                    className={classes.input}
                                    options={clients}
                                    getOptionLabel={option => `${option.name}${option.address&&option.address[0]?` (${option.address[0][2]?`${option.address[0][2]}, `:''}${option.address[0][0]})`:''}`}
                                    onChange={(event, newValue) => {
                                        handleClient(newValue)
                                    }}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField {...params} label='Выберите клиента' variant='outlined' fullWidth
                                                   onChange={handleChange}
                                                   InputProps={{
                                                       ...params.InputProps,
                                                       endAdornment: (
                                                           <React.Fragment>
                                                               {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                               {params.InputProps.endAdornment}
                                                           </React.Fragment>
                                                       ),
                                                   }}
                                        />
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
                        statisticClient?
                            <Table type='item' row={(statisticClient.row).slice(1)} columns={statisticClient.columns}/>
                            :null
                    }
                </CardContent>
            </Card>
            <div className='count' onClick={()=>setShowStat(!showStat)}>
                {
                    statisticClient?
                        <>
                        <div className={classes.rowStatic}>{`Компаний: ${statisticClient.row[0].data[0]}`}</div>
                        {
                            showStat?
                                <>
                                <div className={classes.rowStatic}>{`Выручка: ${statisticClient.row[0].data[1]} сом`}</div>
                                <div className={classes.rowStatic}>{`Выполнено: ${statisticClient.row[0].data[2]} шт`}</div>
                                <div className={classes.rowStatic}>{`Отказов: ${statisticClient.row[0].data[3]} сом`}</div>
                                <div className={classes.rowStatic}>{`Конс: ${statisticClient.row[0].data[4]} сом`}</div>
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
    if(ctx.query.id==='super')
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
            statisticClient: ctx.query.id==='super'?
                undefined
                :
                (await getStatisticClient({client: ctx.query.id, dateStart: new Date(), dateType: 'day',}, ctx.req?await getClientGqlSsr(ctx.req):undefined)).statisticClient
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
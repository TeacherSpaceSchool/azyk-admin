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
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { getStatisticClientActivity, getActiveOrganization } from '../../src/gql/statistic'
import { getClientGqlSsr } from '../../src/getClientGQL'
import * as appActions from '../../redux/actions/app'
import { bindActionCreators } from 'redux'

const ClientStatisticActive = React.memo((props) => {
    const { data } = props;
    const classes = pageListStyle();
    const { isMobileApp, filter, city } = props.app;
    const { showLoad } = props.appActions;
    const { profile } = props.user;
    const initialRender = useRef(true);
    let [activeOrganization, setActiveOrganization] = useState(data.activeOrganization);
    let [statisticActive, setStatisticActive] = useState(undefined);
    let [organization, setOrganization] = useState(undefined);
    useEffect(()=>{
        (async()=>{
            await showLoad(true)
            setStatisticActive((await getStatisticClientActivity({city: city, online: filter, ...(organization&&organization._id?{organization: organization._id}:{})}, undefined)).statisticClientActivity)
            await showLoad(false)
        })()
        },[filter, organization, activeOrganization])
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
    useEffect(()=>{
        if(process.browser){
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    },[process.browser])
    let [showStat, setShowStat] = useState(false);
    const filters = [{name: 'Все', value: false}, {name: 'Online', value: true}]
    return (
        <App cityShow pageName='Активность клиентов' filters={filters}>
            <Head>
                <title>Активность клиентов</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    {
                        profile.role==='admin'?
                            <div className={classes.row}>
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
                            </div>
                            :
                            null
                    }
                    {
                        statisticActive?
                            <>
                            <Table type='client' row={statisticActive.row.slice(1)} columns={statisticActive.columns}/>
                            <div className='count' onClick={()=>setShowStat(!showStat)}>
                                {
                                    statisticActive?
                                        <>
                                        <div className={classes.rowStatic}>{`Сегодня активность: ${statisticActive.row[0].data[4]}`}</div>
                                        <div className={classes.rowStatic}>{`Сегодня заказов: ${statisticActive.row[0].data[5]}`}</div>
                                        {
                                            showStat?
                                                <>
                                                <div className={classes.rowStatic}>{`Недельная активность: ${statisticActive.row[0].data[6]}`}</div>
                                                <div className={classes.rowStatic}>{`Недельные заказы: ${statisticActive.row[0].data[7]}`}</div>
                                                <div className={classes.rowStatic}>{`Месячная активность: ${statisticActive.row[0].data[8]}`}</div>
                                                <div className={classes.rowStatic}>{`Месячная заказы: ${statisticActive.row[0].data[9]}`}</div>
                                                <div className={classes.rowStatic}>{`Всего активности: ${statisticActive.row[0].data[2]}`}</div>
                                                <div className={classes.rowStatic}>{`Всего заказов: ${statisticActive.row[0].data[3]}`}</div>
                                                <div className={classes.rowStatic}>{`Без активности: ${statisticActive.row[0].data[0]}`}</div>
                                                <div className={classes.rowStatic}>{`Без заказов: ${statisticActive.row[0].data[1]}`}</div>
                                                </>
                                                :
                                                null
                                        }
                                        </>
                                        :null
                                }
                            </div>
                            </>
                            :null
                    }

                </CardContent>
            </Card>
        </App>
    )
})

ClientStatisticActive.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    ctx.store.getState().app.filter = true
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

export default connect(mapStateToProps, mapDispatchToProps)(ClientStatisticActive);
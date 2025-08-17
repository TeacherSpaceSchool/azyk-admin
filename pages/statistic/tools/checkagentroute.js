import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import initialApp from '../../../src/initialApp'
import Router from 'next/router'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { getAgentRoutes } from '../../../src/gql/agentRoute'
import { getCheckAgentRoute } from '../../../src/gql/statistic'
import { getOrganizations } from '../../../src/gql/organization'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import * as appActions from '../../../redux/actions/app'
import Table from '../../../components/app/StatisticTable'

const CheckAgentRoute = React.memo((props) => {
    const {profile} = props.user;
    const classes = pageListStyle();
    const {data} = props;
    const {showLoad} = props.appActions;
    let [organization, setOrganization] = useState(profile.organization?{_id: profile.organization}:null);
    let [agentRoutes, setAgentRoutes] = useState([]);
    let [agentRoute, setAgentRoute] = useState(null);
    const {isMobileApp, city} = props.app;
    const initialRender = useRef(true);
    let [organizations, setOrganizations] = useState(data.organizations);
    useEffect(() => {
        (async () => {
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                showLoad(true)
                setOrganization(null)
                setOrganizations([{name: 'AZYK.STORE', _id: 'super'}, ...await getOrganizations({search: '', filter: '', city})])
                showLoad(false)
            }
        })()
    }, [city])
    let [checkAgentRoute, setCheckAgentRoute] = useState(null);
    useEffect(() => {(async () => {
        setAgentRoute(null)
        if(organization)
            setAgentRoutes(await getAgentRoutes({search: '', organization: organization._id}))
        else setAgentRoutes([])
    })()}, [organization])
    useEffect(() => {
        (async () => {
            if(agentRoute) {
                showLoad(true)
                setCheckAgentRoute(await getCheckAgentRoute({agentRoute: agentRoute._id}))
                showLoad(false)
            }
        })()
    }, [agentRoute])
    useEffect(() => {
        if(process.browser) {
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    }, [process.browser])
    const inputClass = profile.role==='admin'?classes.inputHalf:classes.input
    const filterHeight = 58
    return (
        <App cityShow pageName='Проверка маршрутов'>
            <Head>
                <title>Проверка маршрутов</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        {
                            profile.role === 'admin' ?
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
                        <Autocomplete
                            className={inputClass}
                            options={agentRoutes}
                            getOptionLabel={option => option.district.name}
                            value={agentRoute}
                            onChange={(event, newValue) => {
                                setAgentRoute(newValue)
                            }}
                            noOptionsText='Ничего не найдено'
                            renderInput={params => (
                                <TextField {...params} label='Маршрут' fullWidth />
                            )}
                        />
                    </div>
                    <br/>
                    {
                        checkAgentRoute?
                            <Table filterHeight={filterHeight} type='item' row={checkAgentRoute.row} columns={checkAgentRoute.columns}/>
                            :null
                    }
                </CardContent>
            </Card>
            <div className='count'>
                {
                    checkAgentRoute?
                        `Пропущено: ${checkAgentRoute.row.length}`
                        :null
                }
            </div>
        </App>
    )
})

CheckAgentRoute.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data:
            {
                organizations: [{name: 'AZYK.STORE', _id: 'super'}, ...await getOrganizations({city: ctx.store.getState().app.city, search: '', filter: ''}, getClientGqlSsr(ctx.req))]
            }
    }
};

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckAgentRoute);
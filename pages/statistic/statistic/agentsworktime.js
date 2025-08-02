import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import initialApp from '../../../src/initialApp'
import Table from '../../../components/app/Table'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import { getStatisticAgentsWorkTime } from '../../../src/gql/statistic'
import { getOrganizations } from '../../../src/gql/organization'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import { pdDatePicker } from '../../../src/lib'

const AgentsWorkTime = React.memo((props) => {

    const classes = pageListStyle();
    const {data} = props;
    const {isMobileApp, city} = props.app;
    const {profile} = props.user;
    const initialRender = useRef(true);
    let [organizations, setOrganizations] = useState(data.organizations);
    let [dateStart, setDateStart] = useState(data.dateStart);
    let [statisticAgentsWorkTime, setStatisticAgentsWorkTime] = useState(null);
    let [organization, setOrganization] = useState(profile.organization?{_id: profile.organization}:null);
    const {showLoad} = props.appActions;
    useEffect(() => {
        showLoad(true)
            if(organization)
                (async () => {
                    setStatisticAgentsWorkTime(await getStatisticAgentsWorkTime({
                        organization: organization?organization._id:null,
                        dateStart
                    }))
                })()
            else setStatisticAgentsWorkTime(null)
        showLoad(false)
    }, [organization, dateStart])
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
    useEffect(() => {
        if(process.browser) {
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    }, [process.browser])

    const inputClass = profile.role==='admin'?classes.inputHalf:classes.input
    const filterHeight = 58
    return (
        <App cityShow pageName='Рабочие часы' >
            <Head>
                <title>Рабочие часы</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        {
                            profile.role==='admin'?
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
                                        <TextField {...params} label='Организация' fullWidth />
                                    )}
                                />
                                :null}
                        <TextField
                            className={inputClass}
                            label='Дата'
                            type='date'
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={dateStart}
                            onChange={ event => setDateStart(event.target.value) }
                        />
                    </div>
                    {
                        statisticAgentsWorkTime?
                            <Table filterHeight={filterHeight} type='item' row={statisticAgentsWorkTime.row} columns={statisticAgentsWorkTime.columns}/>
                            :null
                    }
                </CardContent>
            </Card>
        </App>
    )
})

AgentsWorkTime.getInitialProps = async function(ctx) {
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
    if(dateStart.getHours()<3)
        dateStart.setDate(dateStart.getDate() - 1)
    return {
        data: {
            organizations: [
                {name: 'AZYK.STORE', _id: 'super'},
                ...(ctx.store.getState().user.profile.organization?[]:await getOrganizations({city: ctx.store.getState().app.city, search: '', filter: ''}, getClientGqlSsr(ctx.req)))
            ],
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

export default connect(mapStateToProps, mapDispatchToProps)(AgentsWorkTime);
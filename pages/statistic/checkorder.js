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
import { getCheckOrder, getActiveOrganization } from '../../src/gql/statistic'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../redux/actions/app'

const CheckOrder = React.memo((props) => {

    const classes = pageListStyle();
    const { data } = props;
    const { isMobileApp, city } = props.app;
    const { profile } = props.user;
    let [dateStart, setDateStart] = useState(null);
    let [checkOrder, setCheckOrder] = useState(undefined);
    let [organization, setOrganization] = useState({_id: undefined});
    const { showLoad } = props.appActions;
    const initialRender = useRef(true);
    let [activeOrganization, setActiveOrganization] = useState(data.activeOrganization);
    useEffect(()=>{
        (async()=>{
            if(profile.role==='admin') {
                await showLoad(true)
                setCheckOrder((await getCheckOrder({
                    company: organization?organization._id:undefined,
                    today: dateStart ? dateStart : new Date(),
                    city: city
                })).checkOrder)
                await showLoad(false)
            }
        })()
    },[organization, dateStart, activeOrganization])
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
    return (
        <App cityShow pageName='Проверка заказов'>
            <Head>
                <title>Проверка заказов</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
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
                        <TextField
                            className={classes.input}
                            label='Дата'
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
                        checkOrder?
                            <Table type='item' row={(checkOrder.row).slice(1)} columns={checkOrder.columns}/>
                            :null
                    }
                </CardContent>
            </Card>
            <div className='count'>
                {
                    checkOrder?
                        <>
                        {`Повторяющихся: ${checkOrder.row[0].data[0]}`}<br/><br/>
                        {`Несинхронизированых: ${checkOrder.row[0].data[1]}`}
                        </>
                        :null
                }
            </div>
        </App>
    )
})

CheckOrder.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin'].includes(ctx.store.getState().user.profile.role))
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

export default connect(mapStateToProps, mapDispatchToProps)(CheckOrder);
import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import initialApp from '../../../src/initialApp'
import Table from '../../../components/app/Table'
import { getStatisticDevice } from '../../../src/gql/statistic'
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'

const DeviceStatistic = React.memo((props) => {
    const classes = pageListStyle();
    const {isMobileApp, filter} = props.app;
    let [statisticDevice, setStatisticDevice] = useState(null);
    const {showLoad} = props.appActions;
    useEffect(() => {
        (async () => {
                showLoad(true)
                setStatisticDevice(await getStatisticDevice({filter}))
                showLoad(false)
        })()
    }, [filter])
    useEffect(() => {
        if(process.browser) {
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    }, [process.browser])
    const filters = [{name: 'Девайс', value: 'device'}, {name: 'Производитель', value: 'company'}, {name: 'OC', value: 'os'}, {name: 'Версия OC', value: 'os-version'}, {name: 'Браузер', value: 'browser'}, {name: 'Версия браузера', value: 'browser-version'}]
    return (
        <App filters={filters} pageName='Девайсы'>
            <Head>
                <title>Девайсы</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    {
                        statisticDevice?
                            <Table type='item' row={statisticDevice.row} filterHeight={0} columns={statisticDevice.columns}/>
                            :null
                    }
                </CardContent>
            </Card>
        </App>
    )
})

DeviceStatistic.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    ctx.store.getState().app.filter = 'device'
    if('admin'!==ctx.store.getState().user.profile.role)
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {}
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

export default connect(mapStateToProps, mapDispatchToProps)(DeviceStatistic);
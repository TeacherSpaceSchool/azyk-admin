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
import { pdDatePicker } from '../../../src/lib'
import {getStatisticUnsyncOrder, repairUnsyncOrder} from '../../../src/gql/statistic'
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import Fab from '@material-ui/core/Fab';
import Confirmation from '../../../components/dialog/Confirmation';
import BuildIcon from '@material-ui/icons/Build';
import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import * as snackbarActions from '../../../redux/actions/snackbar'

const Unsyncorder = React.memo((props) => {
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const classes = pageListStyle();
    const {showSnackBar} = props.snackbarActions;
    const {isMobileApp} = props.app;
    let [statisticUnsyncOrder, setStatisticUnsyncOrder] = useState(null);
    let [showStat, setShowStat] = useState(false);
    const {showLoad} = props.appActions;
    useEffect(() => {
        (async () => {
            showLoad(true)
            setStatisticUnsyncOrder(await getStatisticUnsyncOrder())
            showLoad(false)
        })()
    }, [])
    useEffect(() => {
        if(process.browser) {
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    }, [process.browser])
    return (
        <App pageName='Несинхронизованные заказы 1С'>
            <Head>
                <title>Несинхронизованные заказы 1С</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    {
                        statisticUnsyncOrder?
                            <Table type='item' row={statisticUnsyncOrder.row} columns={statisticUnsyncOrder.columns}/>
                            :null
                    }
                </CardContent>
            </Card>
            {
                statisticUnsyncOrder&&statisticUnsyncOrder.row.length?
                    <>
                        <div className='count' onClick={()=>setShowStat(!showStat)}>
                            {statisticUnsyncOrder.row.length}
                        </div>
                        <Fab onClick={() => {
                            const action = async () => {
                                const res = await repairUnsyncOrder()
                                if(res==='OK')
                                    setStatisticUnsyncOrder(null)
                                else
                                    showSnackBar('Ошибка')
                            }
                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                            showMiniDialog(true)
                        }} color='primary' className={classes.fab}>
                            <BuildIcon/>
                        </Fab>
                    </>
                    :
                    null
            }
        </App>
    )
})

Unsyncorder.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    let date = new Date()
    if(date.getHours()<3)
        date.setDate(date.getDate() - 1)
    ctx.store.getState().app.date = pdDatePicker(date)
    return {};
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Unsyncorder);
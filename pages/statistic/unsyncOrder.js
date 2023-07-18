import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import { urlMain } from '../../redux/constants/other'
import initialApp from '../../src/initialApp'
import Table from '../../components/app/Table'
import { pdDatePicker } from '../../src/lib'
import {getStatisticUnsyncOrder} from '../../src/gql/statistic'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as appActions from '../../redux/actions/app'

const UnsyncOrder = React.memo((props) => {

    const classes = pageListStyle();
    const { isMobileApp, city, date } = props.app;
    let [statisticUnsyncOrder, setStatisticUnsyncOrder] = useState(undefined);
    let [showStat, setShowStat] = useState(false);
    const { showLoad } = props.appActions;
    useEffect(()=>{
        (async()=>{
            await showLoad(true)
            setStatisticUnsyncOrder((await getStatisticUnsyncOrder({
                dateStart: date ? date : null,
                city: city
            })).statisticUnsyncOrder)
            await showLoad(false)
        })()
    },[date, city])
    useEffect(()=>{
        if(process.browser){
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    },[process.browser])
    return (
        <App dates cityShow pageName='Несинхронизованные заказы'>
            <Head>
                <title>Несинхронизованные заказы</title>
                <meta name='description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:title' content='Статистика заказов AZYK.STORE' />
                <meta property='og:description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:type' content='website' />
                <meta property='og:image' content={`${urlMain}/static/512x512.png`} />
                <meta property='og:url' content={`${urlMain}/statistic/unsyncorder`} />
                <link rel='canonical' href={`${urlMain}/statistic/unsyncorder`}/>
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
                    <div className='count' onClick={()=>setShowStat(!showStat)}>
                        {statisticUnsyncOrder.row.length}
                    </div>
                    :
                    null
            }
        </App>
    )
})

UnsyncOrder.getInitialProps = async function(ctx) {
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
    if (date.getHours()<3)
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
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UnsyncOrder);
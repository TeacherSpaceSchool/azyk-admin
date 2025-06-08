import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as userActions from '../../redux/actions/user'
import { getNotificationStatistics } from '../../src/gql/notificationStatisticAzyk'
import pageListStyle from '../../src/styleMUI/notificationStatistic/notificationStatisticList'
import CardNotificationStatistic from '../../components/notificationStatistic/CardNotificationStatistic'
import { urlMain } from '../../redux/constants/other'
import LazyLoad from 'react-lazyload';
import CardNotificationStatisticPlaceholder from '../../components/notificationStatistic/CardNotificationStatisticPlaceholder'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import Router from 'next/router'

const NotificationStatistic = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    let [list, setList] = useState(data.notificationStatistics);
    const { profile } = props.user;
    const { search } = props.app;
    useEffect(()=>{
        (async()=>{
            setPagination(100)
            setList((await getNotificationStatistics({search})).notificationStatistics)
        })()
    },[search])
    let height = 214
    let [pagination, setPagination] = useState(100);
    const checkPagination = ()=>{
        if(pagination<list.length){
            setPagination(pagination+100)
        }
    }
    return (
        <App searchShow={true} checkPagination={checkPagination} pageName='Пуш-уведомления'>
            <Head>
                <title>Пуш-уведомления</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                {`Всего: ${list.length}`}
            </div>
            <div className={classes.page}>
                <CardNotificationStatistic setList={setList}/>
                {list?list.map((element, idx)=> {
                        if(idx<=pagination)
                            return(
                                <LazyLoad scrollContainer={'.App-body'} key={element._id} height={height} offset={[height, 0]} debounce={0} once={true}  placeholder={<CardNotificationStatisticPlaceholder height={height}/>}>
                                    <CardNotificationStatistic key={element._id} setList={setList} element={element}/>
                                </LazyLoad>
                            )}
                ):null}
            </div>
        </App>
    )
})

NotificationStatistic.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(ctx.store.getState().user.profile.role!=='admin')
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: await getNotificationStatistics({search: ''},ctx.req?await getClientGqlSsr(ctx.req):undefined)
    };
};

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationStatistic);
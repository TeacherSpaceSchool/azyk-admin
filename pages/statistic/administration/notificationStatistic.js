import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as userActions from '../../../redux/actions/user'
import { getNotificationStatistics } from '../../../src/gql/notificationStatisticAzyk'
import pageListStyle from '../../../src/styleMUI/notificationStatistic/notificationStatisticList'
import CardNotificationStatistic from '../../../components/card/CardNotificationStatistic'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import initialApp from '../../../src/initialApp'
import Router from 'next/router'
import {formatAmount} from '../../../src/lib';
import {viewModes} from '../../../src/enum';
import Table from '../../../components/table/notificationStatistic';

const NotificationStatistic = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    let [list, setList] = useState(data.notificationStatistics);
    const {search, viewMode} = props.app;
    const initialRender = useRef(true);
    useEffect(() => {
        if(initialRender.current)
            initialRender.current = false;
        else (async () => {
            setPagination(100)
            setList(await getNotificationStatistics({search}))
        })()
    }, [search])
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [pagination, list])
    return (
        <App searchShow checkPagination={checkPagination} pageName='Пуш-уведомления'>
            <Head>
                <title>Пуш-уведомления</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                Всего: {formatAmount(list.length)}
            </div>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                {list?viewMode===viewModes.card?
                        <>
                            <CardNotificationStatistic list={list} setList={setList}/>
                            {list.map((element, idx) => {
                                if(idx<pagination)
                                    return <CardNotificationStatistic key={element._id} list={list} setList={setList} element={element}/>
                            })}
                        </>
                        :
                        <Table list={list} pagination={pagination}/>
                    :null}
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
        data: {
            notificationStatistics: await getNotificationStatistics({search: ''},getClientGqlSsr(ctx.req))
        }
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
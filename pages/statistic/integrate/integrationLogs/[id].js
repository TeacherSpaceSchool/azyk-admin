import Head from 'next/head';
import React, {useState, useRef, useEffect, useCallback} from 'react';
import App from '../../../../layouts/App';
import pageListStyle from '../../../../src/styleMUI/orders/orderList'
import {getIntegrationLogs} from '../../../../src/gql/integrationLog'
import { connect } from 'react-redux'
import Router from 'next/router'
import { getClientGqlSsr } from '../../../../src/getClientGQL'
import initialApp from '../../../../src/initialApp'
import * as mini_dialogActions from '../../../../redux/actions/mini_dialog'
import { bindActionCreators } from 'redux'
import { useRouter } from 'next/router'
import CardIntegrationLog from '../../../../components/card/CardIntegrationLog';
import {unawaited} from '../../../../src/lib';
import {viewModes} from '../../../../src/enum';
import Table from '../../../../components/table/integrationLogs';

const filters = [{name: 'Все', value: ''}, {name: '/:pass/put/item', value: '/:pass/put/item'}, {name: '/:pass/put/warehouse', value: '/:pass/put/warehouse'}, {name: '/:pass/put/stock', value: '/:pass/put/stock'}, {name: '/:pass/put/client', value: '/:pass/put/client'}, {name: '/:pass/put/employment', value: '/:pass/put/employment'}, {name: '/:pass/put/specialpriceclient', value: '/:pass/put/specialpriceclient'}, {name: '/:pass/put/limititemclient', value: '/:pass/put/limititemclient'}, {name: '/:pass/put/specialpricecategory', value: '/:pass/put/specialpricecategory'}]

const IntegrationLog = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    const {filter, viewMode} = props.app;
    let [list, setList] = useState(data.integrationLogs);
    const paginationWork = useRef(true);
    const initialRender = useRef(true);
    const router = useRouter()
    const getList = async () => {
        setList(await getIntegrationLogs({filter, organization: router.query.id, skip: 0}))
        paginationWork.current = true;
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(() => {
        if(initialRender.current) initialRender.current = false
        else unawaited(getList)
    }, [filter])
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            let addedList = await getIntegrationLogs({filter, organization: router.query.id, skip: list.length})
            if(addedList.length) {
                setList([...list, ...addedList])
                paginationWork.current = true
            }
        }
    }, [filter, list])
    return (
        <App checkPagination={checkPagination} list={list} setList={setList} filters={filters} pageName='Логи 1С'>
            <Head>
                <title>Логи 1С</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                {list?viewMode===viewModes.card?
                        list.map(element => <CardIntegrationLog element={element} key={element._id}/>)
                        :
                        <Table list={list}/>
                    :null}
            </div>
        </App>
    )
})

IntegrationLog.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if('admin'!==ctx.store.getState().user.profile.role)
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            integrationLogs: await getIntegrationLogs({organization: ctx.query.id, skip: 0}, getClientGqlSsr(ctx.req))
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
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(IntegrationLog);
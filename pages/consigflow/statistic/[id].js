import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../layouts/App';
import pageListStyle from '../../src/styleMUI/statistic/statisticsList'
import {getConsigFlows} from '../../src/gql/consigFlow'
import CardConsigFlows from '../../components/card/CardConsigFlow'
import { connect } from 'react-redux'
import Router from 'next/router'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import { useRouter } from 'next/router'
import {getWarehouses} from '../../src/gql/warehouse';
import {formatAmount, unawaited} from '../../src/lib';
import {viewModes} from '../../src/enum';
import Table from '../../components/table/stocks';

const ConsigFlows = React.memo((props) => {
    const classes = pageListStyle();
    const router = useRouter()
    //props
    const {profile} = props.user;
    const {data} = props;
    const {viewMode, client, district} = props.app;
    //ref
    const initialRender = useRef(true);
    const paginationWork = useRef(true);
    //deps
    const deps = [client, district]
    //listArgs
    const listArgs = {...router.query.invoice?{invoice: router.query.invoice}:{}, client, district, organization: router.query._id}
    //list
    let [list, setList] = useState(data.stocks);
    const getList = async (skip) => {
        const gettedData = await getConsigFlows({...listArgs, skip: skip||0})
        if(!skip) {
            setList(gettedData)
            paginationWork.current = true;
            (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        }
        else if(gettedData.length) {
            setList(list => [...list, ...gettedData])
            paginationWork.current = true
        }
    }
    //pagination
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            await getList(list.length)
        }
    }, [list, ...deps])
    //filter
    useEffect(() => {
        if(!initialRender.current)
            unawaited(getList)
    }, deps)
    //render
    return (
        <App checkPagination={checkPagination} searchShow pageName='Остатки'>
            <Head>
                <title>Остатки</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                Всего: {formatAmount(list.length)}
            </div>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                {list?viewMode===viewModes.card?
                        <>
                            {
                                ['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                                    <CardConsigFlows list={list} setList={setList} warehouses={data.warehouses} organization={router.query.id}/>
                                    :
                                    null
                            }
                            {list?list.map((element, idx) => {
                                if(idx<pagination)
                                    return <CardConsigFlows idx={idx} key={element._id} warehouses={data.warehouses} organization={router.query.id} list={list} setList={setList} element={element}/>
                            }):null}
                        </>
                        :
                        <Table list={list} pagination={pagination}/>
                    :null}
            </div>
        </App>
    )
})

ConsigFlows.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    // eslint-disable-next-line no-undef
    const [warehouses, stocks] = await Promise.all([
        getWarehouses({organization: ctx.query.id, search: ''}, getClientGqlSsr(ctx.req)),
        getConsigFlows({organization: ctx.query.id, search: ''}, getClientGqlSsr(ctx.req))
    ])
    return {
        data: {
            ...warehouses?{warehouses: [defaultWarehouse, ...warehouses]}:{},
            stocks
        }
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(ConsigFlows);
import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../layouts/App';
import pageListStyle from '../../src/styleMUI/statistic/statisticsList'
import {getStocks} from '../../src/gql/stock'
import CardStock from '../../components/card/CardStock'
import { connect } from 'react-redux'
import Router from 'next/router'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import { useRouter } from 'next/router'
import {getWarehouses} from '../../src/gql/warehouse';
import {formatAmount, unawaited} from '../../src/lib';
import {viewModes} from '../../src/enum';
import Table from '../../components/table/stocks';

const defaultWarehouse = {name: 'Основной'}

const Stock = React.memo((props) => {
    const classes = pageListStyle();
    const router = useRouter()
    //props
    const {profile} = props.user;
    const {data} = props;
    const {search, viewMode} = props.app;
    //ref
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    //listArgs
    const listArgs = {organization: router.query.id, search}
    //list
    let [list, setList] = useState(data.stocks);
    const getList = async () => {
        setList(await getStocks(listArgs))
        setPagination(100);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    //search
    useEffect(() => {
            if(initialRender.current)
                initialRender.current = false;
            else {
                if(searchTimeOut.current)
                    clearTimeout(searchTimeOut.current)
                searchTimeOut.current = setTimeout(() => unawaited(getList), 500)
            }
    }, [search])
    //pagination
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [pagination, list])
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
                                    <CardStock list={list} setList={setList} warehouses={data.warehouses} organization={router.query.id}/>
                                    :
                                    null
                            }
                            {list?list.map((element, idx) => {
                                if(idx<pagination)
                                    return <CardStock idx={idx} key={element._id} warehouses={data.warehouses} organization={router.query.id} list={list} setList={setList} element={element}/>
                            }):null}
                        </>
                        :
                        <Table list={list} pagination={pagination}/>
                    :null}
            </div>
        </App>
    )
})

Stock.getInitialProps = async function(ctx) {
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
        getStocks({organization: ctx.query.id, search: ''}, getClientGqlSsr(ctx.req))
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

export default connect(mapStateToProps)(Stock);
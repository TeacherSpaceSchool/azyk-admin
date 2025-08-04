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
import {unawaited} from '../../src/lib';

const defaultWarehouse = {name: 'Основной'}

const Stock = React.memo((props) => {
    const {profile} = props.user;
    const classes = pageListStyle();
    const {data} = props;
    let [list, setList] = useState(data.stocks);
    const {search} = props.app;
    const router = useRouter()
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    const getList = async () => {
        setList(await getStocks({organization: router.query.id, search}))
        setPagination(100);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(() => {
        if(!initialRender.current) unawaited(getList)
    }, [])
    useEffect(() => {
            if(initialRender.current)
                initialRender.current = false;
            else {
                if(searchTimeOut.current)
                    clearTimeout(searchTimeOut.current)
                searchTimeOut.current = setTimeout(() => unawaited(getList), 500)
            }
    }, [search])
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [pagination, list])
    return (
        <App checkPagination={checkPagination} searchShow pageName='Остатки'>
            <Head>
                <title>Остатки</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                {`Всего: ${list.length}`}
            </div>
            <div className={classes.page}>
                {
                    ['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                        <CardStock list={list} setList={setList} warehouses={data.warehouses} organization={router.query.id}/>
                        :
                        null
                }
                {list?list.map((element, idx)=> {
                    if(idx<pagination)
                        return(
                            <CardStock idx={idx} key={element._id} warehouses={data.warehouses} organization={router.query.id} list={list} setList={setList} element={element}/>
                        )
                }):null}
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
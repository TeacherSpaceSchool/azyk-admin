import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../layouts/App';
import CardOrder from '../components/card/CardOrder'
import pageListStyle from '../src/styleMUI/orders/orderList'
import {getOrders} from '../src/gql/order'
import { connect } from 'react-redux'
import Router from 'next/router'
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import Fab from '@material-ui/core/Fab';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import Confirmation from '../components/dialog/Confirmation'
import { getInvoicesSimpleStatistic, acceptOrders } from '../src/gql/order'
import * as mini_dialogActions from '../redux/actions/mini_dialog'
import * as appActions from '../redux/actions/app'
import { bindActionCreators } from 'redux'
import CircularProgress from '@material-ui/core/CircularProgress';
import {formatAmount, unawaited} from '../src/lib';
import Table from '../components/table/orders';
import {viewModes} from '../src/enum';

const filters = [{name: 'Все', value: ''}, {name: 'Обработка', value: 'обработка'}, {name: 'Акции', value: 'акция'}, {name: 'Без геолокации', value: 'Без геолокации'}, {name: 'Не синхронизированные', value: 'Не синхронизированные'}]

const Orders = React.memo((props) => {
    const classes = pageListStyle();
    //ref
    const initialRender = useRef(true);
    const paginationWork = useRef(true);
    //props
    const {data} = props;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {showLoad} = props.appActions;
    const {search, filter, sort, date, organization, city, viewMode, agent, district, forwarder} = props.app;
    const {profile} = props.user;
    //deps
    const deps = [filter, sort, date, organization, city, agent, district, forwarder]
    //listArgs
    const listArgs = {search, filter, date, organization, city, agent, district, forwarder}
    //simpleStatistic
    let [showStat, setShowStat] = useState(false);
    let [simpleStatistic, setSimpleStatistic] = useState(['0']);
    const getSimpleStatistic = async () => setSimpleStatistic(await getInvoicesSimpleStatistic(listArgs))
    //list
    let [list, setList] = useState(data.orders);
    const getList = async (skip) => {
        const gettedData = await getOrders({...listArgs, sort, skip: skip||0})
        if(!skip) {
            unawaited(getSimpleStatistic)
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
    }, [list, search, ...deps])
    //filter
    useEffect(() => {
        if(!initialRender.current) {
            unawaited(async () => {
                showLoad(true)
                await getList()
                showLoad(false)
            })
        }
    }, deps)
    //search
    const [searchTimeOut, setSearchTimeOut] = useState(null);
    useEffect(() => {
        (async () => {
            if(initialRender.current) {
                initialRender.current = false;
                unawaited(getSimpleStatistic)
            } else {
                if(searchTimeOut)
                    clearTimeout(searchTimeOut)
                setSearchTimeOut(setTimeout(async () => {
                    await getList()
                    setSearchTimeOut(null)
                }, 500))
            }
        })()
    }, [search])
    //render
    return (
        <App organizations filters={!profile.client&&filters} cityShow showForwarder showDistrict agents checkPagination={checkPagination} list={list} setList={setList} searchShow dates pageName='Заказы'>
            <Head>
                <title>Заказы</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count' onClick={() =>setShowStat(!showStat)}>
                Заказов: {formatAmount(simpleStatistic[0])}
                {
                    showStat?
                        <>
                            <br/>
                            Сумма: {formatAmount(simpleStatistic[1])} сом
                            <br/>
                            Тоннаж: {formatAmount(simpleStatistic[2])} кг
                        </>
                        :
                        null
                }
            </div>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                {
                    searchTimeOut?
                        <CircularProgress style={{position: 'fixed', top: '50vh'}}/>
                        :
                        list?viewMode===viewModes.card?
                            list.map((element, idx) => <CardOrder key={element._id} idx={idx} list={list} setList={setList} element={element}/>)
                            :
                            <Table list={list} setList={setList}/>
                        :null
                }
            </div>
            {profile.role==='admin'&&filter==='обработка'?
                <Fab onClick={() => {
                    const action = async () => await acceptOrders()
                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                    showMiniDialog(true);
                }} color='primary' className={classes.fab}>
                    <DoneAllIcon/>
                </Fab>
                :
                null
            }
        </App>
    )
})

Orders.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['экспедитор', 'admin', 'суперорганизация', 'организация', 'менеджер', 'client', 'агент', 'суперагент', 'суперэкспедитор'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            orders: await getOrders({city: ctx.store.getState().app.city, search: '', sort: '-createdAt', filter: '', date: '', skip: 0}, getClientGqlSsr(ctx.req))
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
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Orders);
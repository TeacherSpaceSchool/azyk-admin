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
import SettingsIcon from '@material-ui/icons/Settings';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
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
    const {data} = props;
    const initialRender = useRef(true);
    let [simpleStatistic, setSimpleStatistic] = useState(['0']);
    const getSimpleStatistic = async () => setSimpleStatistic(await getInvoicesSimpleStatistic({search, filter, date, organization, city, agent, district}))
    let [list, setList] = useState(data.orders);
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {showLoad} = props.appActions;
    const {search, filter, sort, date, organization, city, viewMode, agent, district} = props.app;
    const {profile} = props.user;
    const paginationWork = useRef(true);
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            let addedList = await getOrders({search, sort, filter, date, skip: list.length, organization, city})
            if(addedList.length) {
                setList([...list, ...addedList])
                paginationWork.current = true
            }
        }
    }, [search, sort, filter, date, organization, city, list])
    const getList = async () => {
        unawaited(getSimpleStatistic)
        const orders = await getOrders({search, sort, filter, date, skip: 0, organization, city, agent, district})
        setList(orders);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant'});
        paginationWork.current = true
     }
    useEffect(() => {
        if(!initialRender.current) {
            unawaited(async () => {
                showLoad(true)
                await getList()
                showLoad(false)
            })
        }
    }, [filter, sort, date, organization, city, agent, district])
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
    let [showStat, setShowStat] = useState(false);
    let [anchorEl, setAnchorEl] = useState(null);
    let open = event => {
        setAnchorEl(event.currentTarget);
    };
    let close = () => setAnchorEl(null);
    return (
        <App organizations filters={!profile.client&&filters} cityShow showDistrict agents checkPagination={checkPagination} list={list} setList={setList} searchShow dates pageName='Заказы'>
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
                <Fab onClick={open} color='primary' className={classes.fab}>
                    <SettingsIcon />
                </Fab>
                :
                null
            }
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={close}
                className={classes.menu}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <MenuItem onClick={() => {
                    const action = async () => await acceptOrders()
                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                    showMiniDialog(true);
                    close()
                }}>Принять</MenuItem>
            </Menu>
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
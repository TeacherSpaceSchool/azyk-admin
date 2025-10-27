import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import Router, {useRouter} from 'next/router'
import initialApp from '../../../src/initialApp'
import {checkFloat, dayStartDefault, formatAmount, pdDatePicker, unawaited} from '../../../src/lib'
import {getOrders} from '../../../src/gql/order'
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import * as snackbarActions from '../../../redux/actions/snackbar'
import Table from '../../../components/table/changelogistic';
import {getEmployment} from '../../../src/gql/employment';
import ChangeLogistic from '../../../components/dialog/ChangeLogistic';
import {getClientGqlSsr} from '../../../src/getClientGQL';
import QuickTransition from '../QuickTransition';

const sort = 'createdAt'
const filters = [
    {name: 'Все', value: null},
    {name: 'Рейс 1', value: 1},
    {name: 'Рейс 2', value: 2},
    {name: 'Рейс 3', value: 3},
    {name: 'Рейс 4', value: 4},
    {name: 'Рейс 5', value: 5},
]

const Id = React.memo((props) => {
    const classes = pageListStyle();
    const router = useRouter()
    //ref
    const initialRender = useRef(true);
    const searchTimeOut = useRef(null);
    const contentRef = useRef();
    //props
    const {search, filter, date, agent, district, forwarder} = props.app;
    const {showLoad} = props.appActions;
    const {showMiniDialog, setMiniDialog} = props.mini_dialogActions;
    const {showSnackBar} = props.snackbarActions;
    //forwarderData
    let [forwarderData, setForwarderData] = useState(null);
    useEffect(() => {(async () => {
        if(forwarder) setForwarderData(await getEmployment(forwarder))
        else setForwarderData(null)
    })()}, [forwarder])
    //deps
    const deps = [filter, date, agent, district, forwarder]
    //listArgs
    const listArgs = {search, track: filter, filter: '', dateDelivery: date, date: '', organization: router.query.id, agent, district, forwarder}
    //selectedOrders
    let [selectedOrders, setSelectedOrders] = useState([]);
    //list
    let [list, setList] = useState([]);
    const getList = async () => {
        if(date) {
            showLoad(true)
            const orders = await getOrders({...listArgs, sort})
            showLoad(false)
            setList(orders);
            setPagination(100);
            (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        }
        else {
            setList([])
            showSnackBar(`Укажите:${!date?' дату доставки;':''}`)
        }
    }
    //filter
    useEffect(() => {
        setSelectedOrders([])
        unawaited(getList)
    }, deps)
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
    //ordersData
    let [ordersData, setOrdersData] = useState({});
    useEffect(() => {
        ordersData = {
            priceAll: 0,
            weightAll: 0,
            priceSelected: 0,
            weightSelected: 0,
        }
        const iterableList = selectedOrders.length?selectedOrders:list
        const priceField = selectedOrders.length?'priceSelected':'priceAll'
        const weightField = selectedOrders.length?'weightSelected':'weightAll'
        for (let i = 0; i < iterableList.length; i++) {
            ordersData[priceField] = checkFloat(ordersData[priceField] + (iterableList[i].allPrice - iterableList[i].returnedPrice))
            ordersData[weightField] = checkFloat(ordersData[weightField] + iterableList[i].allTonnage)
        }
        setOrdersData({...ordersData})
    }, [selectedOrders, list])
    //pagination
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [pagination, list])
    //menu
    let [anchorEl, setAnchorEl] = useState(null);
    let open = event => setAnchorEl(event.currentTarget);
    let close = () => setAnchorEl(null);
    //double
    const double = contentRef.current&&contentRef.current.offsetWidth>=1180
    //middleList
    const middleList = list?Math.ceil(list.length/2):0
    //changeLogistic
    const changeLogistic = (type) => {
        close()
        setMiniDialog('Логистика', <ChangeLogistic dateDelivery={date} setSelectedOrders={setSelectedOrders} type={type} invoices={selectedOrders.map(selectedOrder => selectedOrder._id)} getList={getList}/>)
        showMiniDialog(true)
    }
    //render
    return <App searchShow showDistrict agents showForwarder pageName='Редактирование логистики' dates checkPagination={checkPagination} filters={filters}>
        <Head>
            <title>Редактирование логистики</title>
            <meta name='robots' content='noindex, nofollow'/>
        </Head>
        {list.length?<>
            <div ref={contentRef} style={{display: 'flex', flexDirection: 'row', marginBottom: 30}}>
                <Table pagination={pagination} forwarderData={forwarderData} list={double?list.slice(0, middleList):list} selectedOrders={selectedOrders} setSelectedOrders={setSelectedOrders}/>
                {double?<Table pagination={pagination} middleList={middleList} forwarderData={forwarderData} list={list.slice(middleList)} selectedOrders={selectedOrders} setSelectedOrders={setSelectedOrders}/>:null}
            </div>
            {selectedOrders.length||forwarder?<><Fab onClick={open} color='primary' className={classes.fab}>
                <SettingsIcon />
            </Fab>
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
                {selectedOrders.length?<MenuItem onClick={() => changeLogistic('track')}>Изменить рейс</MenuItem>:null}
                {forwarder?<>
                    {selectedOrders.length?<MenuItem onClick={() => changeLogistic('forwarder')}>Изменить экспедитора</MenuItem>:null}
                    <MenuItem onClick={() => {setSelectedOrders([...list]);close()}}>Выбрать все</MenuItem>
                </>:null}
                {selectedOrders.length?<MenuItem onClick={() => {setSelectedOrders([]);close()}}>Отменить выбор</MenuItem>:null}
            </Menu></>:null}
            <QuickTransition/>
            <div className='count'>
                Всего: {formatAmount(selectedOrders.length||list.length)}
                <br/>
                Сумма: {formatAmount(ordersData.priceSelected||ordersData.priceAll)} сом
                <br/>
                Тоннаж: {formatAmount(ordersData.weightSelected||ordersData.weightAll)} кг
            </div>
        </>:!date?`Укажите:${!date?' дату доставки;':''}`:null}
    </App>
})

Id.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['суперорганизация', 'организация', 'admin', 'менеджер', 'агент'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    if(!ctx.store.getState().app.date) {
        let date = new Date()
        if (date.getHours() < dayStartDefault)
            date.setDate(date.getDate() - 1)
        ctx.store.getState().app.date = pdDatePicker(date)
    }
    if(!ctx.store.getState().app.filter)
        ctx.store.getState().app.filter = null
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

export default connect(mapStateToProps, mapDispatchToProps)(Id);
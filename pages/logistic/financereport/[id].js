import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import Router, {useRouter} from 'next/router'
import initialApp from '../../../src/initialApp'
import {checkFloat, dayStartDefault, formatAmount, pdDatePicker, pdDDMMYYYY, unawaited} from '../../../src/lib'
import { bindActionCreators } from 'redux'
import Fab from '@material-ui/core/Fab';
import PrintIcon from '@material-ui/icons/Print';
import Table from '../../../components/table/financereport';
import {getEmployment} from '../../../src/gql/employment';
import {getFinanceReport} from '../../../src/gql/logistic';
import * as appActions from '../../../redux/actions/app'
import * as snackbarActions from '../../../redux/actions/snackbar'
import {printHTML} from '../../../components/print';
import templateFinanceReport from '../../../components/print/template/financeReport';
import QuickTransition from '../QuickTransition';

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
    const contentRef = useRef();
    //props
    const {filter, date, forwarder} = props.app;
    const {showLoad} = props.appActions;
    const {showSnackBar} = props.snackbarActions;
    //forwarderData
    let [forwarderData, setForwarderData] = useState(null);
    useEffect(() => {(async () => {
        if(forwarder) setForwarderData(await getEmployment(forwarder))
        else setForwarderData(null)
    })()}, [forwarder])
    //deps
    const deps = [filter, date, forwarder]
    //listArgs
    const listArgs = {track: filter, dateDelivery: date, organization: router.query.id, forwarder}
    //list
    let [list, setList] = useState([]);
    const getList = async (excel) => {
        if(date&&forwarder) {
            showLoad(true)
            const list = await getFinanceReport({...listArgs, excel})
            showLoad(false)
            if (!excel) {
                setList(list);
                setPagination(100);
                (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant'});
            } else window.open(list[0][0], '_blank');
        }
        else {
            setList([])
            showSnackBar(`Укажите:${!date?' дату доставки;':''}${!forwarder?' экспедитора;':''}`)
        }
    }
    //filter
    useEffect(() => {
        unawaited(getList)
    }, deps)
    //ordersData
    let [ordersData, setOrdersData] = useState({});
    useEffect(() => {
        ordersData = {
            allPrice: 0,
            paymentPrice: 0,
            returnedPrice: 0,
        }
        for (let i = 0; i < list.length; i++) {
            ordersData.allPrice = checkFloat(ordersData.allPrice + checkFloat(list[i][1]))
            ordersData.paymentPrice = checkFloat(ordersData.paymentPrice + checkFloat(list[i][2]))
            ordersData.returnedPrice = checkFloat(ordersData.returnedPrice + checkFloat(list[i][4]))
        }
        setOrdersData({...ordersData})
    }, [list])
    //pagination
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [pagination, list])
    //render
    return <App showForwarder pageName='Отчет по деньгам' dates checkPagination={checkPagination} filters={filters}>
        <Head>
            <title>Отчет по деньгам</title>
            <meta name='robots' content='noindex, nofollow'/>
        </Head>
        {list.length?<>
            <div ref={contentRef} style={{display: 'flex', flexDirection: 'row', marginBottom: 30}}>
                <Table pagination={pagination} forwarderData={forwarderData} list={list}/>
            </div>
            <Fab
                color='primary' className={classes.fab}
                onClick={() => printHTML({ data: {list, forwarderData, date, filter, ordersData}, template: templateFinanceReport, title: `Отчет по деньгам ${pdDDMMYYYY(date)}`})}
            >
                <PrintIcon />
            </Fab>
        </>:!date||!forwarder?`Укажите:${!date?' дату доставки;':''}${!forwarder?' экспедитора;':''}`:null}
        <QuickTransition/>
        <div className='count'>
            Всего: {formatAmount(list.length)}
            <br/>
            Отгружено: {formatAmount(ordersData.allPrice)} сом
            <br/>
            К оплате: {formatAmount(ordersData.paymentPrice)} сом
            <br/>
            Возврат: {formatAmount(ordersData.returnedPrice)} сом
        </div>
    </App>
})

Id.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация', 'организация', 'агент', 'менеджер'].includes(ctx.store.getState().user.profile.role))
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
        app: state.app
    }
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
        snackbarActions: bindActionCreators(snackbarActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Id);
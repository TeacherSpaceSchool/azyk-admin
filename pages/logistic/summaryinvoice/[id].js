import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import Router, {useRouter} from 'next/router'
import initialApp from '../../../src/initialApp'
import {checkFloat, dayStartDefault, formatAmount, pdDatePicker, pdDDMMYYYY, unawaited} from '../../../src/lib'
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import Fab from '@material-ui/core/Fab';
import Table from '../../../components/table/summaryInvoice';
import {getEmployment} from '../../../src/gql/employment';
import {getSummaryInvoice} from '../../../src/gql/logistic';
import PrintIcon from '@material-ui/icons/Print';
import * as snackbarActions from '../../../redux/actions/snackbar';
import {printHTML} from '../../../components/print';
import templateSummaryInvoice from '../../../components/print/template/summaryInvoice';
import QuickTransition from '../QuickTransition';

const filters = [
    {name: 'Все', value: null},
    {name: 'Рейс 1', value: 1},
    {name: 'Рейс 2', value: 2},
    {name: 'Рейс 3', value: 3},
    {name: 'Рейс 4', value: 4},
    {name: 'Рейс 5', value: 5},
]

const FinanceReport = React.memo((props) => {
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
        if(filter&&date&&forwarder) {
            showLoad(true)
            const list = await getSummaryInvoice({...listArgs, excel})
            showLoad(false)
            if (!excel) {
                setList(list);
                setPagination(100);
                (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant'});
            } else window.open(list[0][0], '_blank');
        } else {
            setList([])
            showSnackBar(`Укажите:${!filter?' рейс;':''}${!date?' дату доставки;':''}${!forwarder?' экспедитора;':''}`)
        }
    }
    //filter
    useEffect(() => {
        unawaited(getList)
    }, deps)
    //pagination
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [pagination, list])
    //ordersData
    let [ordersData, setOrdersData] = useState({});
    useEffect(() => {
        ordersData = {
            priceAll: 0,
            weightAll: 0,
            countAll: 0,
            packageAll: 0,
        }
        const iterableList = list
        for (let i = 0; i < iterableList.length; i++) {
            ordersData.countAll = checkFloat(ordersData.countAll + checkFloat(iterableList[i][2]))
            ordersData.packageAll = checkFloat(ordersData.packageAll + checkFloat(iterableList[i][3]))
            ordersData.priceAll = checkFloat(ordersData.priceAll + checkFloat(iterableList[i][4]))
            ordersData.weightAll = checkFloat(ordersData.weightAll + checkFloat(iterableList[i][5]))
        }
        setOrdersData({...ordersData})
    }, [list])
    //render
    return <App showForwarder pageName='Сводная накладная' dates checkPagination={checkPagination} filters={filters}>
        <Head>
            <title>Сводная накладная</title>
            <meta name='robots' content='noindex, nofollow'/>
        </Head>
        {list.length?<>
            <div ref={contentRef} style={{display: 'flex', flexDirection: 'row', marginBottom: 50}}>
                <Table pagination={pagination} forwarderData={forwarderData} list={list}/>
            </div>
            <Fab
                color='primary' className={classes.fab}
                onClick={() => printHTML({ data: {list, forwarderData, date, filter, ordersData}, template: templateSummaryInvoice, title: `Сводная накладная ${pdDDMMYYYY(date)}`})}
            >
                <PrintIcon />
            </Fab>
        </>:!filter||!date||!forwarder?`Укажите:${!filter?' рейс;':''}${!date?' дату доставки;':''}${!forwarder?' экспедитора;':''}`:null}
        <QuickTransition fab2={list.length}/>
        <div className='count'>
            Всего: {formatAmount(list.length)}
            <br/>
            Кол-во: {formatAmount(ordersData.countAll)}
            <br/>
            Уп-ок: {formatAmount(ordersData.packageAll)}
            <br/>
            Сумма: {formatAmount(ordersData.priceAll)} сом
            <br/>
            Тоннаж: {formatAmount(ordersData.weightAll)} кг
        </div>
    </App>
})

FinanceReport.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация', 'организация', 'агент', 'менеджер'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    ctx.store.getState().app.organization = ctx.query.id
    if(!ctx.store.getState().app.date) {
        let date = new Date()
        date.setDate(date.getDate() + 1)
        if (date.getHours() < dayStartDefault)
            date.setDate(date.getDate() - 1)
        ctx.store.getState().app.date = pdDatePicker(date)
    }
    if(!ctx.store.getState().app.filter) {
        ctx.store.getState().app.filter = null
    }
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

export default connect(mapStateToProps, mapDispatchToProps)(FinanceReport);

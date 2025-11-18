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
import Table from '../../../components/table/summaryAdss';
import {getEmployment} from '../../../src/gql/employment';
import {getSummaryAdss, setSettedSummaryAds} from '../../../src/gql/logistic';
import PrintIcon from '@material-ui/icons/Print';
import * as snackbarActions from '../../../redux/actions/snackbar';
import {printHTML} from '../../../components/print';
import templateSummaryAdss from '../../../components/print/template/summaryAdss';
import QuickTransition from '../QuickTransition';

const FinanceReport = React.memo((props) => {
    const classes = pageListStyle();
    const router = useRouter()
    //ref
    const contentRef = useRef();
    //props
    const {date, forwarder, agent} = props.app;
    const {showLoad} = props.appActions;
    const {showSnackBar} = props.snackbarActions;
    //forwarderData
    let [forwarderData, setForwarderData] = useState(null);
    useEffect(() => {(async () => {
        if(forwarder) setForwarderData(await getEmployment(forwarder))
        else setForwarderData(null)
    })()}, [forwarder])
    //deps
    const deps = [agent, date, forwarder]
    //listArgs
    const listArgs = {dateDelivery: date, organization: router.query.id, forwarder, agent}
    //list
    let [list, setList] = useState([]);
    const getList = async () => {
        if(date) {
            showLoad(true)
            const list = await getSummaryAdss(listArgs)
            showLoad(false)
            setList(list);
            setPagination(100);
            (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant'});
        } else {
            setList([])
            showSnackBar(`Укажите:${!date?' дату доставки;':''}`)
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
            countAll: 0,
            packageAll: 0,
            weightAll: 0,
        }
        const iterableList = list
        for (let i = 0; i < iterableList.length; i++) {
            ordersData.countAll = checkFloat(ordersData.countAll + checkFloat(iterableList[i][2]))
            ordersData.packageAll = checkFloat(ordersData.packageAll + checkFloat(iterableList[i][3]))
            ordersData.weightAll = checkFloat(ordersData.weightAll + checkFloat(iterableList[i][4]))
        }
        setOrdersData({...ordersData})
    }, [list])
    //render
    return <App showForwarder agents pageName='Акционная накладная' dates checkPagination={checkPagination}>
        <Head>
            <title>Акционная накладная</title>
            <meta name='robots' content='noindex, nofollow'/>
        </Head>
        <div ref={contentRef} style={{display: 'flex', flexDirection: 'row', marginBottom: 60}}>
            <Table pagination={pagination} forwarderData={forwarderData} list={list} setList={setList}/>
        </div>
        {list.length&&!forwarderData?<Fab
            color='primary' className={classes.fab}
            onClick={() => printHTML({ data: {list, forwarderData, date, ordersData}, template: templateSummaryAdss, title: `Акционная накладная ${pdDDMMYYYY(date)}`})}
        >
            <PrintIcon />
        </Fab>:null}
        <QuickTransition fab2={list.length&&!forwarderData}/>
        <div className='count'>
            Всего: {formatAmount(list.length)}
            <br/>
            Кол-во: {formatAmount(ordersData.countAll)}
            <br/>
            Уп-ок: {formatAmount(ordersData.packageAll)}
            <br/>
            Тоннаж: {formatAmount(ordersData.weightAll)} кг
        </div>
    </App>
})

FinanceReport.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация', 'организация', 'менеджер'].includes(ctx.store.getState().user.profile.role))
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
        if (date.getHours() < dayStartDefault)
            date.setDate(date.getDate() - 1)
        ctx.store.getState().app.date = pdDatePicker(date)
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

import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import Router from 'next/router'
import initialApp from '../../../src/initialApp'
import {checkFloat, dayStartDefault, formatAmount, pdDatePicker, unawaited} from '../../../src/lib'
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import Fab from '@material-ui/core/Fab';
import Table from '../../../components/table/summaryInvoice';
import {getEmployment} from '../../../src/gql/employment';
import {getSummaryInvoice} from '../../../src/gql/logistic';
import PrintIcon from '@material-ui/icons/Print';
import * as snackbarActions from '../../../redux/actions/snackbar';

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
    //ref
    const initialRender = useRef(true);
    const contentRef = useRef();
    //props
    const {filter, date, organization, city, forwarder} = props.app;
    const {setOrganization} = props.appActions;
    const {showSnackBar} = props.snackbarActions;
    //organization
    useEffect(() => {
        if(!initialRender.current)
            setOrganization(null)
    }, [city])
    //forwarderData
    let [forwarderData, setForwarderData] = useState(null);
    useEffect(() => {(async () => {
        if(forwarder) setForwarderData(await getEmployment(forwarder))
        else setForwarderData(null)
    })()}, [forwarder])
    //deps
    const deps = [filter, date, organization, city, forwarder]
    //listArgs
    const listArgs = {track: filter, dateDelivery: date, organization, forwarder}
    //list
    let [list, setList] = useState([]);
    const getList = async (excel) => {
        if(filter&&date&&organization&&forwarder) {
            const list = await getSummaryInvoice({...listArgs, excel})
            if (!excel) {
                setList(list);
                setPagination(100);
                (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant'});
            } else window.open(list[0][0], '_blank');
        } else {
            setList([])
            showSnackBar(`Укажите:${!filter?' рейс;':''}${!date?' дату доставки;':''}${!organization?' организацию;':''}${!forwarder?' экспедитора;':''}`)
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
        }
        const iterableList = list
        for (let i = 0; i < iterableList.length; i++) {
            ordersData.priceAll = checkFloat(ordersData.priceAll + checkFloat(iterableList[i][4]))
            ordersData.weightAll = checkFloat(ordersData.weightAll + checkFloat(iterableList[i][5]))
        }
        setOrdersData({...ordersData})
    }, [list])
    //render
    return <App cityShow organizations showForwarder pageName='Сводная накладная' dates checkPagination={checkPagination} filters={filters}>
        <Head>
            <title>Сводная накладная</title>
            <meta name='robots' content='noindex, nofollow'/>
        </Head>
        {list.length?<>
            <div ref={contentRef} style={{display: 'flex', flexDirection: 'row', marginBottom: 30}}>
                <Table pagination={pagination} forwarderData={forwarderData} list={list}/>
            </div>
            <Fab onClick={() => getList(true)} color='primary' className={classes.fab}>
                <PrintIcon />
            </Fab>
        </>:null}
        <div className='count'>
            Всего: {formatAmount(list.length)}
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
    let date = new Date()
    if(date.getHours()<dayStartDefault)
        date.setDate(date.getDate() - 1)
    ctx.store.getState().app.date = pdDatePicker(date)
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

export default connect(mapStateToProps, mapDispatchToProps)(FinanceReport);
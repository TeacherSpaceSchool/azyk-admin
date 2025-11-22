import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import Router, {useRouter} from 'next/router'
import initialApp from '../../../src/initialApp'
import {
    checkFloat,
    dayStartDefault,
    formatAmount,
    getClientTitle,
    pdDatePicker,
    pdDDMMYYYY,
    unawaited
} from '../../../src/lib'
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
import templateInvoices from '../../../components/print/template/invoices';
import QuickTransition from '../QuickTransition';
import {getOrganization} from '../../../src/gql/organization';
import {getClientGqlSsr} from '../../../src/getClientGQL';
import {getDistricts} from '../../../src/gql/district';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

const filters = [
    {name: 'Все', value: null},
    {name: 'Рейс 1', value: 1},
    {name: 'Рейс 2', value: 2},
    {name: 'Рейс 3', value: 3},
    {name: 'Рейс 4', value: 4},
    {name: 'Рейс 5', value: 5},
]

const paymentPrice = (invoice) => {
    return ['Наличные'].includes(invoice.paymentMethod)?checkFloat(invoice.allPrice - invoice.returnedPrice - checkFloat(invoice.returned)):0
}

export const toTableRow = (invoice) => {
    return [
        getClientTitle({address: [invoice.address]}), formatAmount(invoice.allPrice),formatAmount(paymentPrice(invoice)),
        invoice.paymentMethod, formatAmount(invoice.returned), formatAmount(invoice.consig), invoice.inv===0?'нет':'да', invoice.info
    ]
}

const Id = React.memo((props) => {
    const classes = pageListStyle();
    const router = useRouter()
    //ref
    const contentRef = useRef();
    //props
    const {filter, date, forwarder} = props.app;
    const {organizationData, agentByClient} = props.data;
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
    let [returneds, setReturneds] = useState([]);
    const getList = async () => {
        list = []
        returneds = []
        if(date&&forwarder) {
            showLoad(true)
            const financeReport = await getFinanceReport(listArgs)
            list = financeReport.invoices
            returneds = financeReport.returneds
            showLoad(false)
            setPagination(100);
            (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant'});
        }
        else showSnackBar(`Укажите:${!date?' дату доставки;':''}${!forwarder?' экспедитора;':''}`)
        setList(list);
        setReturneds(returneds)
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
            consigPrice: 0,
        }
        for (let i = 0; i < list.length; i++) {
            const allPrice = checkFloat(list[i].allPrice)
            ordersData.allPrice = checkFloat(ordersData.allPrice + allPrice)
            ordersData.paymentPrice = checkFloat(ordersData.paymentPrice + paymentPrice(list[i]))
            ordersData.returnedPrice = checkFloat(ordersData.returnedPrice + checkFloat(list[i].returned))
            if(list[i].consig) ordersData.consigPrice = checkFloat(ordersData.consigPrice + checkFloat(list[i].consig))
        }
        setOrdersData({...ordersData})
    }, [list])
    //pagination
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [pagination, list])
    //print
    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    //render
    return <App showForwarder pageName='Отчет по деньгам' dates checkPagination={checkPagination} filters={filters}>
        <Head>
            <title>Отчет по деньгам</title>
            <meta name='robots' content='noindex, nofollow'/>
        </Head>
        <div ref={contentRef} style={{display: 'flex', flexDirection: 'row', marginBottom: 45}}>
            <Table pagination={pagination} forwarderData={forwarderData} list={list}/>
        </div>
        {list.length?<>
            <Fab
                color='primary' className={classes.fab}
                onClick={handleClick}
            >
                <PrintIcon />
            </Fab>
            <Menu
                id='simple-menu'
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={() => {
                    printHTML({ data: {list, forwarderData, date, filter, ordersData}, template: templateFinanceReport, title: `Отчет по деньгам ${pdDDMMYYYY(date)}`})
                }}>Отчет по деньгам</MenuItem>
                <MenuItem onClick={() => {
                    printHTML({ data: {invoices: list, returneds, forwarderData, organizationData, date, agentByClient}, template: templateInvoices, title: `Накладные ${pdDDMMYYYY(date)}`})
                }}>Накладные</MenuItem>
            </Menu>
        </>:null}
        <QuickTransition fab2={list.length}/>
        <div className='count'>
            Всего: {formatAmount(list.length)}
            <br/>
            Отгружено: {formatAmount(ordersData.allPrice)} сом
            <br/>
            К оплате: {formatAmount(ordersData.paymentPrice)} сом
            <br/>
            Возврат: {formatAmount(ordersData.returnedPrice)} сом
            <br/>
            Долг: {formatAmount(ordersData.consigPrice)} сом
        </div>
    </App>
})

Id.getInitialProps = async function(ctx) {
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
    if(!ctx.store.getState().app.filter)
        ctx.store.getState().app.filter = null
    // eslint-disable-next-line no-undef
    const [districts, organizationData] = await Promise.all([
        getDistricts({search: '', sort: '-name', organization: ctx.query.id}, getClientGqlSsr(ctx.req)),
        getOrganization(ctx.query.id, getClientGqlSsr(ctx.req))
    ]);
    const agentByClient = {}
    for(const district of districts)
        for(const client of district.client)
            agentByClient[client._id] = district.agent?district.agent:null
    return {data: {organizationData, agentByClient}};
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
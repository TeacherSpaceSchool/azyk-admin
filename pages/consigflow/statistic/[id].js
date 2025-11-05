import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import {getConsigFlowStatistic} from '../../../src/gql/consigFlow'
import { useRouter } from 'next/router'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import initialApp from '../../../src/initialApp'
import Router from 'next/router'
import * as appActions from '../../../redux/actions/app'
import {bindActionCreators} from 'redux';
import {checkFloat, dayStartDefault, formatAmount, pdDatePicker, unawaited} from '../../../src/lib';
import Table from '../../../components/table/consigflow/statistic';
import {getDistricts} from '../../../src/gql/district';

const ConsigFlow = React.memo((props) => {
    const router = useRouter()
    //props
    const {data} = props;
    const {district, date, search} = props.app;
    //ref
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    //districtData
    let [districtData, setDistrictData] = useState(null);
    useEffect(() => {
        setDistrictData(data.districtById[district])
    }, [district])
    //deps
    const deps = [district, date]
    //listArgs
    const listArgs = {district, organization: router.query.id, date, search}
    //list
    let [list, setList] = useState(data.list);
    const getList = async () => {
        setList(await getConsigFlowStatistic(listArgs))
        setPagination(100);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    //listData
    let [listData, setListData] = useState({});
    useEffect(() => {
        listData = [0, 0, 0, 0]
        for (const element of list) {
            listData = [
                listData[0] + checkFloat(element[2]),
                listData[1] + checkFloat(element[3]),
                listData[2] + checkFloat(element[4]),
                listData[3] + checkFloat(element[5])
            ]
        }
        setListData([checkFloat(listData[0]), checkFloat(listData[1]), checkFloat(listData[2]), checkFloat(listData[3])])
    }, [list])
    //filter
    useEffect(() => {
        if(!initialRender.current) unawaited(getList)
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
    //pagination
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [pagination, list])
    //render
    return (
        <App checkPagination={checkPagination} showDistrict searchShow dates pageName='Статистика(конс)'>
            <Head>
                <title>Статистика(конс)</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div style={{display: 'flex', flexDirection: 'row', marginBottom: 60}}>
                <Table list={list} pagination={pagination} districtData={districtData}/>
            </div>
            <div className='count'>
                Всего: {formatAmount(list.length)}
                <br/>
                Начало: {formatAmount(listData[0])} сом
                <br/>
                Взято: {formatAmount(listData[1])} сом
                <br/>
                Закрыто: {formatAmount(listData[2])} сом
                <br/>
                Конец: {formatAmount(listData[3])} сом
            </div>
        </App>
    )
})

ConsigFlow.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    const date = new Date()
    if (date.getHours() < dayStartDefault)
        date.setDate(date.getDate() - 1)
    ctx.store.getState().app.date = pdDatePicker(date)
    ctx.store.getState().app.organization = ctx.query.id
    // eslint-disable-next-line no-undef
    const [list, districts] = await Promise.all([
        getConsigFlowStatistic({date, organization: ctx.query.id}, getClientGqlSsr(ctx.req)),
        getDistricts({organization: ctx.query.id, search: '', sort: '-name'}, getClientGqlSsr(ctx.req))
    ])
    const districtById = {}
    for(const district of districts) {
        districtById[district._id] = district
    }
    return {
        data: {list, districtById}
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
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConsigFlow);
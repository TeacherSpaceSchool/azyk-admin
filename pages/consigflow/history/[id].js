import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import {getConsigFlows} from '../../../src/gql/consigFlow'
import pageListStyle from '../../../src/styleMUI/organization/orgaizationsList'
import CardConsigFlow from '../../../components/card/CardConsigFlow'
import { useRouter } from 'next/router'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import initialApp from '../../../src/initialApp'
import Router from 'next/router'
import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import {bindActionCreators} from 'redux';
import {unawaited} from '../../../src/lib';
import {viewModes} from '../../../src/enum';
import Table from '../../../components/table/consigflow/history';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import AddConsigFlow from '../../../components/dialog/AddConsigFlow';
import {getDistricts} from '../../../src/gql/district';

const ConsigFlow = React.memo((props) => {
    const classes = pageListStyle();
    const router = useRouter()
    //props
    const {data} = props;
    const {district, viewMode} = props.app;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {profile} = props.user;
    //ref
    const initialRender = useRef(true);
    const paginationWork = useRef(true);
    //districtData
    let [districtData, setDistrictData] = useState(null);
    useEffect(() => {
        setDistrictData(data.districtById[district])
    }, [district])
    //deps
    const deps = [district]
    //listArgs
    const listArgs = {district, organization: router.query.id, ...router.query.invoice?{invoice: router.query.invoice}:{}, ...router.query.client?{client: router.query.client}:{}}
    //list
    let [list, setList] = useState(data.list);
    const getList = async (skip) => {
        const gettedData = await getConsigFlows({...listArgs, skip: skip||0})
        if(!skip) {
            setList(gettedData)
            paginationWork.current = true;
            (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        }
        else if(gettedData.length) {
            setList(list => [...list, ...gettedData])
            paginationWork.current = true
        }
    }
    //filter
    useEffect(() => {
        if(initialRender.current) initialRender.current = false
        else unawaited(getList)
    }, deps)
    //pagination
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            await getList(list.length)
        }
    }, [list, ...deps])
    //render
    return (
        <App checkPagination={checkPagination} showDistrict pageName='История(конс)'>
            <Head>
                <title>История(конс)</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            {list?viewMode===viewModes.card?
                    <div className={classes.page}>
                        {list.map(element => <CardConsigFlow key={element._id} element={element}/>)}
                    </div>
                    :
                    <div style={{display: 'flex', flexDirection: 'row', marginBottom: 60}}>
                        <Table list={list} districtData={districtData}/>
                    </div>
                :null}
            {['суперорганизация', 'организация', 'менеджер', 'агент'].includes(profile.role)?<Fab color='primary' className={classes.fab} onClick={() => {
                setMiniDialog('Добавить', <AddConsigFlow initialClient={router.query.client}/>)
                showMiniDialog(true)
            }}>
                <AddIcon/>
            </Fab>:null}
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
    ctx.store.getState().app.organization = ctx.query.id
    // eslint-disable-next-line no-undef
    const [list, districts] = await Promise.all([
        getConsigFlows({district: ctx.store.getState().app.district, skip: 0, organization: ctx.query.id, ...ctx.query.invoice?{invoice: ctx.query.invoice}:{}, ...ctx.query.client?{client: ctx.query.client}:{}}, getClientGqlSsr(ctx.req)),
        getDistricts({organization: ctx.query.id, search: '', sort: '-name'}, getClientGqlSsr(ctx.req))
    ])
    const districtById = {}
    for(const district of districts) {
        districtById[district._id] = district
    }
    return {data: {list, districtById}};
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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConsigFlow);
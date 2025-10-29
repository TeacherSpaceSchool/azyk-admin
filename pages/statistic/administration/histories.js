import Head from 'next/head';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import App from '../../../layouts/App';
import CardHistory from '../../../components/card/CardHistory';
import pageListStyle from '../../../src/styleMUI/error/errorList'
import {getHistories} from '../../../src/gql/history'
import { connect } from 'react-redux'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import initialApp from '../../../src/initialApp'
import Router from 'next/router'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import {formatAmount, unawaited} from '../../../src/lib';
import {viewModes} from '../../../src/enum';
import Table from '../../../components/table/histories';

const filters = [
    {name: 'Все', value: ''},
    {name: 'ClientAzyk', value: 'ClientAzyk'},
    {name: 'ClientNetworkAzyk', value: 'ClientNetworkAzyk'},
    {name: 'DistrictAzyk', value: 'DistrictAzyk'},
    {name: 'EmploymentAzyk', value: 'EmploymentAzyk'},
    {name: 'ItemAzyk', value: 'ItemAzyk'},
    {name: 'OrganizationAzyk', value: 'OrganizationAzyk'},
    {name: 'SubBrandAzyk', value: 'SubBrandAzyk'},
]

const History = React.memo((props) => {
    const classes = pageListStyle();
    //props
    const {data} = props;
    const {search, filter, viewMode} = props.app;
    //ref
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    const paginationWork = useRef(true);
    //deps
    const deps = [filter]
    //listArgs
    const listArgs = {filter}
    //list
    let [list, setList] = useState(data.histories);
    const getList = async (skip) => {
        const gettedData = await getHistories({...listArgs, search, skip: skip||0});
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
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            await getList(list.length)
        }
    }, [search, list, ...deps])
    //render
    return (
        <App searchShow filters={filters} checkPagination={checkPagination} pageName='История'>
            <Head>
                <title>История</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                {list?viewMode===viewModes.card?
                        list.map(element => <CardHistory key={element._id} element={element}/>)
                        :
                        <Table list={list}/>
                    :null}
                <div className='count'>
                    Всего: {formatAmount(list.length)}
                </div>
            </div>
        </App>
    )
})

History.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(ctx.store.getState().user.profile.role!=='admin')
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            histories: await getHistories({skip: 0}, getClientGqlSsr(ctx.req))
        },
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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(History);
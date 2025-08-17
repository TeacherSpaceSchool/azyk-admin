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

const filters = [{name: 'Все', value: ''}, {name: 'SubBrandAzyk', value: 'SubBrandAzyk'}, {name: 'ClientAzyk', value: 'ClientAzyk'}, {name: 'DistrictAzyk', value: 'DistrictAzyk'}, {name: 'EmploymentAzyk', value: 'EmploymentAzyk'}, {name: 'ItemAzyk', value: 'ItemAzyk'}, {name: 'OrganizationAzyk', value: 'OrganizationAzyk'},]

const History = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    const {search, filter} = props.app;
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    let [list, setList] = useState(data.histories);
    const getList = async () => {
        setList(await getHistories({search, filter, skip: 0}))
        paginationWork.current = true;
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(() => {
        if(!initialRender.current) unawaited(getList)
    }, [filter])
    useEffect(() => {
        if(initialRender.current) {
            initialRender.current = false;
        } else {
            if(searchTimeOut.current)
                clearTimeout(searchTimeOut.current)
            searchTimeOut.current = setTimeout(() => unawaited(getList), 500)
        }
    }, [search])
    const paginationWork = useRef(true);
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            let addedList = await getHistories({search, filter, skip: list.length})
            if(addedList.length) {
                setList([...list, ...addedList])
                paginationWork.current = true
            }
        }
    }, [search, filter, list])
    return (
        <App searchShow filters={filters} checkPagination={checkPagination} pageName='История'>
            <Head>
                <title>История</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                <div className='count'>
                    Всего: {formatAmount(list.length)}
                </div>
                {list.map((element)=>
                    <CardHistory key={element._id} element={element}/>
                )}
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
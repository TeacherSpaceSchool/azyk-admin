import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../../../layouts/App';
import { connect } from 'react-redux'
import { getClientsSync, getClientsSyncStatistic, clearClientsSync } from '../../../../src/gql/client'
import { getOrganization } from '../../../../src/gql/organization'
import pageListStyle from '../../../../src/styleMUI/client/clientList'
import CardClient from '../../../../components/card/CardClient'
import { useRouter } from 'next/router'
import { getClientGqlSsr } from '../../../../src/getClientGQL'
import initialApp from '../../../../src/initialApp'
import Router from 'next/router'
import Fab from '@material-ui/core/Fab';
import RemoveIcon from '@material-ui/icons/Clear';
import Confirmation from '../../../../components/dialog/Confirmation'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../../../redux/actions/mini_dialog'
import {formatAmount, unawaited} from '../../../../src/lib';
import {viewModes} from '../../../../src/enum';
import Table from '../../../../components/table/clients';

const ClientsSync = React.memo((props) => {
    const classes = pageListStyle();
    const router = useRouter()
    //props
    const {data} = props;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {search, city, viewMode} = props.app;
    //ref
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    const paginationWork = useRef(true);
    //deps
    const deps = [city]
    //listArgs
    const listArgs = {organization: router.query.id, city}
    //count
    let [count, setCount] = useState('');
    const getCount = async () => setCount(await getClientsSyncStatistic({search, ...listArgs}))
    //list
    let [list, setList] = useState(data.clientsSync);
    const getList = async (skip) => {
        const gettedData = await getClientsSync({...listArgs, search, skip: skip||0});
        if(!skip) {
            unawaited(getCount)
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
        if(initialRender.current) {
            initialRender.current = false;
            unawaited(getCount)
        }
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
        <App cityShow checkPagination={checkPagination} searchShow pageName={data.organization.name}>
            <Head>
                <title>{data.organization.name}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                {list?viewMode===viewModes.card?
                        list.map(element => <CardClient element={element} key={element._id}/>)
                        :
                        <Table list={list}/>
                    :null}
                <div className='count'>
                    Интеграций: {formatAmount(count)}
                </div>
            </div>
            <Fab onClick={() => {
                const action = async () => {
                    await clearClientsSync(router.query.id)
                    setList([])
                }
                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                showMiniDialog(true)
            }} color='primary' className={classes.fab}>
                <RemoveIcon />
            </Fab>
        </App>
    )
})

ClientsSync.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    // eslint-disable-next-line no-undef
    const [clientsSync, clientsSyncStatistic, organization] = await Promise.all([
        getClientsSync({search: '', organization: ctx.query.id, skip: 0}, getClientGqlSsr(ctx.req)),
        getClientsSyncStatistic({search: '', organization: ctx.query.id}, getClientGqlSsr(ctx.req)),
        getOrganization(ctx.query.id, getClientGqlSsr(ctx.req))
    ])
    return {
        data: {
            clientsSync,
            clientsSyncStatistic,
            organization,
        }
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

export default connect(mapStateToProps, mapDispatchToProps)(ClientsSync);
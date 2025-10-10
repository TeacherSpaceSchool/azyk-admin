import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../layouts/App';
import CardAgentRoute from '../../components/card/CardAgentRoute'
import pageListStyle from '../../src/styleMUI/agentRoute/agentRouteList'
import {getAgentRoutes} from '../../src/gql/agentRoute'
import { connect } from 'react-redux'
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Link from 'next/link';
import Router from 'next/router'
import { getClientGqlSsr } from '../../src/getClientGQL'
import { useRouter } from 'next/router'
import initialApp from '../../src/initialApp'
import {formatAmount, unawaited} from '../../src/lib';
import {viewModes} from '../../src/enum';
import Table from '../../components/table/agentroutes';

const AgentRoutes = React.memo((props) => {
    const classes = pageListStyle();
    const router = useRouter()
    //props
    const {profile} = props.user;
    const {data} = props;
    const {search, viewMode} = props.app;
    //ref
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    //listArgs
    const listArgs = {organization: router.query.id, search}
    //list
    let [list, setList] = useState(data.agentRoutes);
    const getList = async () => {
        setList(await getAgentRoutes(listArgs))
        setPagination(100);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
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
        <App checkPagination={checkPagination} searchShow pageName='Маршруты агентов'>
            <Head>
                <title>Маршруты агентов</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                Всего: {formatAmount(list.length)}
            </div>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                {list?viewMode===viewModes.card?
                        list.map((element, idx) => {
                            if(idx<pagination)
                                return <CardAgentRoute idx={idx} list={list} setList={setList} key={element._id} element={element}/>
                        })
                        :
                        <Table list={list} pagination={pagination}/>
                    :null}
            </div>
            {['admin', 'суперорганизация', 'организация', 'менеджер'].includes(profile.role)?
                <Link href='/agentroute/[id]' as={`/agentroute/new`}>
                    <Fab color='primary' className={classes.fab}>
                        <AddIcon />
                    </Fab>
                </Link>
                :
                null
            }
        </App>
    )
})

AgentRoutes.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация', 'организация', 'менеджер'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            agentRoutes: await getAgentRoutes({organization: ctx.query.id, search: ''}, getClientGqlSsr(ctx.req))
        }
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user
    }
}

export default connect(mapStateToProps)(AgentRoutes);
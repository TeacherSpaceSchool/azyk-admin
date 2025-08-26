import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import { getFhoClients } from '../../src/gql/fhoClient'
import pageListStyle from '../../src/styleMUI/merchandising/merchandisingList'
import CardFhoClient from '../../components/card/CardFhoClient'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import Router from 'next/router'
import Link from 'next/link';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { useRouter } from 'next/router'
import {unawaited} from '../../src/lib';
import {viewModes} from '../../src/enum';
import Table from '../../components/table/fhoclients';

const filters = [{name: 'Все', value: ''},{name: 'Пустой', value: 'пустой'}]

const FhoClients = React.memo((props) => {
    const router = useRouter()
    const classes = pageListStyle();
    const {profile} = props.user;
    const {data} = props;
    let [list, setList] = useState(data.fhoClients);
    const {search, filter, sort, date, viewMode} = props.app;
    const initialRender = useRef(true);
    const searchTimeOut = useRef(null);
    const paginationWork = useRef(true);
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            let addedList = await getFhoClients({...router.query.client?{client: router.query.client}:{}, date, organization: router.query.id, sort, filter, search, skip: list.length})
            if(addedList.length) {
                setList([...list, ...addedList])
                paginationWork.current = true
            }
        }
    }, [date, sort, filter, search, list])
    const getList = async () => {
        setList(await getFhoClients({...router.query.client?{client: router.query.client}:{}, date, organization: router.query.id, sort, filter, search, skip: 0}))
        paginationWork.current = true;
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(() => {
        if(!initialRender.current)
            unawaited(getList)
    }, [filter, sort, date])
    useEffect(() => {
        if(initialRender.current)
            initialRender.current = false;
        else {
            if(searchTimeOut.current)
                clearTimeout(searchTimeOut.current)
            searchTimeOut.current = setTimeout(() => {
                unawaited(getList)
            }, 500)
        }
    }, [search])
    return (
        <App filters={filters} checkPagination={checkPagination} list={list} setList={setList} searchShow pageName='ФХО клиентов'>
            <Head>
                <title>ФХО клиентов</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                {list?viewMode===viewModes.card?
                        list.map((element) => <CardFhoClient key={element._id} element={element}/>)
                        :
                        <Table list={list}/>
                    :null}
                {['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'мерчендайзер'].includes(profile.role)?
                    <Link href='/fhoclient/[id]' as={`/fhoclient/new`}>
                        <Fab color='primary' className={classes.fab}>
                            <AddIcon/>
                        </Fab>
                    </Link>
                    :
                    null
                }
            </div>
        </App>
    )
})

FhoClients.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    ctx.store.getState().app.organization = ctx.query.id
    if(!['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'мерчендайзер'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            fhoClients: await getFhoClients({
                ...ctx.query.client?{client: ctx.query.client}:{}, organization: ctx.query.id, sort: ctx.store.getState().app.sort,
                filter: ctx.store.getState().app.filter, skip: 0, search: ''
            }, getClientGqlSsr(ctx.req))
        }
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(FhoClients);
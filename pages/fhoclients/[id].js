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
    //ref
    const initialRender = useRef(true);
    const paginationWork = useRef(true);
    const searchTimeOut = useRef(null);
    //props
    const {profile} = props.user;
    const {data} = props;
    const {search, filter, sort, date, viewMode, district} = props.app;
    //deps
    const deps = [date, sort, filter, district]
    //list
    let [list, setList] = useState(data.fhoClients);
    const getList = async (skip) => {
        const clients = await getFhoClients({...router.query.client?{client: router.query.client}:{}, district, date, organization: router.query.id, sort, filter, search, skip: skip||0})
        if(!skip) {
            setList(clients)
            paginationWork.current = true;
            (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        }
        else if(list.length) {
            setList(list => [...list, ...clients])
            paginationWork.current = true
        }
    }
    //pagination
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            await getList(list.length)
        }
    }, [list, search, ...deps])
    //filter
    useEffect(() => {
        if(!initialRender.current)
            unawaited(getList)
    }, deps)
    //search
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
    //render
    return (
        <App filters={filters} showDistrict checkPagination={checkPagination} list={list} setList={setList} searchShow pageName='ФХО клиентов'>
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
                ...ctx.query.client?{client: ctx.query.client}:{},
                organization: ctx.query.id, sort: ctx.store.getState().app.sort,
                filter: ctx.store.getState().app.filter, skip: 0,
                date: ctx.store.getState().app.date,
                district: ctx.store.getState().app.district,
                search: ctx.store.getState().app.search
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
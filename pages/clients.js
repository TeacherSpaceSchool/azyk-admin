import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../layouts/App';
import pageListStyle from '../src/styleMUI/client/clientList'
import {getClients, getClientsSimpleStatistic} from '../src/gql/client'
import CardClient from '../components/card/CardClient'
import { connect } from 'react-redux'
import Router from 'next/router'
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import Link from 'next/link';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import {formatAmount, unawaited} from '../src/lib';
import {viewModes} from '../src/enum';
import Table from '../components/table/clients';

const sorts = [{name: 'Имя', field: 'name'}, {name: 'Регистрация', field: 'createdAt'}, {name: 'Активность', field: 'lastActive'}]
const filters = [{name: 'Все', value: ''}, {name: 'Без геолокации', value: 'Без геолокации'}, {name: 'Включенные', value: 'Включенные'}, {name: 'Выключенные', value: 'Выключенные'}, {name: 'Horeca', value: 'Horeca'}, {name: 'A', value: 'A'}, {name: 'B', value: 'B'}, {name: 'C', value: 'C'}, {name: 'D', value: 'D'}]

const Client = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    let [list, setList] = useState(data.clients);
    let [simpleStatistic, setSimpleStatistic] = useState('');
    const getSimpleStatistic = async () => setSimpleStatistic(await getClientsSimpleStatistic({search, filter, date, city}))
    const paginationWork = useRef(true);
    const getList = async () => {
        unawaited(getSimpleStatistic)
        const clients = await getClients({search, sort, filter, date, skip: 0, city})
        setList(clients);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant'});
        paginationWork.current = true;
    }
    const {search, filter, sort, date, city, viewMode} = props.app;
    const {profile} = props.user;
    const initialRender = useRef(true);
    const searchTimeOut = useRef(null);
    useEffect(() => {
        if(!initialRender.current) unawaited(getList)
    }, [filter, sort, date, city])
    useEffect(() => {
            if(initialRender.current) {
                initialRender.current = false;
                unawaited(getSimpleStatistic)
            }
            else {
                if(searchTimeOut.current)
                    clearTimeout(searchTimeOut.current)
                searchTimeOut.current = setTimeout(() => unawaited(getList), 500)
            }
    }, [search])
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            let addedList = await getClients({search, sort, filter, date, skip: list.length, city})
            if(addedList.length) {
                setList([...list, ...addedList])
                paginationWork.current = true
            }
        }
    }, [search, sort, filter, date, list, city])
    return (
        <App cityShow checkPagination={checkPagination} searchShow dates filters={filters} sorts={sorts} pageName='Клиенты'>
            <Head>
                <title>Клиенты</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                Всего: {formatAmount(simpleStatistic)}
            </div>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                {list?viewMode===viewModes.card?
                    list.map((element, idx) => <CardClient buy idx={idx} key={element._id} list={list} setList={setList} element={element}/>)
                        :
                    <Table list={list} buy/>
                :null}
            </div>
            {profile.role==='admin'||(profile.addedClient&&['суперорганизация', 'организация', 'агент'].includes(profile.role))?
                <Link href='/client/[id]' as={`/client/new`}>
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

Client.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    let role = ctx.store.getState().user.profile.role
    let authenticated = ctx.store.getState().user.authenticated
    if(authenticated&&!['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент', 'экспедитор'].includes(role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            clients: await getClients({search: '', sort: '-createdAt', filter: '', skip: 0, city: ctx.store.getState().app.city}, getClientGqlSsr(ctx.req)),
        }
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Client);
import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../layouts/App';
import CardRoute from '../../components/card/CardRoute'
import pageListStyle from '../../src/styleMUI/route/routeList'
import {getRoutes} from '../../src/gql/route'
import { connect } from 'react-redux'
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Link from 'next/link';
import Router from 'next/router'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import { useRouter } from 'next/router'
import {formatAmount, unawaited} from '../../src/lib';

const filters = [{name: 'Все', value: ''}, {name: 'Cоздан', value: 'создан'}, {name: 'Выполняется', value: 'выполняется'}, {name: 'Выполнен', value: 'выполнен'}]

const Routes = React.memo((props) => {
    const {profile} = props.user;
    const classes = pageListStyle();
    const initialRender = useRef(true);
    const router = useRouter()
    const {data} = props;
    let [list, setList] = useState(data.routes);
    const paginationWork = useRef(true);
    const {search, filter, sort, date} = props.app;
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            let addedList = await getRoutes({organization: router.query.id, search, sort, filter, date, skip: list.length})
            if(addedList.length) {
                setList([...list, ...addedList])
                paginationWork.current = true
            }
        }
    }, [search, sort, filter, date, list])
    const getList = async () => {
        setList(await getRoutes({organization: router.query.id, search, sort, filter, date, skip: 0}))
        paginationWork.current = true;
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    const searchTimeOut = useRef(null);
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
            searchTimeOut.current = setTimeout(() => unawaited(getList), 500)
        }
    }, [search])
    return (
        <App checkPagination={checkPagination} getList={getList} searchShow dates filters={filters} pageName='Маршруты экспедитора'>
            <Head>
                <title>Маршруты экспедитора</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                Всего: {formatAmount(list.length)}
            </div>
            <div className={classes.page}>
                {list?list.map((element, idx) => {
                    return(
                        <CardRoute idx={idx} list={list} setList={setList} key={element._id} element={element}/>
                    )}
                ):null}
            </div>
            {['admin', 'организация', 'суперорганизация', 'агент', 'менеджер'].includes(profile.role)?
                <Link href='/route/[id]' as={`/route/new`}>
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

Routes.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'организация', 'суперорганизация', 'менеджер', 'агент', 'экспедитор', 'суперэкспедитор'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            routes: await getRoutes({
                organization: ctx.query.id,
                skip: 0,
                search: ctx.store.getState().app.search,
                sort: ctx.store.getState().app.sort,
                filter: ctx.store.getState().app.filter,
                date: ctx.store.getState().app.date
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

export default connect(mapStateToProps)(Routes);
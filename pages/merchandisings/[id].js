import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import { getMerchandisings } from '../../src/gql/merchandising'
import pageListStyle from '../../src/styleMUI/merchandising/merchandisingList'
import CardMerchandising from '../../components/card/CardMerchandising'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import Router from 'next/router'
import Link from 'next/link';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { useRouter } from 'next/router'
import {unawaited} from '../../src/lib';
import {viewModes} from '../../src/enum';
import Table from '../../components/table/merchandisings';

const sorts = [{name: 'Дата', field: 'date'}, {name: 'Оценка', field: 'stateProduct'}, {name: 'Статус', field: 'check'}]
const filters = [{name: 'Все', value: ''},{name: 'Обработка', value: 'обработка'},{name: 'Холодные полки', value: 'холодные полки'},{name: 'Теплые полки', value: 'теплые полки'}]

const Merchandisings = React.memo((props) => {
    const router = useRouter()
    const classes = pageListStyle();
    const {profile} = props.user;
    const {data} = props;
    let [list, setList] = useState(data.merchandisings);
    const {search, filter, sort, date, agent, viewMode} = props.app;
    const initialRender = useRef(true);
    const searchTimeOut = useRef(null);
    const paginationWork = useRef(true);
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            let addedList = await getMerchandisings({...router.query.client?{client: router.query.client}:{}, agent, date, organization: router.query.id, sort, filter, search, skip: list.length})
            if(addedList.length) {
                setList([...list, ...addedList])
                paginationWork.current = true
            }
        }
    }, [agent, date, sort, filter, search, list])
    const getList = async () => {
        setList(await getMerchandisings({...router.query.client?{client: router.query.client}:{}, agent, date, organization: router.query.id, sort, filter, search, skip: 0}))
        paginationWork.current = true;
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(() => {
        if(!initialRender.current)
            unawaited(getList)
    }, [filter, sort, date, agent])
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
        <App dates filters={filters} agents sorts={sorts} checkPagination={checkPagination} list={list} setList={setList} searchShow pageName='Мерчендайзинг'>
            <Head>
                <title>Мерчендайзинг</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                {list?viewMode===viewModes.card?
                        list.map((element) => <CardMerchandising key={element._id} templateMerchandising={router.query.id} element={element}/>)
                        :
                        <Table list={list}/>
                    :null}
                {['admin', 'суперагент', 'суперорганизация', 'организация', 'менеджер', 'агент', 'мерчендайзер'].includes(profile.role)?
                    <Link href='/merchandising/[id]' as={`/merchandising/new`}>
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

Merchandisings.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    ctx.store.getState().app.sort = '-date'
    ctx.store.getState().app.organization = ctx.query.id
    if(!['admin', 'суперагент', 'суперорганизация', 'организация', 'менеджер', 'агент', 'мерчендайзер'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            merchandisings: await getMerchandisings({...ctx.query.client?{client: ctx.query.client}:{}, organization: ctx.query.id, sort: ctx.store.getState().app.sort, agent: ctx.store.getState().app.agent, filter: ctx.store.getState().app.filter, skip: 0, search: ''}, getClientGqlSsr(ctx.req))
        }
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Merchandisings);
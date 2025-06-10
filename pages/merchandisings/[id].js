import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import { getMerchandisings } from '../../src/gql/merchandising'
import pageListStyle from '../../src/styleMUI/merchandising/merchandisingList'
import CardMerchandising from '../../components/merchandising/CardMerchandising'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import Router from 'next/router'
import Link from 'next/link';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { useRouter } from 'next/router'

const Merchandisings = React.memo((props) => {
    const router = useRouter()
    const classes = pageListStyle();
    const { profile } = props.user;
    const { data } = props;
    let [list, setList] = useState(data.merchandisings);
    const { search, filter, sort, date, agent } = props.app;
    const initialRender = useRef(true);
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    let [paginationWork, setPaginationWork] = useState(true);
    const checkPagination = async()=>{
        if(paginationWork){
            let addedList = (await getMerchandisings({...router.query.client?{client: router.query.client}:{}, agent, date: date, organization: router.query.id, sort, filter: filter, search, skip: list.length})).merchandisings
            if(addedList.length>0){
                setList([...list, ...addedList])
            }
            else
                setPaginationWork(false)
        }
    }
    const getList = async()=>{
        setList((await getMerchandisings({...router.query.client?{client: router.query.client}:{}, agent, date: date, organization: router.query.id, sort, filter: filter, search, skip: 0})).merchandisings)
        setPaginationWork(true);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(()=>{
        (async () => {
            if(!initialRender.current) {
                await getList()
            }
        })()
    },[filter, sort, date, agent])
    useEffect(()=>{
        if(initialRender.current) {
            initialRender.current = false;
        } else {
            if (searchTimeOut)
                clearTimeout(searchTimeOut)
            searchTimeOut = setTimeout(async () => {
                await getList()
            }, 500)
            setSearchTimeOut(searchTimeOut)
        }
    },[search])
    return (
        <App dates filters={data.filterMerchandising} agents={true} sorts={data.sortMerchandising} checkPagination={checkPagination} setList={setList} list={list} searchShow={true} pageName='Мерчендайзинг'>
            <Head>
                <title>Мерчендайзинг</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                {
                    list?list.map((element)=> {
                            return(
                                <CardMerchandising templateMerchandising={router.query.id} element={element} />
                            )}
                    ):null
                }
                {['admin', 'суперагент', 'суперорганизация', 'организация', 'менеджер', 'агент', 'мерчендайзер'].includes(profile.role)?
                    <Link href='/merchandising/[id]' as={`/merchandising/new`}>
                        <Fab color='primary' aria-label='add' className={classes.fab}>
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
            ...await getMerchandisings({...ctx.query.client?{client: ctx.query.client}:{}, organization: ctx.query.id, sort: ctx.store.getState().app.sort, agent: ctx.store.getState().app.agent, filter: ctx.store.getState().app.filter, skip: 0, search: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
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
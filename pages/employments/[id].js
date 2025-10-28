import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../layouts/App';
import pageListStyle from '../../src/styleMUI/employment/employmentList'
import CardEmployment from '../../components/card/CardEmployment'
import { connect } from 'react-redux'
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Link from 'next/link';
import Router from 'next/router'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import { useRouter } from 'next/router'
import {formatAmount, unawaited} from '../../src/lib';
import {getEmployments, getEmploymentsCount} from '../../src/gql/employment';
import {viewModes} from '../../src/enum';
import Table from '../../components/table/employments';

const filters = [{name: 'Все', value: ''}, {name: 'Агент', value: 'агент'}, {name: 'Супервайзер', value: 'менеджер'}, {name: 'Экспедитор', value: 'экспедитор'}, {name: 'Организация', value: 'организация'}]

const Employment = React.memo((props) => {
    const classes = pageListStyle();
    const router = useRouter()
    //props
    const {profile} = props.user;
    const {data} = props;
    const {search, filter, viewMode} = props.app;
    //ref
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    const paginationWork = useRef(true);
    //deps
    const deps = [filter]
    //listArgs
    const listArgs = {organization: router.query.id, search, filter}
    //count
    let [count, setCount] = useState('');
    const getCount = async () => setCount(await getEmploymentsCount(listArgs))
    //list
    let [list, setList] = useState(data.employments);
    const getList = async (skip) => {
        const employments = await getEmployments({...listArgs, skip: skip||0});
        if(!skip) {
            unawaited(getCount)
            setList(employments)
            paginationWork.current = true;
            (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        }
        else if(list.length) {
            setList(list => [...list, ...employments])
            paginationWork.current = true
        }
    }
    //pagination
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            await getList(list.length)
        }
    }, [search, list, ...deps])
    //filter
    useEffect(() => {
        if(!initialRender.current)
            unawaited(getList)
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
    //render
    return (
        <App checkPagination={checkPagination} searchShow filters={['суперорганизация', 'организация', 'менеджер', 'admin'].includes(profile.role)?filters:null} pageName='Сотрудники'>
            <Head>
                <title>Сотрудники</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                Всего: {formatAmount(count)}
            </div>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                {list?viewMode===viewModes.card?
                        list.map((element, idx) => <CardEmployment idx={idx} key={element._id} list={list} setList={setList} element={element}/>)
                        :
                        <Table list={list}/>
                    :null}
            </div>
            {['admin'].includes(profile.role)?
                <Link href={`/employment/[id]`} as={`/employment/new`}>
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

Employment.getInitialProps = async function(ctx) {
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
            employments: await getEmployments({organization: ctx.query.id,
                search: ctx.store.getState().app.search, filter: ctx.store.getState().app.filter, skip: 0}, getClientGqlSsr(ctx.req))
        }
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Employment);
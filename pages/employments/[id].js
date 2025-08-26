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
    const {profile} = props.user;
    const classes = pageListStyle();
    const {data} = props;
    let [list, setList] = useState(data.employments);
    let [count, setCount] = useState('');
    const getCount = async () => setCount(await getEmploymentsCount({organization: router.query.id, search, filter}))
    const {search, filter, sort, viewMode} = props.app;
    const router = useRouter()
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    const getList = async () => {
        unawaited(getCount)
        setList(await getEmployments({organization: router.query.id, search, filter, skip: 0}));
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        paginationWork.current = true;
    }
    useEffect(() => {
        if(!initialRender.current)
            unawaited(getList)
    }, [filter, sort])
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
    const paginationWork = useRef(true);
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            const addedList = await getEmployments({organization: router.query.id, search, filter, skip: list.length})
            if(addedList.length) {
                setList([...list, ...addedList])
                paginationWork.current = true
            }
        }
    }, [search, filter, list])
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
            employments: await getEmployments({organization: ctx.query.id, search: '', filter: '', skip: 0}, getClientGqlSsr(ctx.req))
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
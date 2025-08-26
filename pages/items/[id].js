import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../src/styleMUI/item/itemList'
import CardItem from '../../components/card/CardItem'
import {getItems} from '../../src/gql/items';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import initialApp from '../../src/initialApp'
import Link from 'next/link';
import { getClientGqlSsr } from '../../src/getClientGQL'
import Router from 'next/router'
import {formatAmount, unawaited} from '../../src/lib';
import {viewModes} from '../../src/enum';
import Table from '../../components/table/items';

const Items = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    let [list, setList] = useState(data.items);
    const {search, sort, organization, viewMode} = props.app;
    const {profile} = props.user;
    const searchTimeOut= useRef(null);
    const initialRender = useRef(true);
    const getList = async () => {
        setList(await getItems({organization, search, sort}))
        setPagination(100);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(() => {
        if(!initialRender.current) unawaited(getList)
    }, [sort, organization])
    useEffect(() => {
        if(initialRender.current)
            initialRender.current = false;
        else {
            if(searchTimeOut.current)
                clearTimeout(searchTimeOut.current)
            searchTimeOut.current = setTimeout(() => unawaited(getList), 500)
        }
    }, [search])
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [pagination, list])
    return (
        <App organizations checkPagination={checkPagination} searchShow pageName={'Товары'}>
            <Head>
                <title>Товары</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                <div className='count'>
                    Всего: {formatAmount(list.length)}
                </div>
                {list?profile.role==='client'||viewMode===viewModes.card?
                        list.map((element, idx) => {
                            if(idx<pagination)
                                return <CardItem idx={idx} list={list} setList={setList} key={element._id} element={element}/>
                        })
                        :
                        <Table list={list} pagination={pagination}/>
                    :null}
            </div>
            {['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                <Link href='/item/[id]' as={`/item/new`}>
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

Items.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!ctx.store.getState().user.profile.role)
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    ctx.store.getState().app.sort = '-priotiry'
    return {
        data: {items: await getItems({search: ''}, getClientGqlSsr(ctx.req))}
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Items);
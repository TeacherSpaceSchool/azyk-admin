import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../src/styleMUI/item/itemList'
import CardItem from '../../components/items/CardItem'
import {getItems} from '../../src/gql/items';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import initialApp from '../../src/initialApp'
import Link from 'next/link';
import { getClientGqlSsr } from '../../src/getClientGQL'
import Router from 'next/router'

const Items = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    let [list, setList] = useState(data.items);
    const { search, sort, organization } = props.app;
    const { profile } = props.user;
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    const initialRender = useRef(true);
    const getList = async ()=>{
        setList((await getItems({organization: organization, search, sort})).items)
        setPagination(100);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(()=>{
        (async()=>{
            if(!initialRender.current) {
                await getList()
            }
        })()
    },[sort, organization])
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            } else {
                if(searchTimeOut)
                    clearTimeout(searchTimeOut)
                searchTimeOut = setTimeout(async()=>{
                    await getList()
                }, 500)
                setSearchTimeOut(searchTimeOut)

            }
        })()
    },[search])
    let [pagination, setPagination] = useState(100);
    const checkPagination = ()=>{
        if(pagination<list.length){
            setPagination(pagination+100)
        }
    }
    return (
        <App organizations checkPagination={checkPagination} searchShow={true} sorts={data.sortItem} pageName={'Товары'}>
            <Head>
                <title>Товары</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                <div className='count'>
                    {`Всего: ${list.length}`}
                </div>

                {list?list.map((element, idx)=> {
                    if(idx<pagination)
                        return(
                            <CardItem nl list={list} idx={idx} setList={setList} key={element._id} element={element}/>
                        )}
                ):null}
            </div>
            {['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                <Link href='/item/[id]' as={`/item/new`}>
                    <Fab color='primary' aria-label='add' className={classes.fab}>
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
        data: await getItems({search: '', sort: ctx.store.getState().app.sort}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Items);
import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../../layouts/App';
import CardClientNetwork from '../../../components/card/CardClientNetwork';
import pageListStyle from '../../../src/styleMUI/ads/adsList'
import {getClientNetworks} from '../../../src/gql/clientNetwork'
import { connect } from 'react-redux'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import initialApp from '../../../src/initialApp'
import { useRouter } from 'next/router'
import Router from 'next/router'
import {formatAmount} from '../../../src/lib';
import {viewModes} from '../../../src/enum';
import Table from '../../../components/table/clientnetworks';

const ClientNetwork = React.memo((props) => {
    const initialRender = useRef(true);
    const classes = pageListStyle();
    const {data} = props;
    let [list, setList] = useState(data.list);
    const {search, viewMode} = props.app;
    const {profile} = props.user;
    const searchTimeOut = useRef(null);
    useEffect(() => {
            if(initialRender.current) 
                initialRender.current = false;
            else {
                if(searchTimeOut.current)
                    clearTimeout(searchTimeOut.current)
                searchTimeOut.current = setTimeout(async () => {
                    setList(await getClientNetworks({search}))
                    setPagination(100);
                    (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
                }, 500)
            }
    }, [search])
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [list, pagination])
    const router = useRouter()
    return (
        <App checkPagination={checkPagination} searchShow pageName='Сети клиентов'>
            <Head>
                <title>Сети клиентов</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                <div className='count'>
                    Всего: {formatAmount(list.length)}
                </div>
                {list?viewMode===viewModes.card?
                        <>
                            {['суперорганизация', 'организация', 'admin'].includes(profile.role)?<CardClientNetwork edit items={data.brands} organization={router.query.id} list={list} setList={setList}/>:null}
                            {list.map((element, idx) => {
                                if(idx<pagination)
                                    return <CardClientNetwork edit idx={idx} items={data.brands} organization={router.query.id} list={list} setList={setList} key={element._id} element={element}/>
                            })}
                        </>
                        :
                        <Table list={list} pagination={pagination}/>
                    :null}
            </div>
        </App>
    )
})

ClientNetwork.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!ctx.store.getState().user.profile.role)
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {list: await getClientNetworks({search: ''}, getClientGqlSsr(ctx.req))},
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(ClientNetwork);
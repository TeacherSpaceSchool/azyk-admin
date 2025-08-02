import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../layouts/App';
import { connect } from 'react-redux'
import { getSubBrands } from '../src/gql/subBrand'
import {getOrganizations} from '../src/gql/organization'
import pageListStyle from '../src/styleMUI/subbrand/subbrandList'
import CardSubBrand from '../components/card/CardSubBrand'
import Router from 'next/router'
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import {unawaited} from '../src/lib';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Link from 'next/link';

const SubBrands = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    let [list, setList] = useState(data.subBrands);
    const {search, organization, city} = props.app;
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    const getList = async () => {
        setList(await getSubBrands({search, organization, city}));
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        setPagination(100);
    }
    useEffect(() => {
            if(!initialRender.current) {
                unawaited(getList)
            }
    }, [city, organization])
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
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [pagination, list])
    return (
        <App checkPagination={checkPagination} searchShow  pageName='Подбренды' organizations cityShow>
            <Head>
                <title>Подбренды</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                <div className='count'>
                    {`Всего: ${list.length}`}
                </div>
                {list?list.map((element, idx)=> {
                    if(idx<pagination)
                        return(
                            <CardSubBrand idx={idx}  key={element._id} list={list} setList={setList} element={element} organizations={data.organizations}/>
                        )
                }):null}
                <Link href='/subbrand/[id]' as={`/subbrand/new`}>
                    <Fab color='primary' className={classes.fab}>
                        <AddIcon />
                    </Fab>
                </Link>
            </div>
        </App>
    )
})

SubBrands.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    let role = ctx.store.getState().user.profile.role
    let authenticated = ctx.store.getState().user.authenticated
    if(!['admin', 'суперорганизация', 'организация'].includes(role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: ['суперагент','агент'].includes(role)?'/catalog':!authenticated?'/contact':'/items/all'
            })
            ctx.res.end()
        }
        else {
            Router.push(['суперагент','агент'].includes(role)?'/catalog':!authenticated?'/contact':'/items/all')
        }
    return {data: {subBrands: await getSubBrands({search: ''}, getClientGqlSsr(ctx.req))}};
};

function mapStateToProps (state) {
    return {
        app: state.app,
    }
}

export default connect(mapStateToProps)(SubBrands);
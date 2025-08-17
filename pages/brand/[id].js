import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../src/styleMUI/item/itemList'
import CardItem from '../../components/card/CardItem'
import { useRouter } from 'next/router'
import {getBrands} from '../../src/gql/items';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Link from 'next/link';
import initialApp from '../../src/initialApp'
import { getClientGqlSsr } from '../../src/getClientGQL'
import Router from 'next/router'
import {formatAmount, unawaited} from '../../src/lib';
import {getOrganization} from '../../src/gql/organization';

const Brand = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    const router = useRouter()
    let [list, setList] = useState(data.brands);
    const {search, filter, city} = props.app;
    const {profile} = props.user;
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    const getList = async () => {
        setList(await getBrands({city, organization: router.query.id, search}))
        setPagination(100);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(() => {
        if(!initialRender.current)
            unawaited(getList)
    }, [filter, city])
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
        <App cityShow checkPagination={checkPagination} searchShow pageName={data.organization?data.organization.name:'Ничего не найдено'}>
            <Head>
                <title>{data.organization?data.organization.name:'Ничего не найдено'}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                {list?list.map((element, idx) => {
                    if(idx<pagination)
                        return(
                            <CardItem idx={idx} list={list} setList={setList} key={element._id} element={element}/>
                        )}
                ):null}
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
            <div className='count'>
                Всего: {formatAmount(list.length)}
            </div>
        </App>
    )
})

Brand.getInitialProps = async function(ctx) {
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
    // eslint-disable-next-line no-undef
    const [brands, organization] = await Promise.all([
        getBrands({city: ctx.store.getState().app.city, organization: ctx.query.id, search: ''}, getClientGqlSsr(ctx.req)),
        getOrganization(ctx.query.id, getClientGqlSsr(ctx.req))
    ])
    return {data: {brands, organization}};
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Brand);
import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../layouts/App';
import { connect } from 'react-redux'
import { getOrganizations } from '../src/gql/organization'
import pageListStyle from '../src/styleMUI/organization/orgaizationsList'
import CardOrganization from '../components/card/CardOrganization'
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Link from 'next/link';
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import Router, {useRouter} from 'next/router'
import {formatAmount, getQueryParam, unawaited} from '../src/lib';
import {getAdsOrganizations} from '../src/gql/ads';
import {viewModes} from '../src/enum';
import Table from '../components/table/organizations';

const adsPath = 'ads'

const filters = [{name: 'Все', value: ''}, {name: 'Активные', value: 'active'}, {name: 'Неактивные', value: 'deactive'}]

const Organization = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    const {profile} = props.user;
    const router = useRouter();
    const defaultPath = 'organization'
    const path = router.query.path||defaultPath
    const defaultTitle = 'Организации'
    const title = router.query.title||defaultTitle
    const showSuperOrganization = profile.role==='admin'&&path!==defaultPath&&router.query.super
    let [list, setList] = useState(data.organizations);
    const {search, filter, city, viewMode} = props.app;
    const prevPath = useRef(null);
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    const getList = async (varPath) => {
        setList(profile.role!=='admin'&&(varPath||path)===adsPath?
            await getAdsOrganizations()
            :
            await getOrganizations({search, filter, city})
        );
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        setPagination(100);
    }
    useEffect(() => {
        const routeChangeComplete = (url) => {
            if(
                profile.role!=='admin'&&(!prevPath.current||
                (prevPath.current!==url&&
                (!prevPath.current.includes(adsPath)&&url.includes(adsPath)||
                prevPath.current.includes(adsPath)&&!url.includes(adsPath))))
            ) {
                unawaited(() => getList(getQueryParam(url, 'path')||defaultPath))
            }
            prevPath.current = url;
            (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        }
        Router.events.on('routeChangeComplete', routeChangeComplete);
        return () => {
            Router.events.off('routeChangeComplete', routeChangeComplete)
        }
    }, [])
    useEffect(() => {
        if (!initialRender.current) unawaited(getList)
    }, [filter, city])
    useEffect(() => {
        if(initialRender.current) {
            initialRender.current = false;
        } else {
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
        <App cityShow checkPagination={checkPagination} searchShow filters={profile.role==='admin'&&filters} pageName={title}>
            <Head>
                <title>{title}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                Всего: {formatAmount(list.length)}
            </div>
            <div className={classes.page}>
                {list?viewMode===viewModes.card?
                        <>
                            {
                                showSuperOrganization?
                                    <Link href={`/${path}/[id]`} as={`/${path}/super`}>
                                        <a>
                                            <CardOrganization element={{name: 'AZYK.STORE', image: '/static/512x512.png'}}/>
                                        </a>
                                    </Link>
                                    :null
                            }
                            {list?list.map((element, idx) => {
                                if(idx<pagination)
                                    return <Link key={element._id} href={`/${path}/[id]`} as={`/${path}/${element._id}`}>
                                        <a>
                                            <CardOrganization list={list} setList={setList} element={element}/>
                                        </a>
                                    </Link>
                            }):null}
                        </>
                        :
                        <Table path={path} pagination={pagination} list={[...showSuperOrganization?[{_id: 'super', name: 'AZYK.STORE'}]:[], ...list]}/>
                    :null}
            </div>
            {profile.role==='admin'&&path===defaultPath?
                <Link href='/organization/[id]' as={`/organization/new`}>
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

Organization.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!ctx.store.getState().user.profile.role||ctx.store.getState().user.profile.organization)
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            organizations: ctx.store.getState().user.profile.role!=='admin'&&ctx.query.path===adsPath?
                await getAdsOrganizations(getClientGqlSsr(ctx.req))
                :
                await getOrganizations({city: ctx.store.getState().app.city, search: '', filter: ''}, getClientGqlSsr(ctx.req))
        }
    };
};

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app,
    }
}

export default connect(mapStateToProps)(Organization);
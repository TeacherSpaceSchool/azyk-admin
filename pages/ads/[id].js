import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../layouts/App';
import CardAds from '../../components/card/CardAds';
import pageListStyle from '../../src/styleMUI/ads/adsList'
import {getAdss} from '../../src/gql/ads'
import { connect } from 'react-redux'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import { getOrganization } from '../../src/gql/organization'
import { useRouter } from 'next/router'
import Router from 'next/router'
import {getBrands} from '../../src/gql/items';
import {formatAmount} from '../../src/lib';

const Ads = React.memo((props) => {
    const initialRender = useRef(true);
    const classes = pageListStyle();
    const {data} = props;
    let [list, setList] = useState(data.adss);
    const {search} = props.app;
    const {profile} = props.user;
    const searchTimeOut = useRef(null);
    useEffect(() => {
            if(initialRender.current) 
                initialRender.current = false;
            else {
                if(searchTimeOut.current)
                    clearTimeout(searchTimeOut.current)
                searchTimeOut.current = setTimeout(async () => {
                    setList(await getAdss({search, organization: router.query.id}))
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
        <App checkPagination={checkPagination} searchShow pageName={`Акции${data.organization?` ${data.organization.name}`:''}`}>
            <Head>
                <title>Акции{data.organization?` ${data.organization.name}`:''}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                <div className='count'>
                    Всего: {formatAmount(list.length)}
                </div>
                {['суперорганизация', 'организация', 'admin'].includes(profile.role)?<CardAds edit items={data.brands} organization={router.query.id} list={list} setList={setList}/>:null}
                {list?list.map((element, idx)=> {
                    if(idx<pagination)
                        return(
                            <CardAds edit idx={idx}  items={data.brands} organization={router.query.id} list={list} setList={setList} key={element._id} element={element}/>
                        )}
                ):null}
            </div>
        </App>
    )
})

Ads.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!ctx.store.getState().user.profile.role)
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    // eslint-disable-next-line no-undef
    const [adss, organization, brands] = await Promise.all([
        getAdss({search: '', organization: ctx.query.id}, getClientGqlSsr(ctx.req)),
        getOrganization(ctx.query.id, getClientGqlSsr(ctx.req)),
        getBrands({organization: ctx.query.id, search: '', sort: '-priotiry'}, getClientGqlSsr(ctx.req))
    ])
    return {
        data: {adss, organization, brands},
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Ads);
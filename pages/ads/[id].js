import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import CardAds from '../../components/ads/CardAds';
import pageListStyle from '../../src/styleMUI/ads/adsList'
import {getAdss} from '../../src/gql/ads'
import { connect } from 'react-redux'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import { getOrganization } from '../../src/gql/organization'
import { useRouter } from 'next/router'
import Router from 'next/router'
import {getBrands} from '../../src/gql/items';

const Ads = React.memo((props) => {
    const initialRender = useRef(true);
    const classes = pageListStyle();
    const { data } = props;
    let [list, setList] = useState(data.adss);
    const { search } = props.app;
    const { profile } = props.user;
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            } else {
                if(searchTimeOut)
                    clearTimeout(searchTimeOut)
                searchTimeOut = setTimeout(async()=>{
                    setList((await getAdss({search, organization: router.query.id})).adss)
                    setPagination(100);
                    (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
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
    const router = useRouter()
    return (
        <App checkPagination={checkPagination} searchShow={true} pageName={`Акции${data.organization?` ${data.organization.name}`:''}`}>
            <Head>
                <title>Акции{data.organization?` ${data.organization.name}`:''}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                <div className='count'>
                    {`Всего: ${list.length}`}
                </div>
                {['организация', 'admin'].includes(profile.role)?<CardAds list={list} edit={true} items={data.brands} organization={router.query.id} setList={setList}/>:null}
                {list?list.map((element, idx)=> {
                    if(idx<pagination)
                        return(
                            <CardAds edit={true} list={list} idx={idx}  items={data.brands} organization={router.query.id} setList={setList} key={element._id} element={element}/>
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
    return {
        data: {
            ...await getAdss({search: '', organization: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
            ...await getOrganization({_id: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
            ...await getBrands({organization: ctx.query.id, search: '', sort: '-priotiry'}, ctx.req?await getClientGqlSsr(ctx.req):undefined)
        },
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Ads);
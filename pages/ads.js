import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../layouts/App';
import { connect } from 'react-redux'
import { getAdsOrganizations } from '../src/gql/ads'
import { getOrganizations } from '../src/gql/organization'
import pageListStyle from '../src/styleMUI/organization/orgaizationsList'
import CardOrganization from '../components/organization/CardOrganization'
import Link from 'next/link';
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import Router from 'next/router'

const Ads = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    const { city } = props.app;
    let [list, setList] = useState(data.organizations);
    const initialRender = useRef(true);
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            } else {
                list = (await getOrganizations({search: '', filter: '', city: city})).organizations
                setList(list)
                setPagination(100);
                (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });

            }
        })()
    },[city])
    let [pagination, setPagination] = useState(100);
    const checkPagination = ()=>{
        if(pagination<list.length){
            setPagination(pagination+100)
        }
    }
    return (
        <App cityShow checkPagination={checkPagination} pageName='Акции'>
            <Head>
                <title>Акции</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                {`Всего: ${list.length}`}
            </div>
            <div className={classes.page}>
                {list?list.map((element, idx)=> {
                        if(idx<pagination)
                            return(
                                <Link href='/ads/[id]' as={`/ads/${element._id}`}>
                                    <a>
                                        <CardOrganization key={element._id} setList={setList} element={element}/>
                                    </a>
                                </Link>
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
            organizations:
                ctx.store.getState().user.profile.role==='admin'?
                    (await getOrganizations({city: ctx.store.getState().app.city, search: '', filter: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined)).organizations
                    :
                    (await getAdsOrganizations(ctx.req?await getClientGqlSsr(ctx.req):undefined)).adsOrganizations
        }
    };
};

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app,
    }
}

export default connect(mapStateToProps)(Ads);
import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import pageListStyle from '../../src/styleMUI/blog/blogList'
import {getOrganizations} from '../../src/gql/organization'
import { connect } from 'react-redux'
import Link from 'next/link';
import CardOrganization from '../../components/organization/CardOrganization'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import Router from 'next/router'

const OutXMLAds = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    const { city } = props.app;
    let [list, setList] = useState(data.organizations);
    const initialRender = useRef(true);
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                setList((await getOrganizations({search: '', filter: '', city: city})).organizations)
            }
        })()
    },[city])
    useEffect(()=>{
        setPagination(100)
    },[list])
    let [pagination, setPagination] = useState(100);
    const checkPagination = ()=>{
        if(pagination<list.length){
            setPagination(pagination+100)
        }
    }
    return (
        <App cityShow checkPagination={checkPagination} searchShow={true} pageName='Акционная интеграции 1С'>
            <Head>
                <title>Акционная интеграции 1С</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                {`Всего: ${list.length}`}
            </div>
            <div className={classes.page}>
                {list?list.map((element, idx)=> {
                    if(idx<pagination)
                        return(
                            <Link href='/statistic/outxmlads/[id]' as={`/statistic/outxmlads/${element._id}`}>
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

OutXMLAds.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(ctx.store.getState().user.profile.role!=='admin')
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
            (await getOrganizations({city: ctx.store.getState().app.city, search: '', filter: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined)).organizations
        }
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(OutXMLAds);
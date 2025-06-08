import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../layouts/App';
import { connect } from 'react-redux'
import { getOrganizations } from '../src/gql/organization'
import pageListStyle from '../src/styleMUI/organization/orgaizationsList'
import { urlMain } from '../redux/constants/other'
import LazyLoad from 'react-lazyload';
import Link from 'next/link';
import CardOrganization from '../components/organization/CardOrganization'
import CardOrganizationPlaceholder from '../components/organization/CardOrganizationPlaceholder'
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import Router from 'next/router'
import { forceCheck } from 'react-lazyload';

const Districts = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    const { city } = props.app;
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
                forceCheck();
            }
        })()
    },[city])
    let [list, setList] = useState(data.organizations);
    const { profile } = props.user;
    let height = 80
    let [pagination, setPagination] = useState(100);
    const checkPagination = ()=>{
        if(pagination<list.length){
            setPagination(pagination+100)
        }
    }
    return (
        <App cityShow checkPagination={checkPagination} pageName='Районы'>
            <Head>
                <title>Районы</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                {`Всего: ${list.length}`}
            </div>
            <div className={classes.page}>
                {
                    profile.role==='admin'?
                        <Link href='/districts/[id]' as='/districts/super'>
                            <a>
                                <CardOrganization element={{name: 'AZYK.STORE', image: '/static/512x512.png'}}/>
                            </a>
                        </Link>
                        :null
                }
                {list?list.map((element, idx)=> {
                        if(idx<pagination)
                            return(
                                <LazyLoad scrollContainer={'.App-body'} key={element._id} height={height} offset={[height, 0]} debounce={0} once={true}  placeholder={<CardOrganizationPlaceholder height={height}/>}>
                                    <Link href='/districts/[id]' as={`/districts/${element._id}`}>
                                        <a>
                                            <CardOrganization key={element._id} setList={setList} element={element}/>
                                        </a>
                                    </Link>
                                </LazyLoad>
                            )}
                ):null}
            </div>
        </App>
    )
})

Districts.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin'].includes(ctx.store.getState().user.profile.role))
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
        user: state.user,
        app: state.app,
    }
}

export default connect(mapStateToProps)(Districts);
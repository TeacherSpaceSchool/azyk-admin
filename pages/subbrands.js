import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../layouts/App';
import { connect } from 'react-redux'
import { getSubBrands } from '../src/gql/subBrand'
import {getOrganization, getOrganizations} from '../src/gql/organization'
import pageListStyle from '../src/styleMUI/subbrand/subbrandList'
import CardSubBrand from '../components/subBrand/CardSubBrand'
import Router from 'next/router'
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'

const SubBrands = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    let [list, setList] = useState(data.subBrands);
    const { search, organization, city } = props.app;
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    let [organizations, setOrganizations] = useState(data.organizations);
    const initialRender = useRef(true);
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            } else {
                setOrganizations((await getOrganizations({search: '', filter: '', city})).organizations)
            }
        })()
    },[city])
    const getList = async ()=>{
        setList((await getSubBrands({search, organization, city})).subBrands);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        setPagination(100);
    }
    useEffect(()=>{
        (async()=>{
            if(!initialRender.current) {
                await getList()
            }
        })()
    },[city, organization])
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
        <App checkPagination={checkPagination} searchShow={true}  pageName='Подбренды' organizations cityShow>
            <Head>
                <title>Подбренды</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                <div className='count'>
                    {`Всего: ${list.length}`}
                </div>
                <CardSubBrand list={list} organization={data.organization} organizations={organizations} setList={setList}/>
                {list?list.map((element, idx)=> {
                    if(idx<pagination)
                        return(
                            <CardSubBrand list={list} idx={idx}  key={element._id} setList={setList} element={element} organizations={organizations}/>
                        )
                }):null}
            </div>
        </App>
    )
})

SubBrands.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    let role = ctx.store.getState().user.profile.role
    let organization = ctx.store.getState().user.profile.organization
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
    return {
        data:
            {
                ...await getSubBrands({search: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
                ...await getOrganizations({city: ctx.store.getState().app.city, search: '', filter: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
                ...organization?await getOrganization({_id: organization}, ctx.req?await getClientGqlSsr(ctx.req):undefined):{}
            },
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
    }
}

export default connect(mapStateToProps)(SubBrands);
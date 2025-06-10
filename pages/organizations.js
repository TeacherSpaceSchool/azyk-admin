import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../layouts/App';
import { connect } from 'react-redux'
import { getOrganizations } from '../src/gql/organization'
import pageListStyle from '../src/styleMUI/organization/orgaizationsList'
import CardOrganization from '../components/organization/CardOrganization'
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Link from 'next/link';
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import Router from 'next/router'

const Organization = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    let [list, setList] = useState(data.organizations);
    const { search, filter, city } = props.app;
    const { profile } = props.user;
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    const initialRender = useRef(true);
    const getList = async ()=>{
        setList((await getOrganizations({search, filter: filter, city: city})).organizations);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        setPagination(100);
    }
    useEffect(()=>{
        (async()=>{
            if(!initialRender.current) {
                await getList()
            }
        })()
    },[filter, city])
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
    },[ search])
    let [pagination, setPagination] = useState(100);
    const checkPagination = ()=>{
        if(pagination<list.length){
            setPagination(pagination+100)
        }
    }
    return (
        <App cityShow checkPagination={checkPagination} searchShow={true} filters={data.filterOrganization} pageName='Организации'>
            <Head>
                <title>Организации</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                {`Всего: ${list.length}`}
            </div>
            <div className={classes.page}>
                {list?list.map((element, idx)=> {
                    if(idx<pagination)
                        return(
                            <Link href='/organization/[id]' as={`/organization/${element._id}`}>
                                <a>
                                    <CardOrganization organization key={element._id} setList={setList} element={element}/>
                                </a>
                            </Link>
                        )}
                ):null}
            </div>
            {profile.role==='admin'?
                <Link href='/organization/[id]' as={`/organization/new`}>
                    <Fab color='primary' aria-label='add' className={classes.fab}>
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
        data: await getOrganizations({city: ctx.store.getState().app.city, search: '', filter: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined)
    };
};

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app,
    }
}

export default connect(mapStateToProps)(Organization);
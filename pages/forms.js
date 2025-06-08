import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import App from '../layouts/App';
import { connect } from 'react-redux'
import { getTemplateForms } from '../src/gql/form'
import pageListStyle from '../src/styleMUI/form/formList'
import CardForms from '../components/form/CardForms'
import { urlMain } from '../redux/constants/other'
import LazyLoad from 'react-lazyload';
import { forceCheck } from 'react-lazyload';
import CardFormsPlaceholder from '../components/form/CardFormPlaceholder'
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import Router from 'next/router'
import Link from 'next/link';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

const Forms = React.memo((props) => {
    const classes = pageListStyle();
    const { profile } = props.user;
    const { data } = props;
    let [list, setList] = useState(data.templateForms);
    const { search, organization } = props.app;
    let height = 95
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    let [paginationWork, setPaginationWork] = useState(true);
    const checkPagination = async()=>{
        if(paginationWork){
            let addedList = (await getTemplateForms({organization: organization, search, skip: list.length})).templateForms
            if(addedList.length>0){
                setList([...list, ...addedList])
            }
            else
                setPaginationWork(false)
        }
    }
    const getList = async ()=>{
        setList((await getTemplateForms({organization: organization, search, skip: 0})).templateForms);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        forceCheck()
        setPaginationWork(true);
    }
    useEffect(()=>{
        (async()=> {
            await getList()
        })()
    },[organization])
    useEffect(()=>{
        if(searchTimeOut)
            clearTimeout(searchTimeOut)
        searchTimeOut = setTimeout(async()=>{
            await getList()
        }, 500)
        setSearchTimeOut(searchTimeOut)
    },[search])
    return (
        <App organizations checkPagination={checkPagination} setList={setList} list={list} searchShow={true} pageName='Анкеты/Опросники'>
            <Head>
                <title>Анкеты/Опросники</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                {
                    list?list.map((element, idx)=> {
                            return(
                                <LazyLoad scrollContainer={'.App-body'} key={element._id} height={height} offset={[height, 0]} debounce={0} once={true}  placeholder={<CardFormsPlaceholder height={height}/>}>
                                    <CardForms list={list} idx={idx} element={element} setList={setList}/>
                                </LazyLoad>
                            )}
                    ):null
                }
                {['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                    <Link href={`/forms/edit/[id]`} as={`/forms/edit/new`}>
                        <Fab color='primary' aria-label='add' className={classes.fab}>
                            <AddIcon/>
                        </Fab>
                    </Link>
                    :
                    null
                }
            </div>
        </App>
    )
})

Forms.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'client', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            ...await getTemplateForms({skip: 0, search: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
        }
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Forms);
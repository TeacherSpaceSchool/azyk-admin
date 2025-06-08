import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import { getForms, getTemplateForm } from '../../src/gql/form'
import pageListStyle from '../../src/styleMUI/form/formList'
import CardForm from '../../components/form/CardForm'
import { urlMain } from '../../redux/constants/other'
import LazyLoad from 'react-lazyload';
import { forceCheck } from 'react-lazyload';
import CardFormsPlaceholder from '../../components/form/CardFormPlaceholder'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import Router from 'next/router'
import Link from 'next/link';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { useRouter } from 'next/router'

const Forms = React.memo((props) => {
    const router = useRouter()
    const classes = pageListStyle();
    const { profile } = props.user;
    const { data } = props;
    let [list, setList] = useState(data.forms);
    const { search } = props.app;
    const initialRender = useRef(true);
    let height = 70
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    let [paginationWork, setPaginationWork] = useState(true);
    const checkPagination = async()=>{
        if(paginationWork){
            let addedList = (await getForms({templateForm: router.query.id, search, skip: list.length})).forms
            if(addedList.length>0){
                setList([...list, ...addedList])
            }
            else
                setPaginationWork(false)
        }
    }
    const getList = async()=>{
        setList((await getForms({templateForm: router.query.id, search, skip: 0})).forms)
        setPaginationWork(true);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        forceCheck()
    }
    useEffect(()=>{
        if(initialRender.current) {
            initialRender.current = false;
        } else {
            if (searchTimeOut)
                clearTimeout(searchTimeOut)
            searchTimeOut = setTimeout(async () => {
                await getList()
            }, 500)
            setSearchTimeOut(searchTimeOut)
        }
    },[search])
    return (
        <App checkPagination={checkPagination} setList={setList} list={list} searchShow={true} pageName={data.templateForm.title}>
            <Head>
                <title>{data.templateForm.title}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                {
                    list?list.map((element)=> {
                            return(
                                <LazyLoad scrollContainer={'.App-body'} key={element._id} height={height} offset={[height, 0]} debounce={0} once={true}  placeholder={<CardFormsPlaceholder height={height}/>}>
                                    <CardForm templateForm={router.query.id} element={element} />
                                </LazyLoad>
                            )}
                    ):null
                }
                {['admin', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(profile.role)?
                    <Link href={{ pathname: '/form/[id]', query: { templateform: router.query.id} }} as={`/form/new?templateform=${router.query.id}`}>
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
    if(!['admin', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            ...await getForms({templateForm: ctx.query.id, skip: 0, search: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
            ...await getTemplateForm({_id: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined)
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
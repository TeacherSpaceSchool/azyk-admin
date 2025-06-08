import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import App from '../../../layouts/App';
import CardReceiveData from '../../../components/receiveData/CardReceiveData';
import pageListStyle from '../../../src/styleMUI/error/errorList'
import {getReceivedDatas, clearAllReceivedDatas} from '../../../src/gql/receiveData'
import { connect } from 'react-redux'
import { urlMain } from '../../../redux/constants/other'
import LazyLoad from 'react-lazyload';
import CardReceiveDataPlaceholder from '../../../components/receiveData/CardReceiveDataPlaceholder'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import initialApp from '../../../src/initialApp'
import Router from 'next/router'
import Fab from '@material-ui/core/Fab';
import RemoveIcon from '@material-ui/icons/Clear';
import Confirmation from '../../../components/dialog/Confirmation'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import { forceCheck } from 'react-lazyload';
import { useRouter } from 'next/router'
const height = 308

const ReceiveData = React.memo((props) => {
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    const classes = pageListStyle();
    const { data } = props;
    const { search, filter } = props.app;
    const { profile } = props.user;
    const router = useRouter()
    let [list, setList] = useState(data.receivedDatas);
    useEffect(()=>{
        (async()=>{
            setList((await getReceivedDatas({organization: router.query.id, search, filter: filter})).receivedDatas)
            setPagination(100)
            forceCheck()
        })()
    },[search, filter])
    let [pagination, setPagination] = useState(100);
    const checkPagination = ()=>{
        if(pagination<list.length){
            setPagination(pagination+100)
        }
    }
    return (
        <App checkPagination={checkPagination} filters={data.filterReceivedData} searchShow={true} pageName='Принятая интеграции 1С'>
            <Head>
                <title>Принятая интеграции 1С</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                <div className='count'>
                    {`Всего: ${list.length}`}
                </div>
                {list?list.map((element, idx)=>
                    <LazyLoad scrollContainer={'.App-body'} key={element._id} height={height} offset={[height, 0]} debounce={0} once={true}  placeholder={<CardReceiveDataPlaceholder height={height}/>}>
                        <CardReceiveData list={list} setList={setList} element={element} idx={idx} forceCheck={forceCheck}/>
                    </LazyLoad>
                ):null}
            </div>
            {
                profile.role==='admin'?
                    <Fab onClick={async()=>{
                        const action = async() => {
                            await clearAllReceivedDatas(router.query.id)
                            setList([])
                        }
                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                        showMiniDialog(true)
                    }} color='primary' aria-label='add' className={classes.fab}>
                        <RemoveIcon />
                    </Fab>
                    :
                    null
            }
        </App>
    )
})

ReceiveData.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация', 'организация', 'менеджер'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            ...await getReceivedDatas({organization: ctx.query.id, search: '', filter: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined)
        },
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReceiveData);
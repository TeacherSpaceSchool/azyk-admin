import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import CardFile from '../../components/file/CardFile';
import CardFilePlaceholder from '../../components/file/CardFilePlaceholder';
import { connect } from 'react-redux'
import pageListStyle from '../../src/styleMUI/file/fileList'
import Router from 'next/router'
import { urlMain } from '../../redux/constants/other'
import initialApp from '../../src/initialApp'
import { getFiles, clearAllDeactiveFiles } from '../../src/gql/files'
import { getClientGqlSsr } from '../../src/getClientGQL'
import * as appActions from '../../redux/actions/app'
import { bindActionCreators } from 'redux'
import LazyLoad from 'react-lazyload';
import Fab from '@material-ui/core/Fab';
import RemoveIcon from '@material-ui/icons/Clear';
import Confirmation from '../../components/dialog/Confirmation'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import {checkFloat} from '../../src/lib'

const Files = React.memo((props) => {
    const { data } = props;
    const classes = pageListStyle();
    const { filter } = props.app;
    const { showLoad } = props.appActions;
    const height = 80
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    const initialRender = useRef(true);
    let [list, setList] = useState(data.files);
    let [size, setSize] = useState(0);
    let [pagination, setPagination] = useState(100);
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
                size = 0
                for (let i = 0; i < list.length; i++) {
                    size += list[i].size
                }
                setSize(size)
            } else {
                await showLoad(true)
                list = (await getFiles(filter)).files
                setList([...list])
                size = 0
                for (let i = 0; i < list.length; i++) {
                    size += list[i].size
                }
                setSize(size)
                await showLoad(false)
            }
        })()
    },[filter])
    const checkPagination = ()=>{
        if(pagination<list.length){
            setPagination(pagination+100)
        }
    }
    return (
        <App checkPagination={checkPagination} pageName='Файловое хранилище' filters={data.filterFile}>
            <Head>
                <title>Файловое хранилище</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                {list?list.map((element, idx)=> {
                    if(idx<pagination)
                        return(
                            <LazyLoad scrollContainer={'.App-body'} key={element._id} height={height} offset={[height, 0]} debounce={0} once={true}  placeholder={<CardFilePlaceholder height={height}/>}>
                                <CardFile key={element._id} element={element}/>
                            </LazyLoad>
                        )}
                ):null}
            </div>
            <Fab onClick={async()=>{
                const action = async() => {
                    await clearAllDeactiveFiles()
                }
                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                showMiniDialog(true)
            }} color='primary' aria-label='add' className={classes.fab}>
                <RemoveIcon />
            </Fab>
            <div className='count' >
                {
                    `Размер: ${size>1024?`${checkFloat(size/1024)} GB`:`${checkFloat(size)} MB`}`
                }
            </div>
        </App>
    )
})

Files.getInitialProps = async function(ctx) {
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
            ...await getFiles('', ctx.req?await getClientGqlSsr(ctx.req):undefined),
        }
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
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Files);
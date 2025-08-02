import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../../layouts/App';
import CardFile from '../../../components/card/CardFile';
import { connect } from 'react-redux'
import pageListStyle from '../../../src/styleMUI/file/fileList'
import Router from 'next/router'
import initialApp from '../../../src/initialApp'
import { getFiles, clearAllDeactiveFiles } from '../../../src/gql/files'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import * as appActions from '../../../redux/actions/app'
import { bindActionCreators } from 'redux'
import Fab from '@material-ui/core/Fab';
import RemoveIcon from '@material-ui/icons/Clear';
import Confirmation from '../../../components/dialog/Confirmation'
import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import {checkFloat} from '../../../src/lib'

const Files = React.memo((props) => {
    const {data} = props;
    const classes = pageListStyle();
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const initialRender = useRef(true);
    let [size, setSize] = useState(0);
    const [pagination, setPagination] = useState(100);
    useEffect(() => {
            if(initialRender.current) {
                initialRender.current = false;
                size = 0
                for (let i = 0; i < data.files.length; i++) {
                    size += data.files[i].size
                }
                setSize(size)
            }
    }, [])
    const checkPagination = useCallback(() => {
        if(pagination<data.files.length)
            setPagination(pagination => pagination+100)
    }, [pagination])
    return (
        <App checkPagination={checkPagination} pageName='Файловое хранилище'>
            <Head>
                <title>Файловое хранилище</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                {data.files?data.files.map((element, idx)=> {
                    if(idx<pagination)
                        return(
                            <CardFile key={element._id} element={element}/>
                        )}
                ):null}
            </div>
            {data.files.length?<Fab onClick={() => {
                const action = async () => await clearAllDeactiveFiles()
                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                showMiniDialog(true)
            }} color='primary' className={classes.fab}>
                <RemoveIcon />
            </Fab>:null}
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
            files: await getFiles(getClientGqlSsr(ctx.req)),
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
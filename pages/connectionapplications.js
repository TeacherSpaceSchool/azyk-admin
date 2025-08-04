import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../layouts/App';
import { connect } from 'react-redux'
import { getConnectionApplications, getConnectionApplicationsSimpleStatistic } from '../src/gql/connectionApplication'
import pageListStyle from '../src/styleMUI/connectionApplication/connectionApplicationList'
import CardConnectionApplications from '../components/card/CardConnectionApplication'
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import Router from 'next/router'
import Sign from '../components/dialog/Sign';
import {bindActionCreators} from 'redux';
import * as mini_dialogActions from '../redux/actions/mini_dialog';
import {unawaited} from '../src/lib';

const filters = [{name: 'Все', value: ''}, {name: 'Обработка', value: 'обработка'}]

const ConnectionApplications = React.memo((props) => {
    const classes = pageListStyle();
    const {profile} = props.user;
    const {data} = props;
    const initialRender = useRef(true);
    let [list, setList] = useState(data.connectionApplications);
    let [simpleStatistic, setSimpleStatistic] = useState('');
    const getSimpleStatistic = async () => setSimpleStatistic(await getConnectionApplicationsSimpleStatistic({filter}))
    const {filter, isMobileApp} = props.app;
    const paginationWork = useRef(true);
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            let addedList = await getConnectionApplications({filter, skip: list.length})
            if(addedList.length) {
                setList([...list, ...addedList])
                paginationWork.current = true
            }
        }
    }, [filter, list])
    const getList = async () => {
        unawaited(getSimpleStatistic)
        setList(await getConnectionApplications({filter, skip: 0}))
        paginationWork.current = true;
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(() => {
        if(initialRender.current) {
            initialRender.current = false;
            unawaited(getSimpleStatistic)
        }
        else
            unawaited(getList)
    }, [filter])
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    return (
        <App checkPagination={checkPagination} list={list} setList={setList} filters={'admin'===profile.role?filters:null} pageName='Заявка на подключение'>
            <Head>
                <title>Заявка на подключение</title>
                <meta name='robots' content='index, follow'/>
            </Head>
            <div className={classes.page}>
                {
                    !profile.role?
                        <CardConnectionApplications list={list} setList={setList}/>
                        :
                        null
                }
                {
                    list?list.map((element, idx)=> {
                            return(
                                <CardConnectionApplications key={element._id} idx={idx} element={element} list={list} setList={setList}/>
                            )}
                    ):null
                }
            </div>
            {
                profile.role==='admin'?
                    <div className='count'>
                        {`Всего: ${simpleStatistic}`}
                    </div>
                    :
                    !profile.role?
                        <div className={classes.scrollDown} onClick={() => {
                            setMiniDialog('Вход', <Sign isMobileApp={isMobileApp}/>)
                            showMiniDialog(true)
                        }}>
                            <div className={classes.scrollDownContainer}>
                                ВОЙТИ В ПРИЛОЖЕНИЕ
                                <div className={classes.scrollDownDiv}/>
                            </div>
                        </div>
                        :
                        null
            }
        </App>
    )
})

ConnectionApplications.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(ctx.store.getState().user.profile.role&&'admin'!==ctx.store.getState().user.profile.role)
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            connectionApplications: await getConnectionApplications({skip: 0, filter: ''}, getClientGqlSsr(ctx.req)),
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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionApplications);
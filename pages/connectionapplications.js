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
import {formatAmount, unawaited} from '../src/lib';
import {viewModes} from '../src/enum';
import Table from '../components/table/connectionapplications';

const filters = [{name: 'Все', value: ''}, {name: 'Обработка', value: 'обработка'}]

const ConnectionApplications = React.memo((props) => {
    const classes = pageListStyle();
    //ref
    const initialRender = useRef(true);
    const paginationWork = useRef(true);
    //props
    const {profile} = props.user;
    const {data} = props;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {filter, isMobileApp, viewMode} = props.app;
    //deps
    const deps = [filter]
    //listArgs
    const listArgs = {filter}
    //simpleStatistic
    let [simpleStatistic, setSimpleStatistic] = useState('');
    const getSimpleStatistic = async () => setSimpleStatistic(await getConnectionApplicationsSimpleStatistic(listArgs))
    //list
    let [list, setList] = useState(data.connectionApplications);
    const getList = async (skip) => {
        const gettedData = await getConnectionApplications({...listArgs, skip: skip||0})
        if(!skip) {
            unawaited(getSimpleStatistic)
            setList(gettedData)
            paginationWork.current = true;
            (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        }
        else if(gettedData.length) {
            setList(list => [...list, ...gettedData])
            paginationWork.current = true
        }
    }
    //pagination
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            await getList(list.length)
        }
    }, [list, ...deps])
    //filter
    useEffect(() => {
        if(initialRender.current) {
            initialRender.current = false;
            unawaited(getSimpleStatistic)
        }
        else
            unawaited(getList)
    }, deps)
    //render
    return (
        <App checkPagination={checkPagination} list={list} setList={setList} filters={'admin'===profile.role?filters:null} pageName='Заявка на подключение'>
            <Head>
                <title>Заявка на подключение</title>
                <meta name='robots' content='index, follow'/>
            </Head>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                {
                    !profile.role?
                        <CardConnectionApplications list={list} setList={setList}/>
                        :
                        null
                }
                {list?!profile.role||viewMode===viewModes.card?
                        list.map((element, idx) => {
                            return <CardConnectionApplications key={element._id} idx={idx} element={element} list={list} setList={setList}/>
                        })
                        :
                        <Table list={list}/>
                    :null}
            </div>
            {
                profile.role==='admin'?
                    <div className='count'>
                        Всего: {formatAmount(simpleStatistic)}
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
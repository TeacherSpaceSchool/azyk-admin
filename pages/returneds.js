import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../layouts/App';
import CardReturned from '../components/card/CardReturned'
import pageListStyle from '../src/styleMUI/returned/returnedList'
import {getReturneds} from '../src/gql/returned'
import { connect } from 'react-redux'
import Router from 'next/router'
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { getReturnedsSimpleStatistic } from '../src/gql/returned'
import * as mini_dialogActions from '../redux/actions/mini_dialog'
import { bindActionCreators } from 'redux'
import Link from 'next/link';
import {formatAmount, unawaited} from '../src/lib';
import {viewModes} from '../src/enum';
import Table from '../components/table/returneds';

const Returneds = React.memo((props) => {
    const classes = pageListStyle();
    //ref
    const paginationWork = useRef(true);
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    //props
    const {data} = props;
    const {search, sort, date, city, viewMode} = props.app;
    const {profile} = props.user;
    //deps
    const deps = [sort, date, city]
    //listArgs
    const listArgs = {search, date, city}
    //simpleStatistic
    let [simpleStatistic, setSimpleStatistic] = useState(['0']);
    const getSimpleStatistic = async () => setSimpleStatistic(await getReturnedsSimpleStatistic(listArgs))
    //list
    let [list, setList] = useState(data.returneds);
    const getList = async (skip) => {
        const gettedData = await getReturneds({...listArgs, sort, skip: skip||0})
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
    }, [list, search, ...deps])
    //filter
    useEffect(() => {
        if(!initialRender.current)
            unawaited(getList)
    }, deps)
    useEffect(() => {
        (async () => {
            if(initialRender.current) {
                initialRender.current = false;
                unawaited(getSimpleStatistic)
            } else {
                if(searchTimeOut.current)
                    clearTimeout(searchTimeOut.current)
                searchTimeOut.current = setTimeout(() => unawaited(getList), 500)
        }})()
    }, [search])
    let [showStat, setShowStat] = useState(false);
    //render
    return (
        <App cityShow checkPagination={checkPagination} list={list} setList={setList} searchShow dates pageName='Возвраты'>
            <Head>
                <title>Возвраты</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count' onClick={() =>setShowStat(!showStat)}>
                        Возвратов: {formatAmount(simpleStatistic[0])}
                        {
                            showStat?
                                <>
                                <br/>
                                {`Сумма: ${formatAmount(simpleStatistic[1])} сом`}
                                <br/>
                                {`Тоннаж: ${formatAmount(simpleStatistic[2])} кг`}
                                </>
                                :
                                null
                        }
                    </div>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                {list?viewMode===viewModes.card?
                    list.map((element, idx) => <CardReturned key={element._id} idx={idx} list={list} setList={setList} element={element}/>)
                    :
                    <Table list={list} setList={setList}/>
                :null}
            </div>
            {['суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент'].includes(profile.role)?<Link href='/returned/new'>
                <Fab color='primary' className={classes.fab}>
                    <AddIcon />
                </Fab>
            </Link>:null}
        </App>
    )
})

Returneds.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    ctx.store.getState().app.sort = '-createdAt'
    return {
        data: {
            returneds: await getReturneds({city: ctx.store.getState().app.city, search: '', sort: '-createdAt', date: '', skip: 0}, getClientGqlSsr(ctx.req))
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

export default connect(mapStateToProps, mapDispatchToProps)(Returneds);
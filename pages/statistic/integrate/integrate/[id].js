import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../../../layouts/App';
import { connect } from 'react-redux'
import { getOrganization } from '../../../../src/gql/organization'
import { getIntegrate1Cs, getIntegrate1CsSimpleStatistic } from '../../../../src/gql/integrate1C'
import pageListStyle from '../../../../src/styleMUI/organization/orgaizationsList'
import CardIntegrate from '../../../../components/card/CardIntegrate'
import { useRouter } from 'next/router'
import { getClientGqlSsr } from '../../../../src/getClientGQL'
import initialApp from '../../../../src/initialApp'
import Router from 'next/router'
import * as appActions from '../../../../redux/actions/app'
import {bindActionCreators} from 'redux';
import {formatAmount, isNotEmpty, unawaited} from '../../../../src/lib';
import {viewModes} from '../../../../src/enum';
import Table from '../../../../components/table/integrate';

const filters = [{name: 'Все', value: ''}, {name: 'Агент', value: 'агент'}, {name: 'Экспедитор', value: 'экспедитор'}, {name: 'Товар', value: 'товар'}, {name: 'Клиент', value: 'клиент'}, {name: 'Супервайзер', value: 'менеджер'}]

const Integrate = React.memo((props) => {
    const classes = pageListStyle();
    const router = useRouter()
    //props
    const {data} = props;
    const {showLoad} = props.appActions;
    const {search, filter, viewMode} = props.app;
    //ref
    const initialRender = useRef(true);
    const searchTimeOut = useRef(null);
    const paginationWork = useRef(true);
    //deps
    const deps = [filter]
    //listArgs
    const listArgs = {filter, organization: router.query.id}
    //simpleStatistic
    let [showStat, setShowStat] = useState(false);
    let [simpleStatistic, setSimpleStatistic] = useState(null);
    const getSimpleStatistic = async () => {setSimpleStatistic(await getIntegrate1CsSimpleStatistic({search, ...listArgs}))}
    //list
    let [list, setList] = useState(data.integrate1Cs);
    const getList = async (skip) => {
        showLoad(true)
        const gettedData = await getIntegrate1Cs({...listArgs, search, skip: 0})
        showLoad(false)
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
    //filter
    useEffect(() => {
        if(!initialRender.current)
            unawaited(getList)
    }, deps)
    //search
    useEffect(() => {
        if(initialRender.current) {
            initialRender.current = false;
            unawaited(getSimpleStatistic)
        }
        else {
            if(searchTimeOut.current)
                clearTimeout(searchTimeOut.current)
            searchTimeOut.current = setTimeout(() => unawaited(getList), 500)
        }
    }, [search])
    //pagination
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            await getList(list.length)
        }
    }, [search, list, ...deps])
    //render
    return (
        <App checkPagination={checkPagination} searchShow filters={filters} pageName={data.organization?data.organization.name:'AZYK.STORE'}>
            <Head>
                <title>{data.organization?data.organization.name:'AZYK.STORE'}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                {list?viewMode===viewModes.card?
                    <>
                        <CardIntegrate setSimpleStatistic={setSimpleStatistic} organization={router.query.id} list={list} setList={setList}/>
                        {list.map((element, idx) => {
                            return <CardIntegrate setSimpleStatistic={setSimpleStatistic} key={element._id} idx={idx} element={element} organization={router.query.id} list={list} setList={setList}/>
                        })}
                        </>
                        :
                        <Table list={list}/>
                    :null}
                {
                    simpleStatistic?
                        <div className='count' onClick={() =>setShowStat(!showStat)}>
                            Всего: {formatAmount(simpleStatistic[0])}
                            {
                                showStat?
                                    <>
                                        {isNotEmpty(simpleStatistic[1])?<>
                                            <br/>
                                            Осталось агентов: {formatAmount(simpleStatistic[1])}
                                        </>:null}
                                        {isNotEmpty(simpleStatistic[2])?<>
                                            <br/>
                                            Осталось экспедиторов: {formatAmount(simpleStatistic[2])}
                                        </>:null}
                                        {isNotEmpty(simpleStatistic[3])?<>
                                            <br/>
                                            Осталось товаров: {formatAmount(simpleStatistic[3])}
                                        </>:null}
                                        {isNotEmpty(simpleStatistic[4])?<>
                                            <br/>
                                            Осталось клиентов: {formatAmount(simpleStatistic[4])}
                                        </>:null}
                                    </>
                                    :
                                    null
                            }
                        </div>
                        :
                        null
                }
            </div>
        </App>
    )
})

Integrate.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    // eslint-disable-next-line no-undef
    const [integrate1Cs, organization] = await Promise.all([
        getIntegrate1Cs({search: '', filter: '', skip: 0, organization: ctx.query.id}, getClientGqlSsr(ctx.req)),
        getOrganization(ctx.query.id, getClientGqlSsr(ctx.req))
    ])
    return {
        data: {
            integrate1Cs, organization
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
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Integrate);
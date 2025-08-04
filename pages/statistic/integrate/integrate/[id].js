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
import {isNotEmpty, unawaited} from '../../../../src/lib';

const filters = [{name: 'Все', value: ''}, {name: 'Агент', value: 'агент'}, {name: 'Экспедитор', value: 'экспедитор'}, {name: 'Товар', value: 'товар'}, {name: 'Клиент', value: 'клиент'}, {name: 'Менеджер', value: 'менеджер'}]

const Integrate = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    const router = useRouter()
    const initialRender = useRef(true);
    const {showLoad} = props.appActions;
    let [list, setList] = useState(data.integrate1Cs);
    let [simpleStatistic, setSimpleStatistic] = useState(null);
    const getSimpleStatistic = async () => setSimpleStatistic(await getIntegrate1CsSimpleStatistic({search, filter, organization: router.query.id}))
    const {search, filter} = props.app;
    let [showStat, setShowStat] = useState(false);
    const searchTimeOut = useRef(null);
    const paginationWork = useRef(true);
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            let addedList = await getIntegrate1Cs({search, filter, skip: list.length, organization: router.query.id})
            if(addedList.length) {
                setList([...list, ...addedList])
                paginationWork.current = true
            }
        }
    }, [search, filter, list])
    const getList = async () => {
        showLoad(true)
        setList(await getIntegrate1Cs({search, filter, skip: 0, organization: router.query.id}))
        showLoad(false)

        paginationWork.current = true;
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(() => {
        if(!initialRender.current) {
            if(searchTimeOut.current)
                clearTimeout(searchTimeOut.current)
            searchTimeOut.current = setTimeout(() => unawaited(getList), 500)
        }
    }, [search])
    useEffect(() => {
        if(initialRender.current)
            initialRender.current = false;
        else
            unawaited(getList)
        unawaited(getSimpleStatistic)
    }, [filter])
    return (
        <App checkPagination={checkPagination} searchShow filters={filters} pageName={data.organization?data.organization.name:'AZYK.STORE'}>
            <Head>
                <title>{data.organization?data.organization.name:'AZYK.STORE'}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                {
                    simpleStatistic?
                        <div className='count' onClick={()=>setShowStat(!showStat)}>
                            {`Всего: ${simpleStatistic[0]}`}
                            {
                                showStat?
                                    <>
                                        {isNotEmpty(simpleStatistic[1])?<>
                                            <br/>
                                            {`Осталось агентов: ${simpleStatistic[1]}`}
                                        </>:null}
                                        {isNotEmpty(simpleStatistic[2])?<>
                                            <br/>
                                            {`Осталось экспедиторов: ${simpleStatistic[2]}`}
                                        </>:null}
                                        {isNotEmpty(simpleStatistic[3])?<>
                                            <br/>
                                            {`Осталось товаров: ${simpleStatistic[3]}`}
                                        </>:null}
                                        {isNotEmpty(simpleStatistic[4])?<>
                                            <br/>
                                            {`Осталось клиентов: ${simpleStatistic[4]}`}
                                        </>:null}
                                    </>
                                    :
                                    null
                            }
                        </div>
                        :
                        null
                }
                <CardIntegrate setSimpleStatistic={setSimpleStatistic} organization={router.query.id} list={list} setList={setList}/>
                {
                    list?list.map((element, idx)=> {

                        return(
                            <CardIntegrate setSimpleStatistic={setSimpleStatistic} key={element._id} idx={idx} element={element} organization={router.query.id} list={list} setList={setList}/>
                        )}
                    ):null
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
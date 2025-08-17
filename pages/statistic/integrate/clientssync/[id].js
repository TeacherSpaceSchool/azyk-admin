import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../../../layouts/App';
import { connect } from 'react-redux'
import { getClientsSync, getClientsSyncStatistic, clearClientsSync } from '../../../../src/gql/client'
import { getOrganization } from '../../../../src/gql/organization'
import pageListStyle from '../../../../src/styleMUI/client/clientList'
import CardClient from '../../../../components/card/CardClient'
import { useRouter } from 'next/router'
import { getClientGqlSsr } from '../../../../src/getClientGQL'
import initialApp from '../../../../src/initialApp'
import Router from 'next/router'
import Fab from '@material-ui/core/Fab';
import RemoveIcon from '@material-ui/icons/Clear';
import Confirmation from '../../../../components/dialog/Confirmation'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../../../redux/actions/mini_dialog'
import {formatAmount} from '../../../../src/lib';

const ClientsSync = React.memo((props) => {
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const classes = pageListStyle();
    const {data} = props;
    const router = useRouter()
    let [list, setList] = useState(data.clientsSync);
    const {search, city} = props.app;
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    const paginationWork = useRef(true);
    let [simpleStatistic, setSimpleStatistic] = useState(data.clientsSyncStatistic);
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            let addedList = await getClientsSync({search, organization: router.query.id, skip: list.length, city})
            if(addedList.length) {
                setList([...list, ...addedList])
                paginationWork.current = true
            }
        }
    }, [search, list, city])
    useEffect(() => {
        if(!initialRender.current) {
            initialRender.current = false
        }
        else {
            if(searchTimeOut.current)
                clearTimeout(searchTimeOut.current)
            searchTimeOut.current = setTimeout(async () => {
                // eslint-disable-next-line no-undef
                const [clientsSync, clientsSyncStatistic] = await Promise.all([
                    getClientsSync({search, organization: router.query.id, skip: 0, city}),
                    getClientsSyncStatistic({search, organization: router.query.id, city})
                ])
                setList(clientsSync)
                setSimpleStatistic(clientsSyncStatistic)
                paginationWork.current = true;
                (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
            }, 500)
        }
    }, [search, city])
    return (
        <App cityShow checkPagination={checkPagination} searchShow pageName={data.organization.name}>
            <Head>
                <title>{data.organization.name}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                <div className='count'>
                    Интеграций: {formatAmount(simpleStatistic)}
                </div>
                {
                    list?list.map((element  ) => {
                            return(
                                <CardClient element={element}/>
                            )}
                    ):null
                }
            </div>
            <Fab onClick={() => {
                const action = async () => {
                    await clearClientsSync(router.query.id)
                    setList([])
                }
                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                showMiniDialog(true)
            }} color='primary' className={classes.fab}>
                <RemoveIcon />
            </Fab>
        </App>
    )
})

ClientsSync.getInitialProps = async function(ctx) {
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
    const [clientsSync, clientsSyncStatistic, organization] = await Promise.all([
        getClientsSync({search: '', organization: ctx.query.id, skip: 0}, getClientGqlSsr(ctx.req)),
        getClientsSyncStatistic({search: '', organization: ctx.query.id}, getClientGqlSsr(ctx.req)),
        getOrganization(ctx.query.id, getClientGqlSsr(ctx.req))
    ])
    return {
        data: {
            clientsSync,
            clientsSyncStatistic,
            organization,
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

export default connect(mapStateToProps, mapDispatchToProps)(ClientsSync);
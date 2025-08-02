import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import {getPlanClients, getPlanClientsCount} from '../../src/gql/planClient'
import {getOrganization} from '../../src/gql/organization';
import pageListStyle from '../../src/styleMUI/subbrand/subbrandList'
import CardPlanClient from '../../components/card/CardPlanClient'
import { useRouter } from 'next/router'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import Router from 'next/router'
import Fab from '@material-ui/core/Fab';
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import {bindActionCreators} from 'redux';
import SettingsIcon from '@material-ui/icons/Settings';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {unawaited} from '../../src/lib';

const Plan = React.memo((props) => {
    const classes = pageListStyle();
    const {profile} = props.user;
    const {data} = props;
    const router = useRouter()
    const initialRender = useRef(true);
    let [list, setList] = useState(data.planClients);
    let [count, setCount] = useState(data.planClientsCount);
    const {search, city, district} = props.app;
    const searchTimeOut = useRef(null);
    const paginationWork = useRef(true);
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            let addedList = await getPlanClients({search, skip: list.length, city, organization: router.query.id, ...district?{district}:{}})
            if(addedList.length) {
                setList([...list, ...addedList])
                paginationWork.current = true
            }
        }
    }, [search, list, city, district])
    const getList = async () => {
        // eslint-disable-next-line no-undef
        const [planClients, planClientsCount] = await Promise.all([
            getPlanClients({search, skip: 0, city, organization: router.query.id, ...district?{district}:{}}),
            getPlanClientsCount({search, skip: 0, city, organization: router.query.id, ...district?{district}:{}})
        ])
        setList(planClients)
        setCount(planClientsCount)
        paginationWork.current = true;
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(() => {
        if(!initialRender.current) unawaited(getList)
    }, [city, district])
    useEffect(() => {
        if(initialRender.current)
            initialRender.current = false;
        else {
            if(searchTimeOut.current)
                clearTimeout(searchTimeOut.current)
            searchTimeOut.current = setTimeout(() => unawaited(getList), 500)
        }
    }, [search])
    let [anchorEl, setAnchorEl] = useState(null);
    let open = event => setAnchorEl(event.currentTarget);
    let close = () => setAnchorEl(null);
    return (
        <App checkPagination={checkPagination} showDistrict searchShow pageName={data.organization.name}>
            <Head>
                <title>{data.organization.name}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                <div className='count'>
                    Всего: {count}
                </div>
                {['суперорганизация', 'организация', 'менеджер', 'admin'].includes(profile.role)?<>
                    <CardPlanClient
                        list={list} setList={setList} setCount={setCount}
                        organization={data.organization} district={district}
                    />
                    <Fab onClick={open} color='primary' className={classes.fab}>
                        <SettingsIcon />
                    </Fab>
                    <Menu
                        id='simple-menu'
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={close}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                    >
                        <MenuItem onClick={() => {
                            close()
                            Router.push('/statistic/load/unloadplanclients')
                        }}>
                            Выгрузить
                        </MenuItem>
                        <MenuItem onClick={() => {
                            close()
                            Router.push('/statistic/load/uploadingplanclients')
                        }}>
                            Загрузить
                        </MenuItem>
                    </Menu>
                </>:null}
                {
                    list?list.map((element, idx)=> {
                        return <CardPlanClient
                            key={element._id} list={list} setList={setList} setCount={setCount} organization={data.organization} idx={idx} element={element}
                        />
                    }):null
                }
            </div>
        </App>
    )
})

Plan.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['суперорганизация', 'организация', 'менеджер', 'агент', 'admin'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    ctx.store.getState().app.organization = ctx.query.id
    // eslint-disable-next-line no-undef
    const [organization, planClients, planClientsCount] = await Promise.all([
        getOrganization(ctx.query.id, getClientGqlSsr(ctx.req)),
        getPlanClients({organization: ctx.query.id, search: '', skip: 0}, getClientGqlSsr(ctx.req)),
        getPlanClientsCount({organization: ctx.query.id, search: '', skip: 0}, getClientGqlSsr(ctx.req))
    ])
    return {
        data: {
            organization,
            planClients,
            planClientsCount
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

export default connect(mapStateToProps, mapDispatchToProps)(Plan);
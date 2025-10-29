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
import {formatAmount, unawaited} from '../../src/lib';
import {viewModes} from '../../src/enum';
import Table from '../../components/table/planClients';

const Plan = React.memo((props) => {
    const classes = pageListStyle();
    const router = useRouter()
    //props
    const {profile} = props.user;
    const {data} = props;
    const {search, city, district, viewMode} = props.app;
    //ref
    const initialRender = useRef(true);
    const searchTimeOut = useRef(null);
    const paginationWork = useRef(true);
    //deps
    const deps = [city, district]
    //listArgs
    const listArgs = {search, city, organization: router.query.id, ...district?{district}:{}}
    //count
    let [count, setCount] = useState('');
    const getCount = async () => setCount(await getPlanClientsCount(listArgs))
    //list
    let [list, setList] = useState(data.planClients);
    const getList = async (skip) => {
        const gettedData = await getPlanClients({...listArgs, skip: skip||0})
        if(!skip) {
            unawaited(getCount)
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
    }, [search, list, ...deps])
    //filter
    useEffect(() => {
        if(!initialRender.current) unawaited(getList)
    }, deps)
    //search
    useEffect(() => {
        if(initialRender.current) {
            initialRender.current = false;
            unawaited(getCount)
        }
        else {
            if(searchTimeOut.current)
                clearTimeout(searchTimeOut.current)
            searchTimeOut.current = setTimeout(() => unawaited(getList), 500)
        }
    }, [search])
    //fab
    let [anchorEl, setAnchorEl] = useState(null);
    let open = event => setAnchorEl(event.currentTarget);
    let close = () => setAnchorEl(null);
    //render
    return (
        <App checkPagination={checkPagination} showDistrict searchShow pageName={data.organization.name}>
            <Head>
                <title>{data.organization.name}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
            <div className='count'>
                    Всего: {formatAmount(count)}
                </div>
                {list?viewMode===viewModes.card?
                        <>
                            {['суперорганизация', 'организация', 'менеджер', 'admin'].includes(profile.role)?<CardPlanClient
                                list={list} setList={setList} setCount={setCount}
                                organization={data.organization} district={district}
                            />:null}
                            {list.map((element, idx) => <CardPlanClient
                                key={element._id} list={list} setList={setList} setCount={setCount} organization={data.organization} idx={idx} element={element}/>
                            )}
                        </>
                        :
                        <Table list={list}/>
                    :null}
                {['суперорганизация', 'организация', 'менеджер', 'admin'].includes(profile.role)?<>
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
                            Router.push('/statistic/uploaddownload/downloadplanclients')
                        }}>
                            Выгрузить
                        </MenuItem>
                        <MenuItem onClick={() => {
                            close()
                            Router.push('/statistic/uploaddownload/uploadplanclients')
                        }}>
                            Загрузить
                        </MenuItem>
                    </Menu>
                </>:null}
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
    const [organization, planClients] = await Promise.all([
        getOrganization(ctx.query.id, getClientGqlSsr(ctx.req)),
        getPlanClients({organization: ctx.query.id, search: '', skip: 0}, getClientGqlSsr(ctx.req))
    ])
    return {
        data: {
            organization,
            planClients
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
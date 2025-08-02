import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import {getEquipments, getEquipmentsCount} from '../../src/gql/equipment'
import pageListStyle from '../../src/styleMUI/equipment/equipmentList'
import CardEquipment from '../../components/card/CardEquipment'
import { getClientGqlSsr } from '../../src/getClientGQL'
import Router from 'next/router'
import initialApp from '../../src/initialApp'
import { useRouter } from 'next/router'
import {getAgents} from '../../src/gql/employment';
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {unawaited} from '../../src/lib';
import {getOrganization} from '../../src/gql/organization';

const Equipments = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    let [list, setList] = useState(data.equipments);
    let [count, setCount] = useState(data.equipmentsCount);
    const {search, agent} = props.app;
    const router = useRouter()
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    const getList = async () => {
        // eslint-disable-next-line no-undef
        const [equipments, equipmentsCount] = await Promise.all([
            getEquipments({organization: router.query.id, search, skip: 0}),
            getEquipmentsCount({organization: router.query.id, search})
        ])
        setList(equipments);
        setCount(equipmentsCount);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        paginationWork.current = true;
    }
    useEffect(() => {
        if(!initialRender.current)
            unawaited(getList)
    }, [agent])
    useEffect(() => {
            if(initialRender.current) 
                initialRender.current = false;
            else {
                if(searchTimeOut.current)
                    clearTimeout(searchTimeOut.current)
                searchTimeOut.current = setTimeout(() => unawaited(getList), 500)
            }
    }, [search])
    const paginationWork = useRef(true);
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            let addedList = await getEquipments({organization: router.query.id, search, skip: list.length})
            if(addedList.length) {
                setList([...list, ...addedList])
                paginationWork.current = true
            }
        }
    }, [search, list])
    let [anchorEl, setAnchorEl] = useState(null);
    let open = event => setAnchorEl(event.currentTarget);
    let close = () => setAnchorEl(null);
    return (
        <App checkPagination={checkPagination} searchShow pageName='Оборудование' agents>
            <Head>
                <title>Оборудование</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                {`Всего: ${count}`}
            </div>
            <div className={classes.page}>
                <CardEquipment organization={data.organization} list={list} setList={setList} agents={data.agents}/>
                {list?list.map((element, idx)=> {
                    return <CardEquipment organization={data.organization} idx={idx} key={element._id} list={list} setList={setList} element={element} agents={data.agents}/>
                }):null}
            </div>
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
                    Router.push('/statistic/load/unloadingequipments')
                }}>
                    Выгрузить
                </MenuItem>
            </Menu>
        </App>
    )
})

Equipments.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!(['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'ремонтник'].includes(ctx.store.getState().user.profile.role)))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    ctx.store.getState().app.organization = ctx.query.id
    // eslint-disable-next-line no-undef
    const [organization, equipments, equipmentsCount, agents] = await Promise.all([
        getOrganization(ctx.query.id, getClientGqlSsr(ctx.req)),
        getEquipments({organization: ctx.query.id, search: '', skip: 0}, getClientGqlSsr(ctx.req)),
        getEquipmentsCount({organization: ctx.query.id, search: ''}, getClientGqlSsr(ctx.req)),
        getAgents(ctx.query.id, getClientGqlSsr(ctx.req))
    ])
    return {
        data: {
            organization,
            equipments,
            equipmentsCount,
            agents
        }
    };
};

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app,
    }
}

export default connect(mapStateToProps)(Equipments);
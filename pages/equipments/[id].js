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
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {formatAmount, unawaited} from '../../src/lib';
import {getOrganization} from '../../src/gql/organization';
import {viewModes} from '../../src/enum';
import Table from '../../components/table/equipments';

const Equipments = React.memo((props) => {
    const classes = pageListStyle();
    const router = useRouter()
    //props
    const {data} = props;
    const {search, agent, viewMode} = props.app;
    //ref
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    const paginationWork = useRef(true);
    //deps
    const deps = [agent]
    //listArgs
    const listArgs = {organization: router.query.id, search, ...agent?{agent}:{}}
    //count
    let [count, setCount] = useState('');
    const getCount = async () => setCount(await getEquipmentsCount(listArgs))
    //list
    let [list, setList] = useState(data.equipments);
    const getList = async (skip) => {
        const equipments = await getEquipments({...listArgs, skip: skip||0});
        if(!skip) {
            unawaited(getCount)
            setList(equipments)
            paginationWork.current = true;
            (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        }
        else if(list.length) {
            setList(list => [...list, ...equipments])
            paginationWork.current = true
        }
    }
    //filter
    useEffect(() => {
        if(!initialRender.current)
            unawaited(getList)
    }, deps)
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
    //pagination
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            await getList(list.length)
        }
    }, [search, list, ...deps])
    //fab
    let [anchorEl, setAnchorEl] = useState(null);
    let open = event => setAnchorEl(event.currentTarget);
    let close = () => setAnchorEl(null);
    //render
    return (
        <App checkPagination={checkPagination} searchShow pageName='Оборудование' agents>
            <Head>
                <title>Оборудование</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                Всего: {formatAmount(count)}
            </div>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                {list?viewMode===viewModes.card?
                        <>
                            <CardEquipment organization={data.organization} list={list} setList={setList} agents={data.agents}/>
                            {list.map((element, idx) => <CardEquipment
                                organization={data.organization} idx={idx} key={element._id} list={list} setList={setList} element={element} agents={data.agents}
                            />)}
                        </>
                        :
                        <Table list={list}/>
                :null}
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
                    Router.push('/statistic/uploaddownload/downloadequipments')
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
    const [organization, equipments, agents] = await Promise.all([
        getOrganization(ctx.query.id, getClientGqlSsr(ctx.req)),
        getEquipments({organization: ctx.query.id, search: '', skip: 0}, getClientGqlSsr(ctx.req)),
        getEquipments({organization: ctx.query.id, search: '', filter: 'агент'}, getClientGqlSsr(ctx.req))
    ])
    return {
        data: {
            organization,
            equipments,
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
import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import { getEquipments } from '../../src/gql/equipment'
import pageListStyle from '../../src/styleMUI/equipment/equipmentList'
import CardEquipment from '../../components/equipment/CardEquipment'
import { getClientGqlSsr } from '../../src/getClientGQL'
import Router from 'next/router'
import initialApp from '../../src/initialApp'
import { useRouter } from 'next/router'
import {getAgents} from '../../src/gql/employment';
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

const Equipments = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    let [list, setList] = useState(data.equipments);
    const { search, agent } = props.app;
    const router = useRouter()
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    const initialRender = useRef(true);
    const getList = async ()=>{
        setList((await getEquipments({organization: router.query.id, search, agent})).equipments)
        setPagination(100);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(()=>{
        (async()=>{
            if(!initialRender.current) {
                await getList()
            }
        })()
    },[agent])
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            } else {
                if(searchTimeOut)
                    clearTimeout(searchTimeOut)
                searchTimeOut = setTimeout(async()=>{
                    await getList()
                }, 500)
                setSearchTimeOut(searchTimeOut)

            }
        })()
    },[search])
    let [pagination, setPagination] = useState(100);
    const checkPagination = ()=>{
        if(pagination<list.length){
            setPagination(pagination+100)
        }
    }
    let [anchorEl, setAnchorEl] = useState(null);
    let open = event => {
        setAnchorEl(event.currentTarget);
    };
    let close = () => {
        setAnchorEl(null);
    };
    return (
        <App checkPagination={checkPagination} searchShow={true} pageName='Оборудование' agents>
            <Head>
                <title>Оборудование</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                {`Всего: ${list.length}`}
            </div>
            <div className={classes.page}>
                <CardEquipment list={list} setList={setList} agents={data.agents}/>
                {list?list.map((element, idx)=> {
                    if(idx<pagination)
                        return(
                            <CardEquipment list={list} idx={idx} key={element._id} setList={setList} element={element} agents={data.agents}/>
                        )}
                ):null}
            </div>
            <Fab onClick={open} color='primary' aria-controls="simple-menu" aria-haspopup="true" className={classes.fab}>
                <SettingsIcon />
            </Fab>
            <Menu
                id="simple-menu"
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
                <MenuItem onClick={()=>{
                    close()
                    Router.push('/statistic/unloadingequipments')
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
    return {
        data: {
            ...await getEquipments({organization: ctx.query.id, search: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
            ...await getAgents({_id: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined)
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
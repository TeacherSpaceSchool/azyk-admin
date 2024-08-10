import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import {getPlanClients, getPlanClientsCount} from '../../src/gql/planClient'
import {getOrganization} from '../../src/gql/organization';
import pageListStyle from '../../src/styleMUI/subcategory/subcategoryList'
import CardPlanClient from '../../components/planClient/CardPlanClient'
import { useRouter } from 'next/router'
import { urlMain } from '../../redux/constants/other'
import { forceCheck } from 'react-lazyload';
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import Router from 'next/router'
import Fab from '@material-ui/core/Fab';
import GroupIcon from '@material-ui/icons/Group';
import SetDistrict from '../../components/dialog/SetDistrict';
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import {bindActionCreators} from 'redux';
import {getDistricts} from '../../src/gql/district';
import RemoveIcon from '@material-ui/icons/Clear';
import Tooltip from '@material-ui/core/Tooltip';
import SettingsIcon from "@material-ui/icons/Settings";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

const Plan = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    const { profile } = props.user;
    const router = useRouter()
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    let [list, setList] = useState(data.planClients);
    let [count, setCount] = useState(data.planClientsCount);
    const { search, city, district } = props.app;
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    let [paginationWork, setPaginationWork] = useState(true);
    const checkPagination = async()=>{
        if(paginationWork){
            let addedList = (await getPlanClients({search, skip: list.length, city: city, organization: router.query.id, ...district?{district}:{}})).planClients
            if(addedList.length>0){
                setList([...list, ...addedList])
            }
            else
                setPaginationWork(false)
        }
    }
    const getList = async()=>{
        setList((await getPlanClients({search, skip: 0, city: city, organization: router.query.id, ...district?{district}:{}})).planClients)
        setCount((await getPlanClientsCount({search, skip: 0, city: city, organization: router.query.id, ...district?{district}:{}})).planClientsCount)
        setPaginationWork(true);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        forceCheck()
    }
    useEffect(()=>{
        if(searchTimeOut)
            clearTimeout(searchTimeOut)
        searchTimeOut = setTimeout(async()=>{
            await getList()
        }, 500)
        setSearchTimeOut(searchTimeOut)
    },[search, city, district])
    let [anchorEl, setAnchorEl] = useState(null);
    let open = event => {
        setAnchorEl(event.currentTarget);
    };
    let close = () => {
        setAnchorEl(null);
    };
    return (
        <App checkPagination={checkPagination} cityShow showDistrict cities={data.organization.cities} searchShow={true} pageName={data.organization.name}>
            <Head>
                <title>{data.organization.name}</title>
                <meta name='description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:title' content={data.organization.name} />
                <meta property='og:description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:type' content='website' />
                <meta property='og:image' content={`${urlMain}/static/512x512.png`} />
                <meta property='og:url' content={`${urlMain}/statistic/planClients/${router.query.id}`} />
                <link rel='canonical' href={`${urlMain}/statistic/planClients/${router.query.id}`}/>
            </Head>
            <div className={classes.page}>
                <div className='count'>
                    Всего: {count}
                </div>
                <CardPlanClient
                    list={list} setList={setList}
                    count={count} setCount={setCount}
                    organization={router.query.id} district={district}
                />
                {
                    list?list.map((element, idx)=> {
                            return(
                                    <CardPlanClient
                                        key={element._id}
                                        list={list} setList={setList}
                                        count={count} setCount={setCount}
                                        organization={router.query.id} idx={idx} element={element}
                                    />
                            )}
                    ):null
                }
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
                    Router.push('/statistic/unloadplanclients')
                }}>
                    Выгрузить
                </MenuItem>
                <MenuItem onClick={()=>{
                    close()
                    Router.push('/statistic/uploadingplanclients')
                }}>
                    Загрузить
                </MenuItem>
            </Menu>
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
    return {
        data: {
            ...(await getOrganization({_id: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):null)),
            ...(await getPlanClients({organization: ctx.query.id, search: '', skip: 0}, ctx.req?await getClientGqlSsr(ctx.req):null)),
            ...(await getPlanClientsCount({organization: ctx.query.id, search: '', skip: 0}, ctx.req?await getClientGqlSsr(ctx.req):null)),
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
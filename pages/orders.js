import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../layouts/App';
import CardOrder from '../components/order/CardOrder'
import pageListStyle from '../src/styleMUI/orders/orderList'
import {getOrders} from '../src/gql/order'
import { connect } from 'react-redux'
import Router from 'next/router'
import { urlMain } from '../redux/constants/other'
import LazyLoad from 'react-lazyload';
import { forceCheck } from 'react-lazyload';
import CardOrderPlaceholder from '../components/order/CardOrderPlaceholder'
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import ClickNHold from 'react-click-n-hold';
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Confirmation from '../components/dialog/Confirmation'
import { deleteOrders, getInvoicesSimpleStatistic, acceptOrders } from '../src/gql/order'
import * as mini_dialogActions from '../redux/actions/mini_dialog'
import * as appActions from '../redux/actions/app'
import { bindActionCreators } from 'redux'
import Badge from '@material-ui/core/Badge';
import CircularProgress from '@material-ui/core/CircularProgress';
const height = 225


const Orders = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    const initialRender = useRef(true);
    let [simpleStatistic, setSimpleStatistic] = useState(['0']);
    let [list, setList] = useState(data.invoices);
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    const { showLoad } = props.appActions;
    const { search, filter, sort, date, organization, city } = props.app;
    const { profile } = props.user;
    let numberSearch = useRef(0);
    let paginationWork = useRef(true);
    const checkPagination = async()=>{
        if(paginationWork.current){
            let addedList = (await getOrders({search, sort, filter: filter, date: date, skip: list.length, organization: organization, city: city})).invoices
            if(addedList.length>0){
                setList([...list, ...addedList])
            }
            else
                paginationWork.current = false
        }
    }
    const getList = async (_numberSearch)=>{
        setSelected([])
        let list = (await getOrders({search, sort, filter: filter, date: date, skip: 0, organization: organization, city: city})).invoices
        let simpleStatistic = (await getInvoicesSimpleStatistic({search, filter: filter, date: date, organization: organization, city: city})).invoicesSimpleStatistic
        if(!_numberSearch||_numberSearch===numberSearch.current) {
            setList(list)
            setSimpleStatistic(simpleStatistic);
            (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant'});
            forceCheck()
            paginationWork.current = true
        }
     }
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    useEffect(()=>{
        (async ()=>{
            if(!initialRender.current) {
                showLoad(true)
                await getList()
                showLoad(false)
            }
        })()
    },[filter, sort, date, organization, city])
    useEffect(()=>{
        (async ()=>{
            if(initialRender.current) {
                initialRender.current = false;
                setSimpleStatistic((await getInvoicesSimpleStatistic({search, filter: filter, date: date, organization: organization, city: city})).invoicesSimpleStatistic)
            } else {
                if(searchTimeOut)
                    clearTimeout(searchTimeOut)
                searchTimeOut = setTimeout(async()=>{
                    numberSearch.current += 1
                    await getList(numberSearch.current)
                    setSearchTimeOut(null)
                }, 500)
                setSearchTimeOut(searchTimeOut)
            }
        })()
    },[search])
    let [showStat, setShowStat] = useState(false);
    let [selected, setSelected] = useState([]);
    let [anchorEl, setAnchorEl] = useState(null);
    let open = event => {
        setAnchorEl(event.currentTarget);
    };
    let close = () => {
        setAnchorEl(null);
    };
    return (
        <App organizations cityShow checkPagination={checkPagination} setList={setList} list={list} searchShow={true} dates={true} filters={data.filterInvoice} sorts={data.sortInvoice} pageName='Заказы'>
            <Head>
                <title>Заказы</title>
                <meta name='description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:title' content='Заказы' />
                <meta property='og:description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:type' content='website' />
                <meta property='og:image' content={`${urlMain}/static/512x512.png`} />
                <meta property='og:url' content={`${urlMain}/orders`} />
                <link rel='canonical' href={`${urlMain}/orders`}/>
            </Head>
            <div className='count' onClick={()=>setShowStat(!showStat)}>
                        {
                            `Заказов: ${simpleStatistic[0]}`
                        }
                        {
                            showStat?
                                <>
                                <br/>
                                {simpleStatistic[1]&&simpleStatistic[1]!=='0'?`Сумма: ${simpleStatistic[1]} сом`:null}
                                {
                                    simpleStatistic[2]&&simpleStatistic[2]!=='0'?
                                        <>
                                        <br/>
                                        {`Консигнаций: ${simpleStatistic[2]} сом`}
                                        <br/>
                                        {`Оплачено консигнаций: ${simpleStatistic[3]} сом`}
                                        </>
                                        :
                                        null
                                }
                                {
                                    simpleStatistic[4]&&simpleStatistic[4]!=='0'?
                                        <>
                                        <br/>
                                        {`Тоннаж: ${simpleStatistic[4]} кг`}
                                        </>
                                        :
                                        null
                                }
                                {
                                    simpleStatistic[5]&&simpleStatistic[5]!=='0'?
                                        <>
                                        <br/>
                                        {`Кубатура: ${simpleStatistic[5]} см³`}
                                        </>
                                        :
                                        null
                                }
                                </>
                                :
                                null
                        }
                    </div>
            <div className={classes.page}>
                {
                    searchTimeOut?
                        <CircularProgress style={{position: 'fixed', top: '50vh'}}/>
                        :
                        list?list.map((element, idx)=> {
                            return(
                                <LazyLoad scrollContainer={'.App-body'} key={element._id} height={height} offset={[height, 0]} debounce={0} once={true}  placeholder={<CardOrderPlaceholder/>}>
                                    <ClickNHold
                                        style={{background: selected.includes(element._id)?'rgba(255, 179, 0, 0.15)':null}}
                                        time={3}
                                        onClickNHold={()=>{
                                            if(profile.role==='admin'&&(element.cancelClient||element.cancelForwarder))
                                                if(selected.includes(element._id)) {
                                                    selected = selected.filter((i)=>i!==element._id)
                                                    setSelected([...selected])
                                                }
                                                else
                                                    setSelected([...selected, element._id])

                                        }}
                                    >
                                        <CardOrder list={list} idx={idx} setSelected={setSelected} selected={selected} setList={setList} key={element._id} element={element}/>
                                    </ClickNHold>
                                </LazyLoad>
                            )}
                        ):null
                }
            </div>
            {profile.role==='admin'&&(selected.length||filter==='обработка')?
                <Fab onClick={open} color='primary' aria-label='add' className={classes.fab}>
                    <Badge color='secondary' badgeContent={selected.length}>
                        <SettingsIcon />
                    </Badge>
                </Fab>
                :
                null
            }
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={close}
                className={classes.menu}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                {filter==='обработка' ?
                    <MenuItem onClick={async () => {
                        const action = async () => {
                            await acceptOrders()
                        }
                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                        showMiniDialog(true);
                        setSelected([])
                        close()
                    }}>Принять</MenuItem>
                    :
                    null
                }
                {selected.length ?
                    <MenuItem style={{color: 'red'}} onClick={async () => {
                        const action = async () => {
                            let _list = [...list]
                            for (let i = 0; i < _list.length; i++) {
                                if (selected.includes(_list[i].idx)) {
                                    _list.splice(i, 1)
                                    i -= 1
                                }
                            }
                            setList(_list)
                            await deleteOrders(selected)
                        }
                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                        showMiniDialog(true);
                        setSelected([])
                        close()
                    }}>Удалить</MenuItem>
                    :
                    null
                }
            </Menu>
        </App>
    )
})

Orders.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['экспедитор', 'admin', 'суперорганизация', 'организация', 'менеджер', 'client', 'агент', 'суперагент', 'суперэкспедитор'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            ...await getOrders({
                city: ctx.store.getState().app.city,
                search: '',
                sort: '-createdAt',
                filter: '',
                date: '',
                skip: 0
            }, ctx.req ? await getClientGqlSsr(ctx.req) : undefined)
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
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Orders);
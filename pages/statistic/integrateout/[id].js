import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import App from '../../../layouts/App';
import CardIntegrateOutShoro from '../../../components/IntegrateOutShoro/CardIntegrateOutShoro'
import pageListStyle from '../../../src/styleMUI/orders/orderList'
import {outXMLReturnedShoros, outXMLShoros, deleteOutXMLReturnedShoroAll, deleteOutXMLShoroAll, statisticOutXMLReturnedShoros, statisticOutXMLShoros} from '../../../src/gql/integrateOutShoro'
import { connect } from 'react-redux'
import Router from 'next/router'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import initialApp from '../../../src/initialApp'
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Confirmation from '../../../components/dialog/Confirmation'
import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import { bindActionCreators } from 'redux'
import { useRouter } from 'next/router'

const IntegrateOutShoro = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    let [simpleStatistic, setSimpleStatistic] = useState(['0']);
    let [list, setList] = useState(data.outXMLShoros);
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    const router = useRouter()
    const { search, filter } = props.app;
    let [paginationWork, setPaginationWork] = useState(true);
    let [type, setType] = useState('Заказы');
    const checkPagination = async()=>{
        if(paginationWork){
            let addedList =
                type==='Возвраты'?
                    (await outXMLReturnedShoros({search, filter: filter, skip: list.length, organization: router.query.id})).outXMLReturnedShoros
                    :
                    (await outXMLShoros({search, filter: filter, skip: list.length, organization: router.query.id})).outXMLShoros
            if(addedList.length>0){
                setList([...list, ...addedList])
            }
            else
                setPaginationWork(false)
        }
    }
    const getList = async ()=>{
        setList(
            type==='Возвраты'?
                (await outXMLReturnedShoros({search, filter: filter, skip: 0, organization: router.query.id})).outXMLReturnedShoros
                :
                (await outXMLShoros({search, filter: filter, skip: 0, organization: router.query.id})).outXMLShoros
        )
        setSimpleStatistic(
            type==='Возвраты'?
                (await statisticOutXMLReturnedShoros({organization: router.query.id})).statisticOutXMLReturnedShoros
                :
                (await statisticOutXMLShoros({organization: router.query.id})).statisticOutXMLShoros
        )
    }
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    useEffect(()=>{
        if(searchTimeOut)
            clearTimeout(searchTimeOut)
        searchTimeOut = setTimeout(async()=>{
            await getList()
            setPaginationWork(true);
            (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        }, 500)
        setSearchTimeOut(searchTimeOut)
    },[filter, search, type])
    let [showStat, setShowStat] = useState(false);
    let [anchorEl, setAnchorEl] = useState(null);
    let open = event => {
        setAnchorEl(event.currentTarget);
    };
    let close = () => {
        setAnchorEl(null);
    };

    return (
        <App checkPagination={checkPagination} setList={setList} list={list} searchShow={true} filters={data.filterOutXMLShoro} pageName='Выгрузка интеграции 1С'>
            <Head>
                <title>Выгрузка интеграции 1С</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count' onClick={()=>setShowStat(!showStat)}>
                        {
                            `Выполнено: ${simpleStatistic[0]}`
                        }
                        {
                            showStat?
                                <>
                                {
                                    simpleStatistic[1]?
                                        <>
                                        <br/>
                                        <br/>
                                        {`Обработка: ${simpleStatistic[1]}`}
                                        </>
                                        :null
                                }
                                {
                                    simpleStatistic[2]?
                                        <>
                                        <br/>
                                        <br/>
                                        {`Ошибка: ${simpleStatistic[2]}`}
                                        </>
                                        :null
                                }
                                </>
                                :
                                null
                        }
                    </div>
            <div className={classes.page}>
                {list?list.map((element, idx)=> {
                    return(
                        <CardIntegrateOutShoro list={list} idx={idx} type={type} element={element} setList={setList} key={element._id}/>
                    )}
                ):null}
            </div>
            <Fab onClick={open} color='primary' aria-label='add' className={classes.fab}>
                <SettingsIcon />
            </Fab>
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
                <MenuItem style={{background: type==='Заказы'?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={async()=>{
                    setType('Заказы')
                    close()
                }}>Заказы</MenuItem>
                <MenuItem style={{background: type==='Возвраты'?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={async()=>{
                    setType('Возвраты')
                    close()
                }}>Возвраты</MenuItem>
                <MenuItem style={{color: 'red'}} onClick={async()=>{
                    const action = async() => {
                        type==='Возвраты'?await deleteOutXMLReturnedShoroAll(router.query.id):await deleteOutXMLShoroAll(router.query.id)
                        setList([])
                        setSimpleStatistic(['0'])
                    }
                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                    showMiniDialog(true);
                    await getList()
                    close()
                }}>Удалить все</MenuItem>
            </Menu>
        </App>
    )
})

IntegrateOutShoro.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if('admin'!==ctx.store.getState().user.profile.role)
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: await outXMLShoros({organization: ctx.query.id, search: '', skip: 0,filter:''}, ctx.req?await getClientGqlSsr(ctx.req):undefined)
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

export default connect(mapStateToProps, mapDispatchToProps)(IntegrateOutShoro);
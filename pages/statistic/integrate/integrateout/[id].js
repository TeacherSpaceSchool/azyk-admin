import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../../../layouts/App';
import CardIntegrateOutShoro from '../../../../components/card/CardIntegrateOutShoro'
import pageListStyle from '../../../../src/styleMUI/orders/orderList'
import {getOutXMLReturnedShoros, getOutXMLShoros, deleteOutXMLReturnedShoroAll, deleteOutXMLShoroAll, getStatisticOutXMLReturnedShoros, getStatisticOutXMLShoros} from '../../../../src/gql/integrateOutShoro'
import { connect } from 'react-redux'
import Router from 'next/router'
import { getClientGqlSsr } from '../../../../src/getClientGQL'
import initialApp from '../../../../src/initialApp'
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Confirmation from '../../../../components/dialog/Confirmation'
import * as mini_dialogActions from '../../../../redux/actions/mini_dialog'
import { bindActionCreators } from 'redux'
import { useRouter } from 'next/router'
import {formatAmount, unawaited} from '../../../../src/lib';
import {viewModes} from '../../../../src/enum';
import Table from '../../../../components/table/integrateout';

const filters = [{name: 'Все', value: ''}, {name: 'Создан', value: 'create'}, {name: 'Обновлен', value: 'update'}, {name: 'На удаление', value: 'del'}, {name: 'Выполнен', value: 'check'}, {name: 'Ошибка', value: 'error'}]

const IntegrateOutShoro = React.memo((props) => {
    const router = useRouter()
    const classes = pageListStyle();
    //props
    const {data} = props;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {search, filter, viewMode} = props.app;
    //ref
    const initialRender = useRef(true);
    const paginationWork = useRef(true);
    const searchTimeOut = useRef(null);
    //type
    const [type, setType] = useState('Заказы');
    //deps
    const deps = [filter, type]
    //listArgs
    const listArgs = {filter, organization: router.query.id}
    //stat
    const [showStat, setShowStat] = useState(false);
    const [stat, setStat] = useState(['0']);
    const getStat = async () => setStat(type==='Возвраты'? await getStatisticOutXMLReturnedShoros({organization: router.query.id}) : await getStatisticOutXMLShoros({organization: router.query.id}))
     //list
    let [list, setList] = useState(data.outXMLShoros);
    const getList = async (skip) => {
        const gettedData = await (type==='Возвраты'?getOutXMLReturnedShoros:getOutXMLShoros)({...listArgs, search, skip: skip||0})
        if(!skip) {
            unawaited(getStat)
            setList(gettedData)
            paginationWork.current = true;
            (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
        }
        else if(gettedData.length) {
            setList(list => [...list, ...gettedData])
            paginationWork.current = true
        }
    }
    //filter
    useEffect(() => {
        if(!initialRender.current)
            unawaited(getList)
        unawaited(getStat)
    }, deps)
    //search
    useEffect(() => {
        if(initialRender.current)
            initialRender.current = false;
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
        <App checkPagination={checkPagination} list={list} setList={setList} searchShow filters={filters} pageName='Выгрузка интеграции 1С'>
            <Head>
                <title>Выгрузка интеграции 1С</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count' onClick={() =>setShowStat(!showStat)}>
                        Выполнено: {formatAmount(stat[0])}
                        {
                            showStat?
                                <>
                                    <br/>
                                    Обработка: {formatAmount(stat[1])}
                                    <br/>
                                    Ошибка: {formatAmount(stat[2])}
                                </>
                                :
                                null
                        }
                    </div>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                {list?viewMode===viewModes.card?
                        list.map((element, idx) => <CardIntegrateOutShoro idx={idx} type={type} element={element} list={list} setList={setList} key={element._id}/>)
                        :
                        <Table list={list}/>
                    :null}
            </div>
            <Fab onClick={open} color='primary' className={classes.fab}>
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
                <MenuItem style={{background: type==='Заказы'?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={() => {
                    setType('Заказы')
                    close()
                }}>Заказы</MenuItem>
                <MenuItem style={{background: type==='Возвраты'?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={() => {
                    setType('Возвраты')
                    close()
                }}>Возвраты</MenuItem>
                <MenuItem style={{color: 'red'}} onClick={() => {
                    const action = async () => {
                        type==='Возвраты'?await deleteOutXMLReturnedShoroAll(router.query.id):await deleteOutXMLShoroAll(router.query.id)
                        setList([])
                        setStat(['0'])
                    }
                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                    showMiniDialog(true);
                    unawaited(getList)
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
        data: {
            outXMLShoros: await getOutXMLShoros({organization: ctx.query.id, search: '', skip: 0,filter:''}, getClientGqlSsr(ctx.req))
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

export default connect(mapStateToProps, mapDispatchToProps)(IntegrateOutShoro);
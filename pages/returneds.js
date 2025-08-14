import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../layouts/App';
import CardReturned from '../components/card/CardReturned'
import pageListStyle from '../src/styleMUI/returned/returnedList'
import {getReturneds} from '../src/gql/returned'
import { connect } from 'react-redux'
import Router from 'next/router'
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';
import AddIcon from '@material-ui/icons/Add';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Confirmation from '../components/dialog/Confirmation'
import { deleteReturneds, getReturnedsSimpleStatistic } from '../src/gql/returned'
import * as mini_dialogActions from '../redux/actions/mini_dialog'
import { bindActionCreators } from 'redux'
import Badge from '@material-ui/core/Badge';
import Link from 'next/link';
import {unawaited} from '../src/lib';

const Returneds = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    let [simpleStatistic, setSimpleStatistic] = useState(['0']);
    const getSimpleStatistic = async () => setSimpleStatistic(await getReturnedsSimpleStatistic({search, date, city}))
    let [list, setList] = useState(data.returneds);
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {search, sort, date, city} = props.app;
    const {profile} = props.user;
    const paginationWork = useRef(true);
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            let addedList = await getReturneds({search, sort, date, skip: list.length, city})
            if(addedList.length) {
                setList([...list, ...addedList])
                paginationWork.current = true
            }
        }
    }, [search, sort, date, list, city])
    const getList = async () => {
        setSelected([])
        unawaited(getSimpleStatistic)
        setList(await getReturneds({search, sort, date, skip: 0, city}));
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant'});
        paginationWork.current = true;
    }
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    useEffect(() => {
        if(!initialRender.current)
            unawaited(getList)
    }, [sort, date, city])
    useEffect(() => {
        (async () => {
            if(initialRender.current) {
                initialRender.current = false;
                unawaited(getSimpleStatistic)
            } else {
                if(searchTimeOut.current)
                    clearTimeout(searchTimeOut.current)
                searchTimeOut.current = setTimeout(() => {
                    unawaited(getList)
                }, 500)
        }})()
    }, [search])
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
        <App cityShow checkPagination={checkPagination} list={list} setList={setList} searchShow dates pageName='Возвраты'>
            <Head>
                <title>Возвраты</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count' onClick={()=>setShowStat(!showStat)}>
                        {
                            `Возвратов: ${simpleStatistic[0]}`
                        }
                        {
                            showStat?
                                <>
                                <br/>
                                {`Сумма: ${simpleStatistic[1]} сом`}
                                <br/>
                                {`Тоннаж: ${simpleStatistic[2]} кг`}
                                </>
                                :
                                null
                        }
                    </div>
            <div className={classes.page}>
                {list?list.map((element, idx)=> {
                        return <CardReturned key={element._id} idx={idx} setSelected={setSelected} selected={selected} list={list} setList={setList} element={element}/>
                }):null}
            </div>
            {selected.length?
                <Fab onClick={open} color='primary' className={classes.fab}>
                    <Badge color='secondary' badgeContent={selected.length}>
                        <SettingsIcon />
                    </Badge>
                </Fab>
                :
                ['суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент'].includes(profile.role)?<Link href='/returned/new'>
                    <Fab color='primary' className={classes.fab}>
                        <AddIcon />
                    </Fab>
                </Link>:null
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
                <MenuItem style={{color: 'red'}} onClick={() => {
                    const action = async () => {
                        setList(list => list.filter(item => !selected.includes(item.idx)))
                        await deleteReturneds(selected)
                    }
                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                    showMiniDialog(true);
                    setSelected([])
                    close()
                }}>Удалить</MenuItem>
            </Menu>
        </App>
    )
})

Returneds.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    ctx.store.getState().app.sort = '-createdAt'
    return {
        data: {
            returneds: await getReturneds({city: ctx.store.getState().app.city, search: '', sort: '-createdAt', date: '', skip: 0}, getClientGqlSsr(ctx.req))
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

export default connect(mapStateToProps, mapDispatchToProps)(Returneds);
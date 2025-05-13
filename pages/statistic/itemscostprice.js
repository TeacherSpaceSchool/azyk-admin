import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import { urlMain } from '../../redux/constants/other'
import { checkFloat, inputFloat } from '../../src/lib'
import initialApp from '../../src/initialApp'
import ItemsCostPriceCard from '../../components/itemscostprice/ItemsCostPrice'
import ItemsCostPricePlaceholder from '../../components/itemscostprice/ItemsCostPricePlaceholder'
import { getClientGqlSsr } from '../../src/getClientGQL'
import { getActiveOrganization } from '../../src/gql/statistic'
import { getBrands, setItemsCostPrice } from '../../src/gql/items'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../redux/actions/app'
import LazyLoad from 'react-lazyload';
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import * as snackbarActions from '../../redux/actions/snackbar'
import dynamic from 'next/dynamic'

const Confirmation = dynamic(() => import('../../components/dialog/Confirmation'))

const ItemsCostPrice = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    let { isMobileApp, search, city } = props.app;
    const { setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const { showLoad } = props.appActions;
    const { showSnackBar } = props.snackbarActions;
    const initialRender = useRef(true);
    let [activeOrganization, setActiveOrganization] = useState(data.activeOrganization);
    let [costPrecent, setCostPrecent] = useState('');
    let handleCostPrecent =  (event) => {
        setCostPrecent(inputFloat(event.target.value))
    };
    let [pagination, setPagination] = useState(100);
    let [list, setList] = useState([]);
    let [filtredList, setFiltredList] = useState([]);
    let [organization, setOrganization] = useState(undefined);
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                await showLoad(true)
                setOrganization(undefined)
                setActiveOrganization((await getActiveOrganization(city)).activeOrganization)
                await showLoad(false)
            }
        })()
    },[city])
    useEffect(()=>{
        (async()=>{
            if(organization){
                await showLoad(true)
                setList((await getBrands({organization: organization._id, search, sort: '-priotiry'})).brands)
                await showLoad(false)
            }
            else
                setList([])
        })()
    },[organization])
    const checkPagination = ()=>{
        if(pagination<filtredList.length){
            setPagination(pagination+100)
        }
    }
    useEffect(()=>{
        (async()=>{
            if(list.length>0) {
                let filtredList = [...list]
                if(search.length>0)
                    filtredList = filtredList.filter(element=>(element.name.toLowerCase()).includes(search.toLowerCase()))
                setFiltredList([...filtredList])
            }
        })()
    },[search, list])

    let [anchorEl, setAnchorEl] = useState(null);
    let open = event => {
        setAnchorEl(event.currentTarget);
    };
    let close = () => {
        setAnchorEl(null);
    };
    return (
        <App cityShow pageName='Себестоимость товара' checkPagination={checkPagination} searchShow={true}>
            <Head>
                <title>Себестоимость товара</title>
                <meta name='description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:title' content='Себестоимость товара' />
                <meta property='og:description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:type' content='website' />
                <meta property='og:image' content={`${urlMain}/static/512x512.png`} />
                <meta property='og:url' content={`${urlMain}/statistic/itemscostprice`} />
                <link rel='canonical' href={`${urlMain}/statistic/itemscostprice`}/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        <Autocomplete
                            className={classes.input}
                            options={activeOrganization}
                            getOptionLabel={option => option.name}
                            value={organization}
                            onChange={(event, newValue) => {
                                setOrganization(newValue)
                            }}
                            noOptionsText='Ничего не найдено'
                            renderInput={params => (
                                <TextField {...params} label='Организация' fullWidth />
                            )}
                        />
                        <TextField
                            label='Процент себестоимости'
                            type={ isMobileApp?'number':'text'}
                            value={costPrecent}
                            className={classes.input}
                            onChange={handleCostPrecent}
                            inputProps={{
                                'aria-label': 'description',
                            }}
                        />
                    </div>
                </CardContent>
            </Card>
            <div className={classes.listInvoices}>
                {filtredList?filtredList.map((element, idx)=> {
                    if (idx <= pagination) {
                        return (
                            <LazyLoad scrollContainer={'.App-body'} key={element._id} offset={[186, 0]} debounce={0} once={true}  placeholder={<ItemsCostPricePlaceholder/>}>
                                <ItemsCostPriceCard element={element} idx={idx} setList={setList} list={list}/>
                            </LazyLoad>
                        )
                    }
                    else return null
                }):null}
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
                <MenuItem onClick={async()=>{
                    if(costPrecent) {
                        const action = async () => {
                            for (let i = 0; i < list.length; i++) {
                                list[i].costPrice = checkFloat(list[i].price / 100 * checkFloat(costPrecent))
                                setList([...list])
                            }
                        }
                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                        showMiniDialog(true)
                    }
                    else
                        showSnackBar('Задайте процент');
                    close()
                }}>Задать процент</MenuItem>
                <MenuItem onClick={async()=>{
                    const action = async () => {
                        await showLoad(true)
                        let itemsCostPrice = []
                        for (let i = 0; i < list.length; i++) {
                            if(list[i].costPrice&&checkFloat(list[i].costPrice)>0) {
                                itemsCostPrice.push({_id: list[i]._id, costPrice: checkFloat(list[i].costPrice)})
                            }
                        }
                        await setItemsCostPrice({itemsCostPrice})
                        await showLoad(false)
                    }
                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                    showMiniDialog(true)
                    close()
                }}>Сохранить</MenuItem>
            </Menu>
        </App>
    )
})

ItemsCostPrice.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    ctx.store.getState().app.filter = 'Заказы'
    if('admin'!==ctx.store.getState().user.profile.role)
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: await getActiveOrganization(ctx.store.getState().app.city, ctx.req?await getClientGqlSsr(ctx.req):undefined)
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
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ItemsCostPrice);
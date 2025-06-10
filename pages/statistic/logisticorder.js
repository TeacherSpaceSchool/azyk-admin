import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import initialApp from '../../src/initialApp'
import CardOrder from '../../components/order/CardOrder'
import CardReturned from '../../components/returned/CardReturned'
import { getClientGqlSsr } from '../../src/getClientGQL'
import { getActiveOrganization } from '../../src/gql/statistic'
import { checkInt } from '../../src/lib'
import { getEcspeditors } from '../../src/gql/employment'
import { getDistricts } from '../../src/gql/district'
import { getOrdersFromDistrict, setInvoicesLogic } from '../../src/gql/order'
import { getReturnedsFromDistrict, setReturnedLogic } from '../../src/gql/returned'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../redux/actions/app'
import Checkbox from '@material-ui/core/Checkbox';
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import * as snackbarActions from '../../redux/actions/snackbar'
import dynamic from 'next/dynamic'

const Confirmation = dynamic(() => import('../../components/dialog/Confirmation'))

const LogistiOorder = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    let { isMobileApp, date, filter, city } = props.app;
    const { profile } = props.user;
    const { setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    let [ecspeditors, setEcspeditors] = useState([]);
    let [type, setType] = useState('Заказы');
    let [ecspeditor, setEcspeditor] = useState(undefined);
    let [districts, setDistricts] = useState([]);
    let [price, setPrice] = useState(0);
    let [track, setTrack] = useState(0);
    let [weight, setWeight] = useState(0);
    let [lengthList, setLengthList] = useState(0);
    let [selectedOrders, setSelectedOrders] = useState([]);
    let [orders, setOrders] = useState([]);
    let [district, setDistrict] = useState(profile.role==='агент'?{_id: profile.organization}:undefined);
    let [showStat, setShowStat] = useState(false);
    let [organization, setOrganization] = useState(profile.organization?{_id: profile.organization}:undefined);
    const { showLoad } = props.appActions;
    let [pagination, setPagination] = useState(100);
    const { showSnackBar } = props.snackbarActions;
    const initialRender = useRef(true);
    let [activeOrganization, setActiveOrganization] = useState(data.activeOrganization);
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
    const checkPagination = ()=>{
        if(pagination<orders.length){
            setPagination(pagination+100)
        }
    }
    useEffect(()=>{
        (async()=>{
            setSelectedOrders([])
            setEcspeditor(undefined)
            setOrders([])
            if(organization){
                await showLoad(true)
                setDistricts((await getDistricts({search: '', sort: '-name', organization: organization._id})).districts)
                setEcspeditors((await getEcspeditors({_id: organization._id})).ecspeditors)
                await showLoad(false)
            }
            else {
                setDistricts([])
                setEcspeditors([])
            }
        })()
    },[organization])
    useEffect(()=>{
        (async()=>{
            setSelectedOrders([])
            if(district){
                if(!date)
                    date = new Date
                await showLoad(true)
                setOrders(
                    filter==='Заказы'?
                        (await getOrdersFromDistrict({organization: organization._id, district: district._id, date: date})).invoicesFromDistrict
                        :
                        (await getReturnedsFromDistrict({organization: organization._id, district: district._id, date: date})).returnedsFromDistrict
                )
                await showLoad(false)
            }
            else {
                setOrders([])
            }
            setType(filter)
        })()
    },[district, date, filter])
    useEffect(()=>{
        (async()=>{
            price = 0
            weight = 0
            lengthList = 0
            for(let i=0; i<orders.length; i++){
                if(selectedOrders.includes(orders[i]._id)) {
                    if (orders[i].orders&&orders[i].allPrice) {
                        for(let i1=0; i1<orders[i].orders.length;i1++){
                            price += (orders[i].orders[i1].allPrice - orders[i].orders[i1].returned * (orders[i].orders[i1].allPrice / orders[i].orders[i1].count))
                        }
                    } else if (orders[i].allPrice) {
                        price += orders[i].allPrice
                    }
                    lengthList += 1
                    if (orders[i].allTonnage)
                        weight += orders[i].allTonnage
                }
            }
            setPrice(price)
            setWeight(weight)
            setLengthList(lengthList)
        })()
    },[selectedOrders])
    const filters = [{name: 'Заказы', value: 'Заказы'}, {name: 'Возвраты', value: 'Возвраты'}]
    let [anchorEl, setAnchorEl] = useState(null);
    let open = event => {
        setAnchorEl(event.currentTarget);
    };
    let close = () => {
        setAnchorEl(null);
    };

    return (
        <App cityShow pageName='Логистика' dates={true} checkPagination={checkPagination} filters={filters}>
            <Head>
                <title>Логистика</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        {
                            profile.role==='admin'?
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
                                )}/>
                                :
                                null
                        }
                        {
                            profile.role!=='агент'?
                                <Autocomplete
                                    className={classes.input}
                                    options={districts}
                                    getOptionLabel={option => option.name}
                                    value={district}
                                    onChange={(event, newValue) => {
                                        setDistrict(newValue)
                                    }}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField {...params} label='Район' fullWidth />
                                    )}
                                />
                                :
                                null
                        }
                    </div>
                    <div className={classes.row}>
                        <Autocomplete
                            className={classes.input}
                            options={ecspeditors}
                            getOptionLabel={option => option.name}
                            value={ecspeditor}
                            onChange={(event, newValue) => {
                                setEcspeditor(newValue)
                            }}
                            noOptionsText='Ничего не найдено'
                            renderInput={params => (
                                <TextField {...params} label='Экспедитор' fullWidth />
                            )}/>
                        <TextField
                            type={ isMobileApp?'number':'text'}
                            label='Рейс'
                            value={track}
                            className={classes.input}
                            onChange={(event)=>{
                                while((event.target.value).includes(','))
                                    event.target.value = (event.target.value).replace(',', '.')
                                setTrack(checkInt(event.target.value))
                            }}
                            inputProps={{
                                'aria-label': 'description',
                            }}
                        />
                    </div>
                    <div className={classes.listInvoices}>
                        {orders?orders.map((element, idx)=> {
                            if (idx <= pagination)
                                return (
                                    <div key={element._id} style={isMobileApp ? {alignItems: 'baseline'} : {}}
                                         className={isMobileApp ? classes.column1 : classes.row1}>
                                        <Checkbox checked={selectedOrders.includes(element._id)}
                                                  onChange={() => {
                                                      if (!selectedOrders.includes(element._id)) {
                                                          selectedOrders.push(element._id)
                                                      } else {
                                                          selectedOrders.splice(selectedOrders.indexOf(element._id), 1)
                                                      }
                                                      setSelectedOrders([...selectedOrders])
                                                  }}
                                        />
                                        {
                                            type==='Заказы'?
                                                <CardOrder element={element}/>
                                                :
                                                type==='Возвраты'?
                                                    <CardReturned element={element}/>
                                                    :
                                                    null
                                        }
                                    </div>
                                )
                            else return null
                        }):null}
                    </div>
                </CardContent>
            </Card>
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
                    if(selectedOrders.length>0&&(ecspeditor||track!==undefined)){
                        const action = async() => {
                            if(selectedOrders.length>0) {
                                let element = {invoices: selectedOrders, returneds: selectedOrders}
                                if (ecspeditor) element.forwarder = ecspeditor._id
                                if (track !== undefined) element.track = track
                                orders = orders.map(order=>{
                                    if(selectedOrders.includes(order._id)){
                                        order.track = track;
                                        if(ecspeditor)order.forwarder = ecspeditor
                                    }
                                    return(order)
                                })
                                setOrders([...orders])
                                type === 'Заказы' ? await setInvoicesLogic(element) : setReturnedLogic(element)
                            }
                        }
                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                        showMiniDialog(true)
                    }
                    else {
                        showSnackBar('Заполните все поля');
                    }
                    close()
                }}>Сохранить</MenuItem>
                <MenuItem onClick={async()=>{
                    setSelectedOrders(orders.map(order=>order._id))
                    close()
                }}>Выбрать все</MenuItem>
                <MenuItem onClick={async()=>{
                    setSelectedOrders([])
                    close()
                }}>Отменить выбор</MenuItem>
            </Menu>
            <div className='count' onClick={()=>setShowStat(!showStat)}>
                {
                    selectedOrders?
                        <>
                        {`${'Всего'}: ${lengthList}`}
                        {
                            showStat?
                                <>
                                {price?<>
                                <br/>
                                <br/>
                                {`Сумма: ${price} сом`}
                                </>:null}
                                {weight?<>
                                <br/>
                                <br/>
                                {`Тоннаж: ${weight} кг`}
                                </>:null}
                                </>
                                :
                                null
                        }
                        </>
                        :null
                }
            </div>
        </App>
    )
})

LogistiOorder.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    ctx.store.getState().app.filter = 'Заказы'
    if(!['admin', 'суперорганизация', 'организация', 'агент', 'менеджер'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            ...await getActiveOrganization(ctx.store.getState().app.city, ctx.req?await getClientGqlSsr(ctx.req):undefined),
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
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LogistiOorder);
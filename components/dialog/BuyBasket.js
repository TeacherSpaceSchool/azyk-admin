import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addOrders } from '../../src/gql/order'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import Checkbox from '@material-ui/core/Checkbox';
import Router from 'next/router'
import Link from 'next/link';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import { addBasket } from '../../src/gql/basket';
import { addAgentHistoryGeo } from '../../src/gql/agentHistoryGeo'
import { getGeoDistance } from '../../src/lib'
import { getDeliveryDate } from '../../src/gql/deliveryDate';
import { getDiscountClient } from '../../src/gql/discountClient';
import { pdDDMMYYYYWW } from '../../src/lib';
import { putOfflineOrders } from '../../src/service/idb/offlineOrders';

const BuyBasket =  React.memo(
    (props) =>{
        const { isMobileApp } = props.app;
        const { profile } = props.user;
        const { client, allPrice, organization, adss, agent, basket, geo, classes } = props;
        const { showMiniDialog } = props.mini_dialogActions;
        const { showSnackBar } = props.snackbarActions;
        const width = isMobileApp? (window.innerWidth-112) : 500
        let [coment, setComent] = useState('');
        let [inv, setInv] = useState(false);
        let handleComent =  (event) => {
            setComent(event.target.value)
        };
        let [paymentMethod, setPaymentMethod] = useState('Наличные');
        let [discount, setDiscount] = useState(undefined);
        let [dateDelivery, setDateDelivery] = useState(undefined);
        let handleDateDelivery =  (event) => {
            setDateDelivery(event.target.value)
        };
        let [dateDeliverys, setDateDeliverys] = useState([true, true, true, true, true, true, false]);
        let [priority, setPriority] = useState(0);
        let [week, setWeek] = useState([]);
        let [unlock, setUnlock] = useState(false);
        let paymentMethods = ['Наличные', 'Перечисление', 'Консигнация']
        let handlePaymentMethod =  (event) => {
            setPaymentMethod(event.target.value)
        };
        useEffect(()=>{
            (async()=>{
                if(!unlock) {
                    discount = (await getDiscountClient({
                        client: client._id,
                        organization: organization._id
                    })).discountClient
                    setDiscount(discount?discount.discount:0)
                    dateDeliverys = (await getDeliveryDate({
                        client: client._id,
                        organization: organization._id
                    })).deliveryDate
                    if (dateDeliverys) {
                        setPriority(dateDeliverys.priority?dateDeliverys.priority:0)
                        dateDeliverys = dateDeliverys.days
                        if (!agent)
                            dateDeliverys[6] = false
                        setDateDeliverys([...dateDeliverys])
                    }
                    else
                        dateDeliverys = [true, true, true, true, true, true, false]
                    for (let i = 0; i < 7; i++) {
                        let day = new Date()
                        if(day.getHours()>=3)
                            day.setDate(day.getDate()+1)
                        day.setDate(day.getDate()+i)
                        day.setHours(3, 0, 0, 0)
                        let dayWeek = day.getDay() === 0 ? 6 : (day.getDay() - 1)
                        week[dayWeek] = day
                        if(!dateDelivery&&dateDeliverys[dayWeek]){
                            dateDelivery = day
                            setDateDelivery(dateDelivery)
                        }
                    }
                    setWeek([...week])
                    for (let i = 0; i < basket.length; i++) {
                        if (basket[i].count > 0)
                            await addBasket({
                                item: basket[i]._id,
                                count: basket[i].count,
                                consignment: basket[i].consignment
                            })
                    }
                    setUnlock(true)
                }
            })()
        },[])
        return (
            <div className={classes.main}>
                {
                    adss&&adss.length>0?
                        <>
                        <Link href={`/ads/${organization._id}`}>
                            <div onClick={()=>{showMiniDialog(false)}} className={classes.showAds} style={{width: width}}>
                                <WhatshotIcon color='inherit'/>&nbsp;Просмотреть акции
                            </div>
                        </Link>
                        <br/>
                        </>
                        :
                        null
                }
                <div style={{width: width}} className={classes.itogo}><b>Адрес доставки: &nbsp;</b>{client.address[0][0]}</div>
                <Link href={'client/[id]'} as={`/client/${client._id}`}>
                    Изменить адрес
                </Link>
                <br/>
                <Input
                    style={{width: width}}
                    placeholder='Комментарий'
                    value={coment}
                    className={isMobileApp?classes.inputM:classes.inputD}
                    onChange={handleComent}
                    inputProps={{
                        'aria-label': 'description',
                    }}
                />
                <br/>
                {
                    week.length>0?
                        <>
                        <FormControl style={{width: width}} className={isMobileApp?classes.inputM:classes.inputD}>
                            <InputLabel>День доставки</InputLabel>
                            <Select value={dateDelivery} onChange={handleDateDelivery}>
                                {week.map((element, idx)=>{
                                    if(dateDeliverys[idx])
                                        return <MenuItem value={element}>{pdDDMMYYYYWW(element)}</MenuItem>
                                }
                                )}
                            </Select>
                        </FormControl>
                        <br/>
                        </>
                        :
                        null
                }
                {
                    agent?
                        <>
                        <FormControl style={{width: width}} className={isMobileApp?classes.inputM:classes.inputD}>
                            <InputLabel>Способ оплаты</InputLabel>
                            <Select value={paymentMethod} onChange={handlePaymentMethod}>
                                {paymentMethods.map((element)=>
                                    <MenuItem key={element} value={element} >{element}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                        <br/>
                        </>
                        :
                        null
                }
                {
                    !agent&&organization.minimumOrder?
                        <>
                        <div style={{width: width}} className={classes.itogo}><b>Минимальный заказ:</b>{` ${organization.minimumOrder} сом`}</div>
                        </>
                        :null
                }
                {
                    agent||['A','Horeca'].includes(client.category)?
                        <FormControlLabel
                            style={{width: width}}
                            onChange={(e)=>{
                                setInv(e.target.checked)
                            }}
                            control={<Checkbox/>}
                            label={'Cчет фактура'}
                        />
                        :
                        null
                }
                {discount?<div style={{width: width}} className={classes.itogo}><b>Скидка: &nbsp;</b>{discount}%</div>:null}
                <div style={{width: width}} className={classes.itogo}><b>Итого:</b>{` ${allPrice-allPrice/100*discount} сом`}</div>
                <br/>
                <div>
                    <Button variant='contained' color='primary' onClick={async()=>{
                        if(unlock) {
                            if (agent || !organization.minimumOrder === 0 || organization.minimumOrder <= allPrice) {
                               if (paymentMethod.length > 0) {
                                   sessionStorage.catalog = '{}'
                                   sessionStorage.catalogID = null
                                   if(navigator.onLine){
                                       if (agent&&geo&&client.address[0][1].includes(', ')) {
                                           let distance = getGeoDistance(geo.coords.latitude, geo.coords.longitude, ...(client.address[0][1].split(', ')))
                                           if(distance<1000){
                                               await addAgentHistoryGeo({client: client._id, geo: `${geo.coords.latitude}, ${geo.coords.longitude}`})
                                           }
                                       }
                                       await addOrders({
                                           inv: inv,
                                           priority: priority,
                                           unite: organization.unite,
                                           info: coment,
                                           paymentMethod: paymentMethod,
                                           organization: organization._id,
                                           client: client._id,
                                           dateDelivery: dateDelivery
                                       })
                                       Router.push('/orders')
                                   }
                                   else if(profile.role.includes('агент')) {
                                       await putOfflineOrders({
                                           ...(geo?{geo: {latitude: geo.coords.latitude, longitude: geo.coords.longitude}}:{}),
                                           inv: inv,
                                           priority: priority,
                                           unite: organization.unite,
                                           info: coment,
                                           paymentMethod: paymentMethod,
                                           organization: organization._id,
                                           client: client._id,
                                           dateDelivery: dateDelivery,
                                           basket: basket,
                                           address: client.address[0],
                                           name: client.name,
                                           allPrice: `${allPrice-allPrice/100*discount} сом`
                                       })
                                       Router.push('/statistic/offlineorder')
                                   }
                                   showMiniDialog(false);
                                   /*const action = async () => {
                                   }
                                   setMiniDialog('Вы уверены?', <Confirmation action={action}/>)*/
                               }
                               else
                                   showSnackBar('Заполните все поля')
                            }
                            else {
                                showSnackBar('Сумма заказа должна быть выше минимальной')
                            }
                        }
                        else {
                            showSnackBar('Подождите...')
                        }
                    }} className={classes.button}>
                        Купить
                    </Button>
                    <Button variant='contained' color='secondary' onClick={()=>{showMiniDialog(false);}} className={classes.button}>
                        Закрыть
                    </Button>
                </div>
            </div>
        );
    }
)

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
    }
}

BuyBasket.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(BuyBasket));
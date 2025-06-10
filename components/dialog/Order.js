import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {setOrder, setInvoice} from '../../src/gql/order'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import Button from '@material-ui/core/Button';
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import { pdDDMMYYHHMM, pdDDMMYYHHMMCancel, pdDDMMYYYYWW, checkFloat } from '../../src/lib'
import Confirmation from './Confirmation'
import Geo from '../../components/dialog/Geo'
import OrderAdss from '../../components/dialog/OrderAdss'
import HistoryOrder from '../../components/dialog/HistoryOrder'
import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@material-ui/icons/Cancel';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const Order =  React.memo(
    (props) =>{
        const { isMobileApp } = props.app;
        const { profile, authenticated } = props.user;
        const { showMiniDialog, setMiniDialog, showFullDialog, setFullDialog } = props.mini_dialogActions;
        const { classes, element, setList, list, idx } = props;
        let [orders, setOrders] = useState([...element.orders]);
        let [adss, setAdss] = useState([...element.adss]);
        let [allPrice, setAllPrice] = useState(element.allPrice);
        let [consignmentPrice, setConsignmentPrice] = useState(element.consignmentPrice);
        let [allTonnage, setAllTonnage] = useState(element.allTonnage);
        let [showCons, setShowCons] = useState({});
        let [showReturn, setShowReturn] = useState({});
        let [taken, setTaken] = useState(element.taken);
        let [paymentConsignation, setPaymentConsignation] = useState(element.paymentConsignation);
        let [confirmationForwarder, setConfirmationForwarder] = useState(element.confirmationForwarder);
        let [confirmationClient, setConfirmationClient] = useState(element.confirmationClient);
        let [cancelForwarder, setCancelForwarder] = useState(element.cancelForwarder!=undefined&&element.cancelForwarder);
        let [cancelClient, setCancelClient] = useState(element.cancelClient!=undefined&&element.cancelClient);
        let [changeOrders, setChangeOrders] = useState(false);
        const width = isMobileApp? (window.innerWidth-112) : 500;
        const allowOrganization = (['экспедитор', 'менеджер', 'суперорганизация', 'организация', 'агент'].includes(profile.role)&&profile.organization===element.organization._id)
        const { showSnackBar } = props.snackbarActions;
        let canculateAllPrice = ()=>{
            allTonnage=0
            allPrice=0
            consignmentPrice=0
            for(let i=0; i<orders.length; i++){
                consignmentPrice+=orders[i].consignmentPrice
                allPrice+=orders[i].allPrice
                allTonnage+=orders[i].allTonnage
            }
            setAllPrice(checkFloat(allPrice))
            setAllTonnage(checkFloat(allTonnage))
            setConsignmentPrice(consignmentPrice)
            setChangeOrders(true)
        }
        let increment = (idx)=>{
            let price = orders[idx].allPrice/orders[idx].count
            if(orders[idx].item.apiece)
                orders[idx].count+=1
            else
                orders[idx].count+=orders[idx].item.packaging
            orders[idx].allPrice = checkFloat(orders[idx].count * price)
            orders[idx].allTonnage = orders[idx].count * orders[idx].item.weight
            setOrders([...orders])
            canculateAllPrice()
        }
        let decrement = (idx)=>{
            let price = orders[idx].allPrice/orders[idx].count
            if(orders[idx].count>1&&orders[idx].item.apiece) {
                if(!element.organization.minimumOrder||((allPrice-price)>=element.organization.minimumOrder)) {
                    orders[idx].count -= 1
                    orders[idx].allPrice = checkFloat(orders[idx].count * price)
                    orders[idx].allTonnage = orders[idx].count * orders[idx].item.weight
                    setOrders([...orders])
                    canculateAllPrice()
                } else
                    showSnackBar('Сумма не может быть меньше минимальной')
            }
            else if(orders[idx].count>orders[idx].item.packaging&&!orders[idx].item.apiece) {
                if(!element.organization.minimumOrder||((allPrice-price*orders[idx].item.packaging)>=element.organization.minimumOrder)) {
                    orders[idx].count -= orders[idx].item.packaging
                    orders[idx].allPrice = checkFloat(orders[idx].count * price)
                    orders[idx].allTonnage = orders[idx].count * orders[idx].item.weight
                    setOrders([...orders])
                    canculateAllPrice()
                } else
                    showSnackBar('Сумма не может быть меньше минимальной')
            }
        }
        let incrementConsignation = (idx)=>{
            let price = orders[idx].allPrice/orders[idx].count
            if(orders[idx].consignment<orders[idx].count){
                orders[idx].consignment+=1
                orders[idx].consignmentPrice = checkFloat(orders[idx].consignment*price)
                setOrders([...orders])
                canculateAllPrice()
            }
        }
        let decrementConsignation = (idx)=>{
            if(orders[idx].consignment>0) {
                let price = orders[idx].allPrice/orders[idx].count
                orders[idx].consignment -= 1
                orders[idx].consignmentPrice = checkFloat(orders[idx].consignment*price)
                setOrders([...orders])
                canculateAllPrice()
            }
        }
        let incrementReturned = (idx)=>{
            if(orders[idx].returned<orders[idx].count){
                orders[idx].returned+=1
                setOrders([...orders])
                canculateAllPrice()
            }
        }
        let decrementReturned  = (idx)=>{
            if(orders[idx].returned>0) {
                orders[idx].returned -= 1
                setOrders([...orders])
                canculateAllPrice()
            }
        }
        let remove = (idx)=>{
            if(orders.length>1) {
                orders.splice(idx, 1)
                setOrders([...orders])
                canculateAllPrice()
            } else
                showSnackBar('Товары не могут отсутствовать в заказе')
        }
        let [priceAfterReturn, setPriceAfterReturn] = useState(0);
        useEffect(()=>{
            priceAfterReturn = 0
            for(let i=0; i<orders.length; i++){
                priceAfterReturn += (orders[i].allPrice-orders[i].returned*(orders[i].allPrice / orders[i].count))
            }
            setPriceAfterReturn(checkFloat(priceAfterReturn))
        },[orders,])
        return (
            <div className={classes.column} style={{width: width}}>
                <div className={classes.row}>
                    <div className={classes.nameField}>Заказ №:&nbsp;</div>
                    <div className={classes.value}>{element.number}</div>
                </div>
                <div className={classes.row}>
                    <div className={classes.nameField}>Статус:&nbsp;</div>
                    <div className={classes.value}>{
                        element.orders[0].status==='принят'&&(element.confirmationForwarder||element.confirmationClient)?
                            element.confirmationClient?
                                'подтвержден клиентом'
                                :
                                element.confirmationForwarder?
                                    'доставлен поставщиком'
                                    :
                                    element.orders[0].status
                            :
                            element.orders[0].status
                    }</div>
                </div>
                {
                    element.inv?
                        <div className={classes.row}>
                            <div className={classes.nameField}>Cчет фактура:&nbsp;</div>
                            <div className={classes.value}>Да</div>
                        </div>
                        :
                        null
                }
                <div className={classes.row}>
                    <div className={classes.nameField}>Время заказа: &nbsp;</div>
                    <div className={classes.value}>{pdDDMMYYHHMM(element.createdAt)}</div>
                </div>
                {
                    element.dateDelivery?
                        <div className={classes.row}>
                            <div className={classes.nameField}>Дата доставки:&nbsp;</div>
                            <div className={classes.value}>{pdDDMMYYYYWW(element.dateDelivery)}</div>
                        </div>
                        :
                        null

                }
                {
                    (['admin', 'суперагент', 'суперэкспедитор'].includes(profile.role)||allowOrganization)&&element.orders[0].updatedAt!==element.orders[0].createdAt?
                        <a>
                            <div style={{cursor: 'pointer'}} className={classes.row} onClick={()=>{setMiniDialog('История', <HistoryOrder invoice={element._id}/>)}}>
                                <div className={classes.nameField}>Изменен:&nbsp;</div>
                                <div className={classes.value}>{`${pdDDMMYYHHMM(element.orders[0].updatedAt)}${element.editor?`, ${element.editor}`:''}`}</div>
                            </div>
                        </a>
                        :
                        null
                }
                <div className={classes.row}>
                    <div className={classes.nameField}>Адрес: &nbsp;</div>
                    <div className={classes.value}>{`${element.address[2]?`${element.address[2]}, `:''}${element.address[0]}${element.city?` (${element.city})`:''}`}</div>
                </div>
                <div className={classes.geo} style={{color: element.address[1]?'#ffb300':'red'}} onClick={()=>{
                    if(element.address[1]) {
                        setFullDialog('Геолокация', <Geo geo={element.address[1]}/>)
                        showFullDialog(true)
                    }
                }}>
                    {
                        element.address[1]?
                            'Посмотреть геолокацию'
                            :
                            'Геолокация не задана'
                    }
                </div>
                <a href={`/client/${element.client._id}`} target='_blank'>
                    <div className={classes.row}>
                        <div className={classes.nameField}>Получатель:&nbsp;</div>
                        <div className={classes.value}>{element.client.name}</div>
                    </div>
                </a>
                <a href={`/organization/${element.organization._id}`} target='_blank'>
                    <div className={classes.row}>
                        <div className={classes.nameField}>Производитель:&nbsp;</div>
                        <div className={classes.value}>{element.organization.name}</div>
                    </div>
                </a>
                {
                    element.agent&&element.agent.name?
                        <a href={`/employment/${element.agent._id}`} target='_blank'>
                            <div className={classes.row}>
                                <div className={classes.nameField}>Агент: &nbsp;</div>
                                <div className={classes.value}>{element.agent.name}</div>
                            </div>
                        </a>
                        :
                        null
                }
                {
                    element.track!==undefined?
                        <div className={classes.row}>
                            <div className={classes.nameField}>Рейс:&nbsp;</div>
                            <div className={classes.value}>{element.track}</div>
                        </div>
                        :
                        null
                }
                {
                    element.forwarder&&element.forwarder.name?
                        <div className={classes.row}>
                            <div className={classes.nameField}>Экспедитор:&nbsp;</div>
                            <div className={classes.value}>{element.forwarder.name}</div>
                        </div>
                        :
                        null
                }

                <div
                    onClick={()=>{
                        if(profile.role!=='client') {
                            setFullDialog('Акции', <OrderAdss invoice={element._id}
                                                              organization={element.organization._id}
                                                              setAdss={setAdss} adss={adss}/>)
                            showFullDialog(true)
                        }
                    }}
                    className={classes.row}>
                    <div className={classes.nameField}>Акции:&nbsp;</div>
                    <div style={{cursor: 'pointer', ...(!adss[0]?{color: 'red'}:{color: '#ffb300'})}}>
                        {adss.length>0?
                            adss.map((ads, idx)=>
                                idx<4? <div key={`ads${idx}`} className={classes.value}>
                                        {ads.title}
                                    </div>
                                    :
                                    idx===4?
                                        '...'
                                        :
                                        null
                            )
                            :
                            <div className={classes.value}>нет</div>}
                    </div>
                </div>
                {
                    element.discount?
                        <div className={classes.row}>
                            <div className={classes.nameField}>Скидка:&nbsp;</div>
                            <div className={classes.value}>{element.discount}%</div>
                        </div>
                        :
                        null
                }
                <div className={classes.row}>
                    <div className={classes.nameField}>Сумма{priceAfterReturn!==allPrice?' (факт./итого)':''}:&nbsp;</div>
                    <div className={classes.value}>{priceAfterReturn!==allPrice?`${priceAfterReturn} сом/${allPrice} сом`:`${allPrice} сом`}</div>
                </div>
                {
                    consignmentPrice?
                        <div className={classes.row}>
                            <div className={classes.nameField}>Консигнации:&nbsp;</div>
                            <div className={classes.value} style={{color: element.paymentConsignation?'green':'red'}}>{consignmentPrice}&nbsp;сом,&nbsp;{element.paymentConsignation?'оплачены':'не оплачены'}</div>
                        </div>
                        :
                        null
                }
                {
                    authenticated&&profile.role!=='client'?
                        <>
                            {
                                allTonnage?
                                    <div className={classes.row}>
                                        <div className={classes.nameField}>Тоннаж:&nbsp;</div>
                                        <div className={classes.value}>{allTonnage}&nbsp;кг</div>
                                    </div>
                                    :
                                    null
                            }
                        </>
                        :
                        null
                }
                <div className={classes.row}>
                    <div className={classes.nameField}>Способ оплаты:&nbsp;</div>
                    <div className={classes.value}>{element.paymentMethod}</div>
                </div>
                <div className={classes.row}>
                    <div className={classes.nameField}>Информация:&nbsp;</div>
                    <div className={classes.value}>{element.info}</div>
                </div>
                <br/>
                <div className={classes.column}>
                    <b>{`Товары(${orders.length}):`}</b>
                    {element.orders[0].status!=='обработка'?<><br/><br/></>:null}
                    {
                        orders.map((order, idx) => {
                            if(
                                element.orders[0].status==='обработка'&&
                                (
                                    profile.role==='client'||
                                    allowOrganization||
                                    ['admin', 'суперагент', 'суперэкспедитор'].includes(profile.role)
                                )
                            )
                                return(
                                    <div key={order.item._id} className={classes.column}>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>Товар:&nbsp;</div>
                                            <a href={`/item/${order.item._id}`} target='_blank'>
                                                <div className={classes.value}>{order.item.name}</div>
                                            </a>
                                            <IconButton onClick={()=>{
                                                remove(idx)
                                            }} color='secondary' className={classes.button} aria-label='удалить'>
                                                <CancelIcon style={{height: 20, width: 20}}/>
                                            </IconButton>
                                        </div>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>Количество:&nbsp;</div>
                                            <div className={classes.column}>
                                                <div className={classes.row}>
                                                    <div className={classes.counterbtn} onClick={()=>{decrement(idx)}}>-</div>
                                                    <div className={classes.value}>{order.count}&nbsp;{order.item.unit&&order.item.unit.length>0?order.item.unit:'шт'}</div>
                                                    <div className={classes.counterbtn} onClick={()=>{increment(idx)}}>+</div>
                                                </div>
                                                {
                                                    orders[idx].item.apiece?
                                                        <div className={classes.addPackaging} style={{color: '#ffb300'}} onClick={()=>{
                                                            let price = orders[idx].allPrice/orders[idx].count
                                                            orders[idx].count = (parseInt(orders[idx].count/order.item.packaging)+1)*order.item.packaging
                                                            orders[idx].allPrice = orders[idx].count * price
                                                            orders[idx].allTonnage = orders[idx].count * orders[idx].item.weight
                                                            setOrders([...orders])
                                                            canculateAllPrice()
                                                        }}>
                                                            Добавить упаковку
                                                        </div>
                                                        :
                                                        <div className={classes.addPackaging} style={{color: '#ffb300'}}>
                                                            Упаковок: {(order.count/order.item.packaging)}
                                                        </div>
                                                }
                                            </div>
                                        </div>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>Общая стоимость:&nbsp;</div>
                                            <div className={classes.value}>{order.allPrice}&nbsp;сом</div>
                                        </div>
                                        {
                                            element.organization.consignation?
                                                <div className={classes.row}>
                                                    <div onClick={()=>{showCons[order._id]=!showCons[order._id];setShowCons({...showCons})}} style={showCons[order._id]?{background: '#ffb300'}:{}} className={classes.minibtn}>КОНС</div>
                                                </div>
                                                :null

                                        }
                                        {
                                            showCons[order._id]||showReturn[order._id]?
                                                <br/>
                                                :null
                                        }
                                        {
                                            showCons[order._id]?
                                                <>
                                                    <div className={classes.row}>
                                                        <div className={classes.nameField}>Консигнации:&nbsp;</div>
                                                        <div className={classes.column}>
                                                            <div className={classes.row}>
                                                                <div className={classes.counterbtn} onClick={()=>{decrementConsignation(idx)}}>-</div>
                                                                <div className={classes.value}>{order.consignment}&nbsp;{order.item.unit&&order.item.unit.length>0?order.item.unit:'шт'}</div>
                                                                <div className={classes.counterbtn} onClick={()=>{incrementConsignation(idx)}}>+</div>
                                                            </div>
                                                            <div className={classes.addPackaging} style={{color: '#ffb300'}} onClick={()=>{
                                                                let consignment = (parseInt(orders[idx].consignment/order.item.packaging)+1)*order.item.packaging
                                                                if(consignment<=orders[idx].count){
                                                                    orders[idx].consignment = consignment
                                                                }
                                                                else
                                                                    orders[idx].consignment = orders[idx].count
                                                                let price = orders[idx].allPrice/orders[idx].count
                                                                orders[idx].consignmentPrice = orders[idx].consignment * price
                                                                setOrders([...orders])
                                                                canculateAllPrice()
                                                            }}>
                                                                Добавить упаковку
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={classes.row}>
                                                        <div className={classes.nameField}>Стоимость консигнации:&nbsp;</div>
                                                        <div className={classes.value}>{order.consignmentPrice}&nbsp;сом</div>
                                                    </div>
                                                </>
                                                :
                                                null
                                        }
                                    </div>
                                )
                            else if(
                                allowOrganization&&!confirmationForwarder
                                ||
                                ['admin', 'суперагент', 'суперэкспедитор'].includes(profile.role)
                            )
                                return(
                                    <div key={order.item._id} className={classes.column}>
                                        <a href={`/item/${order.item._id}`} target='_blank'>
                                            <div className={classes.row}>
                                                <div className={classes.nameField}>Товар:&nbsp;</div>
                                                <div className={classes.value}>{order.item.name}</div>
                                            </div>
                                        </a>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>Количество{order.returned?' (факт./итого)':''}:&nbsp;</div>
                                            <div className={classes.value}>{order.returned?`${order.count-order.returned} ${order.item.unit&&order.item.unit.length>0?order.item.unit:'шт'}/${order.count} ${order.item.unit&&order.item.unit.length>0?order.item.unit:'шт'}`:`${order.count} ${order.item.unit&&order.item.unit.length>0?order.item.unit:'шт'}`}</div>
                                        </div>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>Сумма{order.returned?' (факт./итого)':''}:&nbsp;</div>
                                            <div className={classes.value}>
                                                {
                                                    order.returned?
                                                        `${checkFloat(order.allPrice/order.count*(order.count-order.returned))} сом/${order.allPrice} сом`
                                                        :
                                                        `${order.allPrice} сом`
                                                }
                                            </div>
                                        </div>
                                        <div className={classes.row}>
                                            {element.organization.consignation?
                                                <div onClick={()=>{showCons[order._id]=!showCons[order._id];setShowCons({...showCons})}} style={showCons[order._id]?{background: '#ffb300'}:{}} className={classes.minibtn}>КОНС</div>
                                                :
                                                null
                                            }
                                            {element.organization.refusal?
                                                <div onClick={()=>{showReturn[order._id]=!showReturn[order._id];setShowReturn({...showReturn})}} style={showReturn[order._id]?{background: '#ffb300'}:{}} className={classes.minibtn}>ОТКАЗ</div>
                                                :
                                                null
                                            }
                                        </div>
                                        {
                                            showCons[order._id]||showReturn[order._id]?
                                                <br/>
                                                :null
                                        }
                                        {
                                            showCons[order._id]?
                                                <>
                                                    <div className={classes.row}>
                                                        <div className={classes.nameField}>Консигнации:&nbsp;</div>
                                                        <div className={classes.column}>
                                                            <div className={classes.row}>
                                                                <div className={classes.counterbtn} onClick={()=>{decrementConsignation(idx)}}>-</div>
                                                                <div className={classes.value}>{order.consignment}&nbsp;{order.item.unit&&order.item.unit.length>0?order.item.unit:'шт'}</div>
                                                                <div className={classes.counterbtn} onClick={()=>{incrementConsignation(idx)}}>+</div>
                                                            </div>
                                                            <div className={classes.addPackaging} style={{color: '#ffb300'}} onClick={()=>{
                                                                let consignment = (parseInt(orders[idx].consignment/order.item.packaging)+1)*order.item.packaging
                                                                if(consignment<=orders[idx].count){
                                                                    orders[idx].consignment = consignment
                                                                }
                                                                else
                                                                    orders[idx].consignment = orders[idx].count
                                                                let price = orders[idx].allPrice/orders[idx].count
                                                                orders[idx].consignmentPrice = orders[idx].consignment * price
                                                                setOrders([...orders])
                                                                canculateAllPrice()
                                                            }}>
                                                                Добавить упаковку
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={classes.row}>
                                                        <div className={classes.nameField}>Стоимость консигнации:&nbsp;</div>
                                                        <div className={classes.value}>{order.consignmentPrice}&nbsp;сом</div>
                                                    </div>
                                                </>
                                                :null
                                        }
                                        {
                                            showReturn[order._id] ?
                                                <div className={classes.row}>
                                                    <div className={classes.nameField}>Отказ:&nbsp;</div>
                                                    <div className={classes.column}>
                                                        <div className={classes.row}>
                                                            <div className={classes.counterbtn} onClick={() => {
                                                                decrementReturned(idx)
                                                            }}>-
                                                            </div>
                                                            <div
                                                                className={classes.value}>{order.returned}&nbsp;
                                                                {order.item.unit&&order.item.unit.length>0?order.item.unit:'шт'}
                                                            </div>
                                                            <div className={classes.counterbtn} onClick={() => {
                                                                incrementReturned(idx)
                                                            }}>+
                                                            </div>
                                                        </div>
                                                        <div className={classes.addPackaging}
                                                             style={{color: '#ffb300'}} onClick={() => {
                                                            let returned = (parseInt(orders[idx].returned / order.item.packaging) + 1) * order.item.packaging
                                                            if (returned <= orders[idx].count) {
                                                                orders[idx].returned = returned
                                                            }
                                                            else
                                                                orders[idx].returned = orders[idx].count
                                                            setOrders([...orders])
                                                            canculateAllPrice()
                                                        }}>
                                                            Добавить упаковку
                                                        </div>
                                                    </div>
                                                </div>
                                                : null
                                        }
                                        <br/>
                                    </div>
                                )
                            else
                                return(
                                    <div key={order.item._id} className={classes.column}>
                                        <a href={`/item/${order.item._id}`} target='_blank'>
                                            <div className={classes.row}>
                                                <div className={classes.nameField}>Товар:&nbsp;</div>
                                                <div className={classes.value}>{order.item.name}</div>
                                            </div>
                                        </a>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>Количество{order.returned?' (факт./итого)':''}:&nbsp;</div>
                                            <div className={classes.value}>{order.returned?`${order.count-order.returned} ${order.item.unit&&order.item.unit.length>0?order.item.unit:'шт'}/${order.count} ${order.item.unit&&order.item.unit.length>0?order.item.unit:'шт'}`:`${order.count} ${order.item.unit&&order.item.unit.length>0?order.item.unit:'шт'}`}</div>
                                        </div>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>Сумма{order.returned?' (факт./итого)':''}:&nbsp;</div>
                                            <div className={classes.value}>
                                                {
                                                    order.returned?
                                                        `${checkFloat(order.allPrice/order.count*(order.count-order.returned))}/${order.allPrice} сом`
                                                        :
                                                        `${order.allPrice} сом`
                                                }
                                            </div>
                                        </div>
                                        {
                                            order.consignment?
                                                <>
                                                    <div className={classes.row}>
                                                        <div className={classes.nameField}>Консигнации:&nbsp;</div>
                                                        <div className={classes.value}>{order.consignment}&nbsp;{order.item.unit&&order.item.unit.length>0?order.item.unit:'шт'}</div>
                                                    </div>
                                                    <div className={classes.row}>
                                                        <div className={classes.nameField}>Стоимость консигнации:&nbsp;</div>
                                                        <div className={classes.value}>{order.consignmentPrice}&nbsp;сом</div>
                                                    </div>
                                                </>
                                                :
                                                null
                                        }
                                        {
                                            order.returned?
                                                <>
                                                    <div className={classes.row}>
                                                        <div className={classes.nameField}>Отказ:&nbsp;</div>
                                                        <div className={classes.value}>{order.returned}&nbsp;{order.item.unit&&order.item.unit.length>0?order.item.unit:'шт'}</div>
                                                    </div>
                                                </>
                                                :
                                                null
                                        }
                                        <br/>
                                    </div>
                                )
                        })
                    }
                </div>
                {element.orders[0].status==='обработка'?<br/>:null}
                {
                    consignmentPrice?
                        <div>
                            <FormControlLabel
                                disabled={changeOrders||!(['admin', 'суперагент', 'суперэкспедитор'].includes(profile.role)||allowOrganization)}
                                control={
                                    <Checkbox
                                        checked={paymentConsignation}
                                        onChange={()=>{
                                            setPaymentConsignation(!paymentConsignation);
                                        }}
                                        color='primary'
                                    />
                                }
                                label='Консигнации оплачены'
                            />
                        </div>
                        :
                        null
                }
                <div>
                    <FormControlLabel
                        disabled={changeOrders||(['admin', 'суперагент', 'суперэкспедитор'].includes(profile.role)?
                                !['обработка','принят'].includes(element.orders[0].status)
                                :
                                !(allowOrganization&&['обработка','принят'].includes(element.orders[0].status)))}
                        control={
                            <Checkbox
                                checked={taken}
                                onChange={()=>{
                                    setTaken(!taken);
                                }}
                                color='primary'
                            />
                        }
                        label='Заказ принят'
                    />
                </div>
                <div>
                    <FormControlLabel
                        disabled={changeOrders||(
                            ['admin', 'суперэкспедитор'].includes(profile.role)?
                                !['выполнен','принят'].includes(element.orders[0].status)
                                :
                                !((allowOrganization||'экспедитор'===profile.role)&&'принят'===element.orders[0].status)
                        )}
                        control={
                            <Checkbox
                                checked={confirmationForwarder}
                                onChange={()=>{
                                    setConfirmationForwarder(!confirmationForwarder);
                                }}
                                color='primary'
                            />
                        }
                        label='Заказ доставлен'
                    />
                </div>
                <div>
                    <FormControlLabel
                        disabled={changeOrders||(
                            profile.role==='admin'?
                                !['выполнен','принят'].includes(element.orders[0].status)
                                :
                                profile.role==='client'?
                                    'принят'!==element.orders[0].status
                                    :
                                    true
                        )}
                        control={
                            <Checkbox
                                checked={confirmationClient}
                                onChange={()=>{
                                    setConfirmationClient(!confirmationClient);
                                }}
                                color='primary'
                            />
                        }
                        label='Заказ получен'
                    />
                </div>
                <div>
                    <FormControlLabel
                        disabled={changeOrders||(
                            ['admin', 'суперагент', 'суперэкспедитор'].includes(profile.role)?
                                !['отмена','обработка'].includes(element.orders[0].status)
                                :
                                !(('client'===profile.role||allowOrganization)&&['отмена','обработка'].includes(element.orders[0].status))
                        )}
                        control={
                            <Checkbox
                                checked={
                                    element.cancelClient!=undefined||element.cancelForwarder!=undefined?
                                        element.cancelClient!=undefined?
                                            cancelClient
                                            :
                                            cancelForwarder
                                        :
                                        'client'===profile.role?
                                            cancelClient
                                            :
                                            cancelForwarder
                                }
                                onChange={()=>{
                                    if('client'===profile.role) setCancelClient(!cancelClient);
                                    else if(['admin', 'суперагент', 'суперэкспедитор'].includes(profile.role)){
                                        if(element.cancelClient!=undefined)
                                            setCancelClient(!cancelClient)
                                        else
                                            setCancelForwarder(!cancelForwarder)
                                    }
                                    else setCancelForwarder(!cancelForwarder);
                                }}
                                color='secondary'
                            />
                        }
                        label={
                            !element.cancelClient&&!element.cancelForwarder?
                                'Заказ отменен'
                                :
                                `Заказ отменен ${element.cancelClient?'клиентом':' поставщиком'}. Востановить заказ до ${element.cancelClient?pdDDMMYYHHMMCancel(element.cancelClient):pdDDMMYYHHMMCancel(element.cancelForwarder)}`
                        }
                    />
                </div>
                <center>
                    {
                        ((profile.role==='client'||allowOrganization||['агент', 'экспедитор'].includes(profile.role)||['admin', 'суперагент', 'суперэкспедитор'].includes(profile.role)))?
                            <Button variant='contained' color='primary' onClick={()=>{
                                const action = async() => {
                                    if(!changeOrders) {
                                        let invoice = {invoice: element._id, adss: adss.map(ads => ads._id)}
                                        if (element.taken !== taken) invoice.taken = taken;
                                        if (element.confirmationClient !== confirmationClient) invoice.confirmationClient = confirmationClient;
                                        if (element.confirmationForwarder !== confirmationForwarder) invoice.confirmationForwarder = confirmationForwarder;
                                        if (element.cancelClient !== cancelClient) invoice.cancelClient = cancelClient;
                                        if (element.cancelForwarder !== cancelForwarder) invoice.cancelForwarder = cancelForwarder;
                                        if (element.paymentConsignation !== paymentConsignation) invoice.paymentConsignation = paymentConsignation;
                                        await setInvoice(invoice)
                                    }

                                    let sendOrders = [];
                                    if(changeOrders) {
                                        sendOrders = orders.map((order) => {
                                            return {
                                                _id: order._id,
                                                consignmentPrice: order.consignmentPrice,
                                                name: order.item.name,
                                                returned: taken !== true ? 0 : order.returned,
                                                consignment: order.consignment,
                                                count: order.count,
                                                allPrice: order.allPrice,
                                                allTonnage: order.allTonnage,
                                                status: order.status
                                            }
                                        })
                                    }
                                    const res = await setOrder({orders: sendOrders, invoice: element._id})

                                    if (res&&list) {
                                        let _list = [...list]
                                        _list[idx] = res
                                        setList(_list)
                                    }
                                    showMiniDialog(false);
                                }
                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                            }} className={classes.button}>
                                Сохранить
                            </Button>
                            :
                            null
                    }
                    <Button variant='contained' color='secondary' onClick={()=>{showMiniDialog(false);}} className={classes.button}>
                        Закрыть
                    </Button>
                </center>
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

Order.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(Order));
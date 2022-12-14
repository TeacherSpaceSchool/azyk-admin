import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setOrder, setInvoice } from '../../src/gql/order'
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
import {getAdss, checkAdss} from '../../src/gql/ads'

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
        let [allSize, setAllSize] = useState(element.allSize);
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
        const allowOrganization = (['????????????????????', '????????????????', '????????????????????????????????', '??????????????????????', '??????????'].includes(profile.role)&&((profile.organization===element.organization._id&&!element.sale)||(element.sale&&profile.organization===element.sale._id)))
        const { showSnackBar } = props.snackbarActions;
        let canculateAllPrice = ()=>{
            allTonnage=0
            allSize=0
            allPrice=0
            consignmentPrice=0
            for(let i=0; i<orders.length; i++){
                consignmentPrice+=orders[i].consignmentPrice
                allPrice+=orders[i].allPrice
                allTonnage+=orders[i].allTonnage
                allSize+=orders[i].allSize
            }
            setAllPrice(checkFloat(allPrice))
            setAllTonnage(checkFloat(allTonnage))
            setAllSize(checkFloat(allSize))
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
            orders[idx].allSize = orders[idx].count * orders[idx].item.size
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
                    orders[idx].allSize = orders[idx].count * orders[idx].item.size
                    setOrders([...orders])
                    canculateAllPrice()
                } else
                    showSnackBar('?????????? ???? ?????????? ???????? ???????????? ??????????????????????')
            }
            else if(orders[idx].count>orders[idx].item.packaging&&!orders[idx].item.apiece) {
                if(!element.organization.minimumOrder||((allPrice-price*orders[idx].item.packaging)>=element.organization.minimumOrder)) {
                    orders[idx].count -= orders[idx].item.packaging
                    orders[idx].allPrice = checkFloat(orders[idx].count * price)
                    orders[idx].allTonnage = orders[idx].count * orders[idx].item.weight
                    orders[idx].allSize = orders[idx].count * orders[idx].item.size
                    setOrders([...orders])
                    canculateAllPrice()
                } else
                    showSnackBar('?????????? ???? ?????????? ???????? ???????????? ??????????????????????')
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
                showSnackBar('???????????? ???? ?????????? ?????????????????????????? ?? ????????????')
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
                    <div className={classes.nameField}>?????????? ???:&nbsp;</div>
                    <div className={classes.value}>{element.number}</div>
                </div>
                <div className={classes.row}>
                    <div className={classes.nameField}>????????????:&nbsp;</div>
                    <div className={classes.value}>{
                            element.orders[0].status==='????????????'&&(element.confirmationForwarder||element.confirmationClient)?
                                element.confirmationClient?
                                    '?????????????????????? ????????????????'
                                    :
                                    element.confirmationForwarder?
                                        '?????????????????? ??????????????????????'
                                        :
                                        element.orders[0].status
                                :
                                element.orders[0].status
                    }</div>
                </div>
                <div className={classes.row}>
                    <div className={classes.nameField}>?????????? ????????????: &nbsp;</div>
                    <div className={classes.value}>{pdDDMMYYHHMM(element.createdAt)}</div>
                </div>
                {
                    element.dateDelivery?
                        <div className={classes.row}>
                            <div className={classes.nameField}>???????? ????????????????:&nbsp;</div>
                            <div className={classes.value}>{pdDDMMYYYYWW(element.dateDelivery)}</div>
                        </div>
                        :
                        null

                }
                {
                    (['admin', '????????????????????', '??????????????????????????????'].includes(profile.role)||allowOrganization)&&element.orders[0].updatedAt!==element.orders[0].createdAt?
                       <a>
                           <div style={{cursor: 'pointer'}} className={classes.row} onClick={()=>{setMiniDialog('??????????????', <HistoryOrder invoice={element._id}/>)}}>
                               <div className={classes.nameField}>??????????????:&nbsp;</div>
                               <div className={classes.value}>{`${pdDDMMYYHHMM(element.orders[0].updatedAt)}${element.editor?`, ${element.editor}`:''}`}</div>
                            </div>
                       </a>
                        :
                        null
                }
                <div className={classes.row}>
                    <div className={classes.nameField}>??????????: &nbsp;</div>
                    <div className={classes.value}>{`${element.address[2]?`${element.address[2]}, `:''}${element.address[0]}${element.city?` (${element.city})`:''}`}</div>
                </div>
                <div className={classes.geo} style={{color: element.address[1]?'#ffb300':'red'}} onClick={()=>{
                    if(element.address[1]) {
                        setFullDialog('????????????????????', <Geo geo={element.address[1]}/>)
                        showFullDialog(true)
                    }
                }}>
                    {
                        element.address[1]?
                            '???????????????????? ????????????????????'
                            :
                            '???????????????????? ???? ????????????'
                    }
                </div>
                <a href={`/client/${element.client._id}`} target='_blank'>
                    <div className={classes.row}>
                        <div className={classes.nameField}>????????????????????:&nbsp;</div>
                        <div className={classes.value}>{element.client.name}</div>
                    </div>
                </a>
                <a href={`/organization/${element.organization._id}`} target='_blank'>
                    <div className={classes.row}>
                        <div className={classes.nameField}>??????????????????????????:&nbsp;</div>
                        <div className={classes.value}>{element.organization.name}</div>
                    </div>
                </a>
                {
                    element.agent&&element.agent.name?
                        <a href={`/employment/${element.agent._id}`} target='_blank'>
                            <div className={classes.row}>
                                <div className={classes.nameField}>??????????: &nbsp;</div>
                                <div className={classes.value}>{element.agent.name}</div>
                            </div>
                        </a>
                        :
                        null
                }
                {
                    element.track!==undefined?
                        <div className={classes.row}>
                            <div className={classes.nameField}>????????:&nbsp;</div>
                            <div className={classes.value}>{element.track}</div>
                        </div>
                        :
                        null
                }
                {
                    element.forwarder&&element.forwarder.name?
                        <div className={classes.row}>
                            <div className={classes.nameField}>????????????????????:&nbsp;</div>
                            <div className={classes.value}>{element.forwarder.name}</div>
                        </div>
                        :
                        null
                }
                {
                    element.sale?
                        <a href={`/organization/${element.sale._id}`} target='_blank'>
                            <div className={classes.row}>
                                <div className={classes.nameField}>????????????????????????:&nbsp;</div>
                                <div className={classes.value}>{element.sale.name}</div>
                            </div>
                        </a>
                        :
                        null
                }
                {
                    element.provider?
                        <a href={`/organization/${element.provider._id}`} target='_blank'>
                            <div className={classes.row}>
                                <div className={classes.nameField}>??????????????????:&nbsp;</div>
                                <div className={classes.value}>{element.provider.name}</div>
                            </div>
                        </a>
                        :
                        null
                }

                    <div
                         onClick={()=>{
                                setFullDialog('??????????', <OrderAdss invoice={element._id} organization={element.organization._id} setAdss={setAdss} adss={adss}/>)
                                showFullDialog(true)
                         }}
                         className={classes.row}>
                        <div className={classes.nameField}>??????????:&nbsp;</div>
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
                                <div className={classes.value}>??????</div>}
                        </div>
                    </div>
                {
                    profile.role!=='client'?
                     <div style={{color: '#ffb300', cursor: 'pointer'}} className={classes.value} onClick={async()=>{
                            let allAdss = (await getAdss({search: '', organization: element.organization._id})).adss
                            let _checkAdss = (await checkAdss(element._id)).checkAdss
                            for(let i=0; i<_checkAdss.length; i++){
                                let index = adss.findIndex(element=>element._id===_checkAdss[i])
                                if(index===-1) {
                                    adss.push(allAdss[allAdss.findIndex(element => element._id === _checkAdss[i])])
                                }
                            }
                            setAdss([...adss])
                        }}>?????????????????? ??????????</div>
                        :
                        null
                }
                {
                    element.discount?
                        <div className={classes.row}>
                            <div className={classes.nameField}>????????????:&nbsp;</div>
                            <div className={classes.value}>{element.discount}%</div>
                        </div>
                        :
                        null
                }
                <div className={classes.row}>
                    <div className={classes.nameField}>??????????{priceAfterReturn!==allPrice?' (????????./??????????)':''}:&nbsp;</div>
                    <div className={classes.value}>{priceAfterReturn!==allPrice?`${priceAfterReturn} ??????/${allPrice} ??????`:`${allPrice} ??????`}</div>
                </div>
                {
                    consignmentPrice?
                        <div className={classes.row}>
                            <div className={classes.nameField}>??????????????????????:&nbsp;</div>
                            <div className={classes.value} style={{color: element.paymentConsignation?'green':'red'}}>{consignmentPrice}&nbsp;??????,&nbsp;{element.paymentConsignation?'????????????????':'???? ????????????????'}</div>
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
                                    <div className={classes.nameField}>????????????:&nbsp;</div>
                                    <div className={classes.value}>{allTonnage}&nbsp;????</div>
                                </div>
                                :
                                null
                        }
                        {
                            allSize?
                                <div className={classes.row}>
                                    <div className={classes.nameField}>????????????????:&nbsp;</div>
                                    <div className={classes.value}>{allSize}&nbsp;??????</div>
                                </div>
                                :
                                null
                        }
                        </>
                        :
                        null
                }
                <div className={classes.row}>
                    <div className={classes.nameField}>???????????? ????????????:&nbsp;</div>
                    <div className={classes.value}>{element.paymentMethod}</div>
                </div>
                <div className={classes.row}>
                    <div className={classes.nameField}>????????????????????:&nbsp;</div>
                    <div className={classes.value}>{element.info}</div>
                </div>
                <br/>
                <div className={classes.column}>
                    <b>{`????????????(${orders.length}):`}</b>
                    {element.orders[0].status!=='??????????????????'?<><br/><br/></>:null}
                    {
                        orders.map((order, idx) => {
                            if(
                                element.orders[0].status==='??????????????????'&&
                                (
                                    profile.role==='client'||
                                    allowOrganization||
                                    ['admin', '????????????????????', '??????????????????????????????'].includes(profile.role)
                                )
                            )
                                return(
                                    <div key={order.item._id} className={classes.column}>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>??????????:&nbsp;</div>
                                            <a href={`/item/${order.item._id}`} target='_blank'>
                                                <div className={classes.value}>{order.item.name}</div>
                                            </a>
                                            <IconButton onClick={()=>{
                                                remove(idx)
                                            }} color='secondary' className={classes.button} aria-label='??????????????'>
                                                <CancelIcon style={{height: 20, width: 20}}/>
                                            </IconButton>
                                        </div>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>????????????????????:&nbsp;</div>
                                            <div className={classes.column}>
                                                <div className={classes.row}>
                                                    <div className={classes.counterbtn} onClick={()=>{decrement(idx)}}>-</div>
                                                    <div className={classes.value}>{order.count}&nbsp;{order.item.unit&&order.item.unit.length>0?order.item.unit:'????'}</div>
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
                                                            ???????????????? ????????????????
                                                        </div>
                                                        :
                                                        <div className={classes.addPackaging} style={{color: '#ffb300'}}>
                                                            ????????????????: {(order.count/order.item.packaging)}
                                                        </div>
                                                }
                                            </div>
                                        </div>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>?????????? ??????????????????:&nbsp;</div>
                                            <div className={classes.value}>{order.allPrice}&nbsp;??????</div>
                                        </div>
                                        {
                                            profile.role!=='client'||element.organization.consignation?
                                                <div className={classes.row}>
                                                    <div onClick={()=>{showCons[order._id]=!showCons[order._id];setShowCons({...showCons})}} style={showCons[order._id]?{background: '#ffb300'}:{}} className={classes.minibtn}>????????</div>
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
                                                    <div className={classes.nameField}>??????????????????????:&nbsp;</div>
                                                    <div className={classes.column}>
                                                        <div className={classes.row}>
                                                            <div className={classes.counterbtn} onClick={()=>{decrementConsignation(idx)}}>-</div>
                                                            <div className={classes.value}>{order.consignment}&nbsp;{order.item.unit&&order.item.unit.length>0?order.item.unit:'????'}</div>
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
                                                            ???????????????? ????????????????
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={classes.row}>
                                                    <div className={classes.nameField}>?????????????????? ??????????????????????:&nbsp;</div>
                                                    <div className={classes.value}>{order.consignmentPrice}&nbsp;??????</div>
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
                                ['admin', '????????????????????', '??????????????????????????????'].includes(profile.role)
                            )
                                return(
                                    <div key={order.item._id} className={classes.column}>
                                        <a href={`/item/${order.item._id}`} target='_blank'>
                                            <div className={classes.row}>
                                                <div className={classes.nameField}>??????????:&nbsp;</div>
                                                <div className={classes.value}>{order.item.name}</div>
                                            </div>
                                        </a>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>????????????????????{order.returned?' (????????./??????????)':''}:&nbsp;</div>
                                            <div className={classes.value}>{order.returned?`${order.count-order.returned} ${order.item.unit&&order.item.unit.length>0?order.item.unit:'????'}/${order.count} ${order.item.unit&&order.item.unit.length>0?order.item.unit:'????'}`:`${order.count} ${order.item.unit&&order.item.unit.length>0?order.item.unit:'????'}`}</div>
                                        </div>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>??????????{order.returned?' (????????./??????????)':''}:&nbsp;</div>
                                            <div className={classes.value}>
                                                {
                                                    order.returned?
                                                        `${checkFloat(order.allPrice/order.count*(order.count-order.returned))} ??????/${order.allPrice} ??????`
                                                        :
                                                        `${order.allPrice} ??????`
                                                }
                                            </div>
                                        </div>
                                        <div className={classes.row}>
                                            {profile.role!=='client'||element.organization.consignation?
                                                <div onClick={()=>{showCons[order._id]=!showCons[order._id];setShowCons({...showCons})}} style={showCons[order._id]?{background: '#ffb300'}:{}} className={classes.minibtn}>????????</div>
                                                :
                                                null
                                            }
                                            <div onClick={()=>{showReturn[order._id]=!showReturn[order._id];setShowReturn({...showReturn})}} style={showReturn[order._id]?{background: '#ffb300'}:{}} className={classes.minibtn}>??????????</div>
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
                                                            <div className={classes.nameField}>??????????????????????:&nbsp;</div>
                                                            <div className={classes.column}>
                                                                <div className={classes.row}>
                                                                    <div className={classes.counterbtn} onClick={()=>{decrementConsignation(idx)}}>-</div>
                                                                    <div className={classes.value}>{order.consignment}&nbsp;{order.item.unit&&order.item.unit.length>0?order.item.unit:'????'}</div>
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
                                                                    ???????????????? ????????????????
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className={classes.row}>
                                                            <div className={classes.nameField}>?????????????????? ??????????????????????:&nbsp;</div>
                                                            <div className={classes.value}>{order.consignmentPrice}&nbsp;??????</div>
                                                        </div>
                                                        </>
                                                        :null
                                                }
                                                {
                                                    showReturn[order._id] ?
                                                        <div className={classes.row}>
                                                            <div className={classes.nameField}>??????????:&nbsp;</div>
                                                            <div className={classes.column}>
                                                                <div className={classes.row}>
                                                                    <div className={classes.counterbtn} onClick={() => {
                                                                        decrementReturned(idx)
                                                                    }}>-
                                                                    </div>
                                                                    <div
                                                                        className={classes.value}>{order.returned}&nbsp;
                                                                        {order.item.unit&&order.item.unit.length>0?order.item.unit:'????'}
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
                                                                    ???????????????? ????????????????
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
                                                <div className={classes.nameField}>??????????:&nbsp;</div>
                                                <div className={classes.value}>{order.item.name}</div>
                                            </div>
                                        </a>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>????????????????????{order.returned?' (????????./??????????)':''}:&nbsp;</div>
                                            <div className={classes.value}>{order.returned?`${order.count-order.returned} ${order.item.unit&&order.item.unit.length>0?order.item.unit:'????'}/${order.count} ${order.item.unit&&order.item.unit.length>0?order.item.unit:'????'}`:`${order.count} ${order.item.unit&&order.item.unit.length>0?order.item.unit:'????'}`}</div>
                                        </div>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>??????????{order.returned?' (????????./??????????)':''}:&nbsp;</div>
                                            <div className={classes.value}>
                                                {
                                                    order.returned?
                                                        `${checkFloat(order.allPrice/order.count*(order.count-order.returned))}/${order.allPrice} ??????`
                                                        :
                                                        `${order.allPrice} ??????`
                                                }
                                            </div>
                                        </div>
                                        {
                                            order.consignment?
                                                <>
                                                <div className={classes.row}>
                                                    <div className={classes.nameField}>??????????????????????:&nbsp;</div>
                                                    <div className={classes.value}>{order.consignment}&nbsp;{order.item.unit&&order.item.unit.length>0?order.item.unit:'????'}</div>
                                                </div>
                                                <div className={classes.row}>
                                                    <div className={classes.nameField}>?????????????????? ??????????????????????:&nbsp;</div>
                                                    <div className={classes.value}>{order.consignmentPrice}&nbsp;??????</div>
                                                </div>
                                                </>
                                                :
                                                null
                                        }
                                        {
                                            order.returned?
                                                <>
                                                <div className={classes.row}>
                                                    <div className={classes.nameField}>??????????:&nbsp;</div>
                                                    <div className={classes.value}>{order.returned}&nbsp;{order.item.unit&&order.item.unit.length>0?order.item.unit:'????'}</div>
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
                {element.orders[0].status==='??????????????????'?<br/>:null}
                {
                    consignmentPrice?
                    <div>
                        <FormControlLabel
                            disabled={!(['admin', '????????????????????', '??????????????????????????????'].includes(profile.role)||allowOrganization)}
                            control={
                                <Checkbox
                                    checked={paymentConsignation}
                                    onChange={()=>{
                                        setPaymentConsignation(!paymentConsignation);
                                    }}
                                    color='primary'
                                />
                            }
                            label='?????????????????????? ????????????????'
                        />
                    </div>
                        :
                        null
                }
                <div>
                    <FormControlLabel
                        disabled=
                            {['admin', '????????????????????', '??????????????????????????????'].includes(profile.role)?
                                !['??????????????????','????????????'].includes(element.orders[0].status)
                                :
                                !(allowOrganization&&['??????????????????','????????????'].includes(element.orders[0].status))}
                        control={
                            <Checkbox
                                checked={taken}
                                onChange={()=>{
                                    setTaken(!taken);
                                }}
                                color='primary'
                            />
                        }
                        label='?????????? ????????????'
                    />
                </div>
                <div>
                    <FormControlLabel
                        disabled={
                            ['admin', '??????????????????????????????'].includes(profile.role)?
                                !['????????????????','????????????'].includes(element.orders[0].status)
                                :
                                !((allowOrganization||'????????????????????'===profile.role)&&'????????????'===element.orders[0].status)}
                        control={
                            <Checkbox
                                checked={confirmationForwarder}
                                onChange={()=>{
                                    setConfirmationForwarder(!confirmationForwarder);
                                }}
                                color='primary'
                            />
                        }
                        label='?????????? ??????????????????'
                    />
                </div>
                <div>
                    <FormControlLabel
                        disabled={
                            profile.role==='admin'?
                                !['????????????????','????????????'].includes(element.orders[0].status)
                                :
                                profile.role==='client'?
                                    '????????????'!==element.orders[0].status
                                    :
                                    true
                        }
                        control={
                            <Checkbox
                                checked={confirmationClient}
                                onChange={()=>{
                                    setConfirmationClient(!confirmationClient);
                                }}
                                color='primary'
                            />
                        }
                        label='?????????? ??????????????'
                    />
                </div>
                <div>
                    <FormControlLabel
                        disabled={(
                            ['admin', '????????????????????', '??????????????????????????????'].includes(profile.role)?
                                !['????????????','??????????????????'].includes(element.orders[0].status)
                                :
                                !(('client'===profile.role||allowOrganization)&&['????????????','??????????????????'].includes(element.orders[0].status))
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
                                    else if(['admin', '????????????????????', '??????????????????????????????'].includes(profile.role)){
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
                                '?????????? ??????????????'
                                :
                                `?????????? ?????????????? ${element.cancelClient?'????????????????':' ??????????????????????'}. ?????????????????????? ?????????? ???? ${element.cancelClient?pdDDMMYYHHMMCancel(element.cancelClient):pdDDMMYYHHMMCancel(element.cancelForwarder)}`
                        }
                    />
                </div>
                    <div>
                {
                    ((profile.role==='client'||allowOrganization||['??????????', '????????????????????'].includes(profile.role)||['admin', '????????????????????', '??????????????????????????????'].includes(profile.role)))?
                        <Button variant='contained' color='primary' onClick={()=>{
                            const action = async() => {
                                let invoice = {invoice: element._id, adss: adss.map(ads=>ads._id)}
                                if(element.taken!==taken)invoice.taken=taken;
                                if(element.confirmationClient!==confirmationClient) invoice.confirmationClient=confirmationClient;
                                if(element.confirmationForwarder!==confirmationForwarder) invoice.confirmationForwarder=confirmationForwarder;
                                if(element.cancelClient!==cancelClient) invoice.cancelClient=cancelClient;
                                if(element.cancelForwarder!==cancelForwarder) invoice.cancelForwarder=cancelForwarder;
                                if(element.paymentConsignation!==paymentConsignation) invoice.paymentConsignation=paymentConsignation;
                                await setInvoice(invoice)

                                let sendOrders = [];
                                if(changeOrders)
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
                                            allSize: order.allSize,
                                            status: order.status
                                        }
                                    })
                                let res = await setOrder({orders: sendOrders, invoice: element._id})
                                if (res&&list) {
                                    let _list = [...list]
                                    _list[idx] = res
                                    setList(_list)
                                }
                                showMiniDialog(false);
                            }
                            setMiniDialog('???? ???????????????', <Confirmation action={action}/>)
                        }} className={classes.button}>
                            ??????????????????
                        </Button>
                        :
                        null
                }
                <Button variant='contained' color='secondary' onClick={()=>{showMiniDialog(false);}} className={classes.button}>
                    ??????????????
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

Order.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(Order));
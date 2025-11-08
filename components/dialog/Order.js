import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {setOrder, setInvoice} from '../../src/gql/order'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import Button from '@material-ui/core/Button';
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import {
    pdDDMMYYHHMM,
    pdDDMMYYHHMMCancel,
    pdDDMMYYYYWW,
    checkFloat,
    isNotEmpty,
    getClientTitle,
    formatAmount, rowReverseDialog
} from '../../src/lib'
import Confirmation from './Confirmation'
import Geo from '../../components/dialog/Geo'
import OrderAdss from '../../components/dialog/OrderAdss'
import HistoryOrder from '../../components/dialog/HistoryOrder'
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {checkInt} from '../../redux/constants/other';

const editEmploymentRoles = ['экспедитор', 'admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент', 'суперэкспедитор']
const statusColor = {'обработка': 'orange', 'принят': 'blue', 'выполнен': 'green', 'отмена': 'red'}

const Order =  React.memo(
    (props) =>{
        const initialRender = useRef(true);
        const {isMobileApp} = props.app;
        const {profile, authenticated} = props.user;
        const {showSnackBar} = props.snackbarActions;
        const {showMiniDialog, setMiniDialog, showFullDialog, setFullDialog} = props.mini_dialogActions;
        const {classes, element, setList, idx} = props;
        const width = isMobileApp? (window.innerWidth-112) : 500;
        //в обработке
        const isProcessing = element.orders[0].status==='обработка'
        //isProcessingOrTaken
        const isProcessingOrTaken = ['обработка', 'принят'].includes(element.orders[0].status)
        //позиции
        let [orders, setOrders] = useState([...element.orders]);
        //акции
        let [adss, setAdss] = useState([...element.adss]);
        //общая цена
        let [allPrice, setAllPrice] = useState(element.allPrice);
        //тоннаж
        let [allTonnage, setAllTonnage] = useState(element.allTonnage);
        //отображать отказ
        let [showReturn, setShowReturn] = useState({});
        //накладная принята
        let [taken, setTaken] = useState(element.taken);
        //confirmation
        let [confirmationForwarder, setConfirmationForwarder] = useState(element.confirmationForwarder);
        let [confirmationClient, setConfirmationClient] = useState(element.confirmationClient);
        //cancel
        let [cancelForwarder, setCancelForwarder] = useState(!!element.cancelForwarder);
        let [cancelClient, setCancelClient] = useState(!!element.cancelClient);
        //заказ изменен
        let [changedOrders, setChangedOrders] = useState(false);
        //пересчет заказа
        const calculateOrder = ({idx, count, returned}) => {
            if(isNotEmpty(returned))
                orders[idx].returned = returned
            else if(isNotEmpty(count)) {
                orders[idx].allPrice = checkFloat(orders[idx].allPrice / orders[idx].count * count)
                orders[idx].count = count
                orders[idx].allTonnage = checkFloat(orders[idx].count * orders[idx].item.weight)
            }
            setOrders([...orders])

        }
        //count
        const addPackage = (idx) => calculateOrder({idx, count: (checkInt(orders[idx].count/orders[idx].item.packaging)+1)*orders[idx].item.packaging})
        let increment = (idx) => calculateOrder({idx, count: orders[idx].item.apiece?orders[idx].count+1:orders[idx].count+orders[idx].item.packaging})
        let decrement = (idx) => {
            let price = orders[idx].allPrice/orders[idx].count
            const decrementCount = orders[idx].item.apiece?1:orders[idx].item.packaging
            if(orders[idx].count>decrementCount) {
                if(profile.role!=='client'||!element.organization.minimumOrder||((allPrice-price*decrementCount)>=element.organization.minimumOrder))
                    calculateOrder({idx, count: orders[idx].count-decrementCount})
                else showSnackBar('Сумма не может быть меньше минимальной')
            }
        }
        //добавить упаковку на отказ
        let addReturnedPackage = (idx) => {
            let returned = (checkInt(orders[idx].returned / orders[idx].item.packaging) + 1) * orders[idx].item.packaging
            if(returned<=orders[idx].count)
                orders[idx].returned = returned
            else
                orders[idx].returned = orders[idx].count
            setOrders([...orders])
        }
        let incrementReturned = (idx) => {
            if(orders[idx].returned<orders[idx].count) {
                orders[idx].returned += 1
                setOrders([...orders])
            }
        }
        let decrementReturned  = (idx) => {
            if(orders[idx].returned>0) {
                orders[idx].returned -= 1
                setOrders([...orders])
            }
        }
        let remove = (idx) => {
            if(orders.length>1) {
                orders.splice(idx, 1)
                setOrders([...orders])
            } else
                showSnackBar('Товары не могут отсутствовать в заказе')
        }
        let [priceAfterReturn, setPriceAfterReturn] = useState(0);
        //пересчет общей цены
        const calculateAllPrice = () => {
            allTonnage = 0
            allPrice = 0
            for(const order of orders) {
                allPrice += order.allPrice
                allTonnage += order.allTonnage
            }
            setAllPrice(checkFloat(allPrice))
            setAllTonnage(checkFloat(allTonnage))
        }
        const calculatePriceAfterReturn = () => {
            priceAfterReturn = 0
            for(const order of orders) {
                priceAfterReturn += (order.allPrice-order.returned*(order.allPrice / order.count))
            }
            setPriceAfterReturn(checkFloat(priceAfterReturn))
        }
        useEffect(() => {
            calculatePriceAfterReturn()
            if(initialRender.current)
                initialRender.current = false
            else {
                setChangedOrders(true)
                calculateAllPrice()
            }
        }, [orders])
        return (
            <div className={classes.column} style={{width: width}}>
                <div className={classes.row}>
                    <div className={classes.nameField}>Заказ №:&nbsp;</div>
                    <div className={classes.value}>{element.number}</div>
                </div>
                <div className={classes.row}>
                    <div className={classes.nameField}>Статус:&nbsp;</div>
                    <div className={classes.value} style={{color: statusColor[element.orders[0].status]}}>{
                        element.orders[0].status==='принят'&&(element.confirmationForwarder||element.confirmationClient)&&!(element.confirmationForwarder&&element.confirmationClient)?
                            element.confirmationForwarder?
                                'доставлен поставщиком'
                                :
                                'подтвержден клиентом'
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
                    !profile.client?
                        <a>
                            <div style={{cursor: 'pointer'}} className={classes.row} onClick={() => {setMiniDialog('История', <HistoryOrder invoice={element._id}/>)}}>
                                <div className={classes.nameField}>Изменен:&nbsp;</div>
                                <div className={classes.value}>{`${pdDDMMYYHHMM(element.updatedAt)}${element.editor?`, ${element.editor}`:''}`}</div>
                            </div>
                        </a>
                        :
                        null
                }
                <div className={classes.row}>
                    <div className={classes.nameField}>Адрес: &nbsp;</div>
                    <div className={classes.value}>
                        {getClientTitle({address: [element.address]})}{element.city?` (${element.city})`:''}
                    </div>
                </div>
                <div className={classes.geo} style={{color: element.address[1]?'#ffb300':'red'}} onClick={() => {
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
                    element.agent?
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
                    isNotEmpty(element.track)&&!profile.client?
                        <div className={classes.row}>
                            <div className={classes.nameField}>Рейс:&nbsp;</div>
                            <div className={classes.value}>{element.track}</div>
                        </div>
                        :
                        null
                }
                {
                    element.forwarder?
                        <div className={classes.row}>
                            <div className={classes.nameField}>Экспедитор:&nbsp;</div>
                            <div className={classes.value}>{element.forwarder.name}</div>
                        </div>
                        :
                        null
                }

                <div
                    onClick={() => {
                        if(profile.role!=='client') {
                            setFullDialog('Акции', <OrderAdss invoice={element._id} organization={element.organization._id} setAdss={setAdss} adss={adss}/>)
                            showFullDialog(true)
                        }
                    }}
                    className={classes.row}>
                    <div className={classes.nameField}>Акции:&nbsp;</div>
                    <div style={{cursor: 'pointer', ...(!adss[0]?{color: 'red'}:{color: '#ffb300'})}}>
                        {adss.length?
                            adss.map((ads, idx) =>
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
                    <div className={classes.value}>{priceAfterReturn!==allPrice?`${formatAmount(priceAfterReturn)} сом/${formatAmount(allPrice)} сом`:`${formatAmount(allPrice)} сом`}</div>
                </div>
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
                {element.info?<div className={classes.row}>
                    <div className={classes.nameField}>Информация:&nbsp;</div>
                    <div className={classes.value}>{element.info}</div>
                </div>:null}
                <br/>
                <div className={classes.column}>
                    <b>{`Товары(${orders.length}):`}</b>
                    <br/>{!isProcessing?<br/>:null}
                    {
                        orders.map((order, idx) => {
                            const isLast = idx===(orders.length+1)
                            return <div key={order.item._id} className={classes.column}>
                                <div className={classes.row}>
                                    <div style={{display: 'flex', width: '100%', marginRight: 10}}>
                                        <div className={classes.nameField}>Товар:&nbsp;</div>
                                        <a href={`/item/${order.item._id}`} target='_blank'>
                                            <div className={classes.value}>{order.item.name}</div>
                                        </a>
                                    </div>
                                    {isProcessing?<Button onClick={() => remove(idx)} size='small' color='secondary'>
                                        Удалить
                                    </Button>:null}
                                </div>
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Количество{order.returned?' (факт./итого)':''}:&nbsp;</div>
                                    {
                                        isProcessing?
                                            <div className={classes.column}>
                                                <div className={classes.row}>
                                                    <div className={classes.counterbtn} onClick={() => decrement(idx)}>-</div>
                                                    <div className={classes.value}>{order.count}&nbsp;{order.item.unit||'шт'}</div>
                                                    <div className={classes.counterbtn} onClick={() => increment(idx)}>+</div>
                                                </div>
                                                {
                                                    orders[idx].item.apiece?
                                                        <div className={classes.addPackaging} style={{color: '#ffb300'}} onClick={() => {
                                                            addPackage(idx)
                                                        }}>
                                                            Добавить упаковку
                                                        </div>
                                                        :
                                                        <div className={classes.addPackaging} style={{color: '#ffb300'}}>
                                                            Упаковок: {(order.count/order.item.packaging)}
                                                        </div>
                                                }
                                            </div>
                                            :
                                            <div className={classes.value}>
                                                {`${order.returned?`${order.count-order.returned} ${order.item.unit||'шт'}/`:''}${order.count} ${order.item.unit||'шт'}`}
                                            </div>
                                    }
                                </div>
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Сумма{order.returned?' (факт./итого)':''}:&nbsp;</div>
                                    <div className={classes.value}>
                                        {`${order.returned?`${checkFloat(order.allPrice/order.count*(order.count-order.returned))} сом/`:''}${order.allPrice} сом`}
                                    </div>
                                </div>
                                {
                                    isProcessingOrTaken&&editEmploymentRoles.includes(profile.role)?
                                        <>
                                            {!isProcessing&&element.organization.refusal?
                                                <div onClick={() => {setShowReturn(showReturn => ({...showReturn, [order._id]: !showReturn[order._id]}))}} style={showReturn[order._id]?{background: '#ffb300'}:{}} className={classes.minibtn}>ОТКАЗ</div>
                                                :
                                                null
                                            }
                                            {showReturn[order._id]?<>
                                                <br/>
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
                                                                {order.item.unit?order.item.unit:'шт'}
                                                            </div>
                                                            <div className={classes.counterbtn} onClick={() => {
                                                                incrementReturned(idx)
                                                            }}>+
                                                            </div>
                                                        </div>
                                                        <div className={classes.addPackaging} style={{color: '#ffb300'}} onClick={() => {
                                                            addReturnedPackage(idx)
                                                        }}>
                                                            Добавить упаковку
                                                        </div>
                                                    </div>
                                                </div>
                                            </>:null}
                                        </>
                                        :
                                        order.returned?
                                            <>
                                                <div className={classes.row}>
                                                    <div className={classes.nameField}>Отказ:&nbsp;</div>
                                                    <div className={classes.value}>{order.returned}&nbsp;{order.item.unit?order.item.unit:'шт'}</div>
                                                </div>
                                            </>
                                            :
                                            null
                                }
                                {!isProcessing&&!isLast?<br/>:null}
                            </div>
                        })
                    }
                </div>
                {setList?<>
                    <div>
                        <FormControlLabel
                            disabled={changedOrders||!['обработка','принят'].includes(element.orders[0].status)||!editEmploymentRoles.includes(profile.role)}
                            control={
                                <Checkbox
                                    checked={taken}
                                    onChange={() => setTaken(!taken)}
                                    color='primary'
                                />
                            }
                            label='Заказ принят'
                        />
                    </div>
                    <div>
                        <FormControlLabel
                            disabled={changedOrders||element.orders[0].status!=='принят'||!['admin', 'суперэкспедитор', 'экспедитор'].includes(profile.role)}
                            control={
                                <Checkbox
                                    checked={confirmationForwarder}
                                    onChange={() => setConfirmationForwarder(!confirmationForwarder)}
                                    color='primary'
                                />
                            }
                            label='Заказ доставлен'
                        />
                    </div>
                    <div>
                        <FormControlLabel
                            disabled={changedOrders||element.orders[0].status!=='принят'||!['admin', 'client'].includes(profile.role)}
                            control={
                                <Checkbox
                                    checked={confirmationClient}
                                    onChange={() => setConfirmationClient(!confirmationClient)}
                                    color='primary'
                                />
                            }
                            label='Заказ получен'
                        />
                    </div>
                    <div>
                        <FormControlLabel
                            disabled={changedOrders||(
                                ['admin', 'суперагент', 'суперэкспедитор'].includes(profile.role)?
                                    !['отмена','обработка'].includes(element.orders[0].status)
                                    :
                                    !(['client', ...editEmploymentRoles].includes(profile.role)&&['отмена','обработка'].includes(element.orders[0].status))
                            )}
                            control={
                                <Checkbox
                                    checked={
                                        !!(element.cancelClient||element.cancelForwarder?
                                            element.cancelClient?
                                                cancelClient
                                                :
                                                cancelForwarder
                                            :
                                            'client'===profile.role?
                                                cancelClient
                                                :
                                                cancelForwarder)
                                    }
                                    onChange={() => {
                                        if('client'===profile.role) setCancelClient(!cancelClient);
                                        else if(['admin', 'суперагент', 'суперэкспедитор'].includes(profile.role)) {
                                            if(element.cancelClient)
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
                </>:null}
                <div style={rowReverseDialog(isMobileApp)}>
                    {
                        setList&&(profile.role==='client'||editEmploymentRoles.includes(profile.role))?
                            <Button variant='contained' color='primary' onClick={() => {
                                const action = async () => {
                                    if(!changedOrders) {
                                        let invoice = {invoice: element._id, adss: adss.map(ads => ads._id)}
                                        if(element.taken !== taken) invoice.taken = taken;
                                        if(element.confirmationClient !== confirmationClient) invoice.confirmationClient = confirmationClient;
                                        if(element.confirmationForwarder !== confirmationForwarder) invoice.confirmationForwarder = confirmationForwarder;
                                        if(element.cancelClient !== cancelClient) invoice.cancelClient = cancelClient;
                                        if(element.cancelForwarder !== cancelForwarder) invoice.cancelForwarder = cancelForwarder;
                                        await setInvoice(invoice)
                                    }
                                    let sendOrders = [];
                                    if(changedOrders) {
                                        sendOrders = orders.map((order) => {
                                            return {
                                                _id: order._id,
                                                name: order.item.name,
                                                returned: taken !== true ? 0 : order.returned,
                                                count: order.count,
                                                allPrice: order.allPrice,
                                                allTonnage: order.allTonnage,
                                                status: order.status
                                            }
                                        })
                                    }
                                    const res = await setOrder({orders: sendOrders, invoice: element._id})

                                    if(res&&setList) {
                                        setList(list => {
                                            list[idx] = res
                                            return [...list]
                                        })
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
                    <Button variant='contained' color='secondary' onClick={() => {showMiniDialog(false);}} className={classes.button}>
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

Order.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(Order));
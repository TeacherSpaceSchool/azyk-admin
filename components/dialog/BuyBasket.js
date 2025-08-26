import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addOrders } from '../../src/gql/order'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import * as appActions from '../../redux/actions/app'
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
import {dayStartDefault, formatAmount, getGeoDistance, unawaited} from '../../src/lib'
import { getDeliveryDate } from '../../src/gql/deliveryDate';
import { pdDDMMYYYYWW } from '../../src/lib';
import { putOfflineOrders } from '../../src/service/idb/offlineOrders';

const BuyBasket =  React.memo(
    (props) =>{
        const {isMobileApp} = props.app;
        const {profile} = props.user;
        const {client, allPrice, organization, adss, agent, basket, geo, classes} = props;
        const {showMiniDialog} = props.mini_dialogActions;
        const {showSnackBar} = props.snackbarActions;
        const {showLoad} = props.appActions;
        const width = isMobileApp? (window.innerWidth-112) : 500
        let [info, setInfo] = useState('');
        let [inv, setInv] = useState(false);
        let handleInfo =  (event) => {
            setInfo(event.target.value)
        };
        let [paymentMethod, setPaymentMethod] = useState('Наличные');
        let [dateDelivery, setDateDelivery] = useState(null);
        let handleDateDelivery =  (event) => {
            setDateDelivery(event.target.value)
        };
        let [deliveryDays, setDeliveryDays] = useState([true, true, true, true, true, true, false]);
        let [week, setWeek] = useState([]);
        const unlock = useRef(true);
        let paymentMethods = ['Наличные', 'Перечисление', 'Консигнация']
        let handlePaymentMethod =  (event) => {
            setPaymentMethod(event.target.value)
        };
        useEffect(() => {
            (async () => {
                if(unlock.current) {
                    unlock.current = false
                    for(const key in basket) unawaited(() => addBasket({item: basket[key]._id, count: basket[key].count}))
                    const deliveryDate = await getDeliveryDate({client: client._id, organization: organization._id})
                    if(deliveryDate) {
                        deliveryDays = deliveryDate.days
                        /*if(!agent)
                            deliveryDays[6] = false*/
                        setDeliveryDays([...deliveryDays])
                    }
                    for (let i = 0; i < 7; i++) {
                        let day = new Date()
                        if(day.getHours()>=dayStartDefault)
                            day.setDate(day.getDate()+1)
                        day.setDate(day.getDate()+i)
                        day.setHours(dayStartDefault, 0, 0, 0)
                        let dayWeek = day.getDay() === 0 ? 6 : (day.getDay() - 1)
                        week[dayWeek] = day
                        if(!dateDelivery&&deliveryDays[dayWeek]) {
                            dateDelivery = day
                            setDateDelivery(dateDelivery)
                        }
                    }
                    setWeek([...week])
                    unlock.current = true
                }
            })()
        }, [])
        return (
            <div className={classes.main}>
                {
                    adss&&adss.length?
                        <>
                        <Link href={`/ads/${organization._id}`}>
                            <div onClick={() => {showMiniDialog(false)}} className={classes.showAds} style={{width: width}}>
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
                    value={info}
                    className={isMobileApp?classes.inputM:classes.inputD}
                    onChange={handleInfo}
                />
                <br/>
                {
                    week.length?
                        <>
                        <FormControl style={{width: width}} className={isMobileApp?classes.inputM:classes.inputD}>
                            <InputLabel>День доставки</InputLabel>
                            <Select value={dateDelivery} onChange={handleDateDelivery}>
                                {week.map((element, idx) => {
                                    if(deliveryDays[idx])
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
                                {paymentMethods.map((element) =>
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
                        <div style={{width: width}} className={classes.itogo}><b>Минимальный заказ:</b>&nbsp;{formatAmount(organization.minimumOrder)}&nbsp;сом</div>
                        </>
                        :null
                }
                {
                    agent||['A','Horeca'].includes(client.category)?
                        <FormControlLabel
                            style={{width: width}}
                            onChange={(e) => {
                                setInv(e.target.checked)
                            }}
                            control={<Checkbox/>}
                            label={'Cчет фактура'}
                        />
                        :
                        null
                }
                <div style={{width: width}} className={classes.itogo}><b>Итого:</b>&nbsp;{formatAmount(allPrice)} сом</div>
                <br/>
                <div>
                    <Button variant='contained' color='primary' onClick={async () => {
                        if(unlock.current) {
                            unlock.current = false
                            if(agent || !organization.minimumOrder || organization.minimumOrder<=allPrice) {
                               if(paymentMethod.length) {
                                   showMiniDialog(false);
                                   showLoad(true)
                                   sessionStorage.catalog = '{}'
                                   sessionStorage.removeItem('catalogID')
                                   sessionStorage.removeItem('client')
                                   if(navigator.onLine) {
                                       if(agent&&geo&&client.address[0][1].includes(', ')) {
                                           let distance = getGeoDistance(geo.coords.latitude, geo.coords.longitude, ...(client.address[0][1].split(', ')))
                                           if(distance<1000) {
                                               unawaited(() => addAgentHistoryGeo({client: client._id, geo: `${geo.coords.latitude}, ${geo.coords.longitude}`}))
                                           }
                                       }
                                       await addOrders({
                                           inv,
                                           unite: organization.unite,
                                           info,
                                           paymentMethod,
                                           organization: organization._id,
                                           client: client._id,
                                           dateDelivery
                                       })
                                       Router.push('/orders')
                                   }
                                   else if(profile.role.includes('агент')) {
                                       await putOfflineOrders({
                                           ...(geo?{geo: {latitude: geo.coords.latitude, longitude: geo.coords.longitude}}:{}),
                                           inv,
                                           unite: organization.unite,
                                           info,
                                           paymentMethod,
                                           organization: organization._id,
                                           client: client._id,
                                           dateDelivery,
                                           basket,
                                           address: client.address[0],
                                           name: client.name,
                                           allPrice: `${formatAmount(allPrice)} сом`
                                       })
                                       Router.push('/statistic/tools/offlineorder')
                                   }
                                   showLoad(false)
                               }
                               else
                                   showSnackBar('Заполните все поля')
                            }
                            else {
                                showSnackBar('Сумма заказа должна быть выше минимальной')
                            }
                            unlock.current = true
                        }
                        else {
                            showSnackBar('Подождите...')
                        }
                    }} className={classes.button}>
                        Купить
                    </Button>
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
        appActions: bindActionCreators(appActions, dispatch),
    }
}

BuyBasket.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(BuyBasket));
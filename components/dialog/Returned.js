import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setReturned } from '../../src/gql/returned'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import Button from '@material-ui/core/Button';
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import {pdDDMMYYHHMM, checkFloat, pdDDMMYYYYWW, getClientTitle, formatAmount, rowReverseDialog} from '../../src/lib'
import Confirmation from './Confirmation'
import Geo from '../../components/dialog/Geo'
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const Returned =  React.memo(
    (props) =>{
        const {isMobileApp} = props.app;
        const {profile, authenticated} = props.user;
        const {showMiniDialog, setMiniDialog, showFullDialog, setFullDialog} = props.mini_dialogActions;
        const {classes, element, setList, idx} = props;
        let [allPrice, setAllPrice] = useState(element.allPrice);
        let [items, setItems] = useState(element.items);
        let [allTonnage, setAllTonnage] = useState(element.allTonnage);
        let [confirmationForwarder, setConfirmationForwarder] = useState(element.confirmationForwarder);
        let [cancelForwarder, setCancelForwarder] = useState(element.cancelForwarder);
        const width = isMobileApp? (window.innerWidth-112) : 500;
        const {showSnackBar} = props.snackbarActions;
        const statusColor = {
            'обработка': 'orange',
            'принят': 'green',
            'отмена': 'red'
        } //подсчет общей суммы
        useEffect(() => {
            allTonnage=0
            allPrice=0
            for(let i=0; i<items.length; i++) {
                allPrice+=items[i].allPrice
                allTonnage+=items[i].allTonnage
            }
            setAllPrice(checkFloat(allPrice))
            setAllTonnage(checkFloat(allTonnage))
        }, [items])
        //увеличение
        let increment = (idx) => {
            items[idx].count+=1
            items[idx].allPrice = checkFloat(items[idx].price * items[idx].count)
            items[idx].allTonnage = checkFloat(items[idx].count * items[idx].weight)
            setItems(items => [...items])
        }
        //уменьшение
        let decrement = (idx) => {
            if(items[idx].count>1) {
                items[idx].count -= 1
                items[idx].allPrice = checkFloat(items[idx].price * items[idx].count)
                items[idx].allTonnage = checkFloat(items[idx].count * items[idx].weight)
                setItems(items => [...items])
            }
        }
        //удаление
        let remove = (idx) => {
            if(items.length>1) {
                items.splice(idx, 1)
                setItems([...items])
            } else
                showSnackBar('Товары не могут отсутствовать в заказе')
        }
        //статус
        const status = element.cancelForwarder?'отмена':element.confirmationForwarder?'принят':'обработка'
        return (
            <div className={classes.column} style={{width: width}}>
                <div className={classes.row}>
                    <div className={classes.nameField}>Возврат №:&nbsp;</div>
                    <div className={classes.value}>{element.number}</div>
                </div>
                <div className={classes.row}>
                    <div className={classes.nameField}>Статус:&nbsp;</div>
                    <div className={classes.value} style={{color: statusColor[status]}}>{status}</div>
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
                    <div className={classes.nameField}>Время возврата: &nbsp;</div>
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
                <div className={classes.row}>
                    <div className={classes.nameField}>Изменен:&nbsp;</div>
                    <div className={classes.value}>{pdDDMMYYHHMM(element.updatedAt)}</div>
                </div>
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
                        <div className={classes.nameField}>Клиент:&nbsp;</div>
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
                                <div className={classes.nameField}>Агент:&nbsp;</div>
                                <div className={classes.value}>{element.agent.name}</div>
                            </div>
                        </a>
                        :
                        null
                }
                <div className={classes.row}>
                    <div className={classes.nameField}>Сумма:&nbsp;</div>
                    <div className={classes.value}>{formatAmount(allPrice)}&nbsp;сом</div>
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
                    <div className={classes.nameField}>Информация:&nbsp;</div>
                    <div className={classes.value}>{element.info}</div>
                </div>
                <br/>
                <div className={classes.column}>
                    <b>{`Товары(${items.length}):`}</b>
                    {status!=='обработка'?<><br/><br/></>:null}
                    {
                        items.map((item, idx) => {
                            if(status==='обработка')
                                return(
                                    <div key={item._id} className={classes.column}>
                                        <div className={classes.row}>
                                            <div style={{display: 'flex', width: '100%', marginRight: 10}}>
                                                <div className={classes.nameField}>Товар:&nbsp;</div>
                                                <a href={`/item/${item._id}`} target='_blank'>
                                                    <div className={classes.value}>{item.item}</div>
                                                </a>
                                            </div>
                                            <Button onClick={() => remove(idx)} size='small' color='secondary'>
                                                Удалить
                                            </Button>
                                        </div>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>Количество:&nbsp;</div>
                                            <div className={classes.column}>
                                                <div className={classes.row}>
                                                    <div className={classes.counterbtn} onClick={() => decrement(idx)}>-</div>
                                                    <div className={classes.value}>{item.count}&nbsp;шт</div>
                                                    <div className={classes.counterbtn} onClick={() => increment(idx)}>+</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>Общая стоимость:&nbsp;</div>
                                            <div className={classes.value}>{formatAmount(item.allPrice)}&nbsp;сом</div>
                                        </div>
                                     </div>
                                )
                            else
                                return(
                                    <div key={item._id} className={classes.column}>
                                        <a href={`/item/${item._id}`} target='_blank'>
                                            <div className={classes.row}>
                                                <div className={classes.nameField}>Товар:&nbsp;</div>
                                                <div className={classes.value}>{item.item}</div>
                                            </div>
                                        </a>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>Количество:&nbsp;</div>
                                            <div className={classes.value}>{formatAmount(item.count)} шт</div>
                                        </div>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>Сумма:&nbsp;</div>
                                            <div className={classes.value}>
                                                {formatAmount(item.allPrice)} сом
                                            </div>
                                        </div>
                                        <br/>
                                    </div>
                                )
                        })
                    }
                </div>
                {status==='обработка'?<br/>:null}
                <div>
                    <FormControlLabel
                        disabled={!['обработка', 'принят'].includes(status)}
                        control={
                            <Checkbox
                                checked={confirmationForwarder}
                                onChange={() => setConfirmationForwarder(!confirmationForwarder)}
                                color='primary'
                            />
                        }
                        label='Возврат принят'
                    />
                </div>
                <div>
                    <FormControlLabel
                        disabled={!['обработка', 'отмена'].includes(status)}
                        control={
                            <Checkbox
                                checked={cancelForwarder}
                                onChange={() => setCancelForwarder(!cancelForwarder)}
                                color='secondary'
                            />
                        }
                        label={
                            !element.cancelForwarder?
                                'Возврат отменен'
                                :
                                `Возврат отменен. Востановить возврат`
                        }
                    />
                </div>
                <div style={rowReverseDialog(isMobileApp)}>
                    <Button variant='contained' color='primary' onClick={() => {
                            const action = async () => {
                                let returned = {returned: element._id}
                                if(element.confirmationForwarder!==confirmationForwarder) returned.confirmationForwarder=confirmationForwarder;
                                if(element.cancelForwarder!==cancelForwarder) returned.cancelForwarder=cancelForwarder;
                                for(let i=0; i<items.length; i++) {
                                    delete items[i].__typename
                                }
                                let res = await setReturned({items: items, ...returned})
                                if(res)
                                    setList(list => {
                                        list[idx] = res
                                        return [...list]
                                    })
                                showMiniDialog(false);
                            }
                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                        }} className={classes.button}>
                            Сохранить
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
    }
}

Returned.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(Returned));
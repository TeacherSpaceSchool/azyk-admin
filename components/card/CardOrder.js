import React from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import cardOrderStyle from '../../src/styleMUI/orders/cardOrder'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import {formatAmount, getClientTitle, pdDDMMYYHHMM, pdDDMMYYYYWW} from '../../src/lib'
import Order from '../dialog/Order'
import Confirmation from '../../components/dialog/Confirmation'
import { deleteOrders } from '../../src/gql/order'
import SyncOn from '@material-ui/icons/Sync';
import SyncOff from '@material-ui/icons/SyncDisabled';
import {getOrder} from '../../src/gql/order'

const CardOrder = React.memo((props) => {
    const classes = cardOrderStyle();
    const {element, setList, route, idx} = props;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {profile, authenticated} = props.user;
    const {isMobileApp} = props.app;
    const status =
        element.taken?'принят':element.cancelForwarder||element.cancelClient?'отмена':element.confirmationForwarder&&element.confirmationClient?'выполнен':'обработка'
    const statusColor = {
        'обработка': 'orange',
        'принят': 'blue',
        'выполнен': 'green',
        'отмена': 'red'
    }
    return (
        <Card className={isMobileApp?classes.cardM:classes.cardD}>
            {
                ['admin', 'организация', 'суперорганизация', 'экспедитор', 'суперагент', 'менеджер', 'агент'].includes(profile.role)?
                    [1,2].includes(element.sync)?
                        <SyncOn style={{color: element.sync===1?'orange':'green'}} className={classes.sync}/>
                        :
                        <SyncOff color='secondary' className={classes.sync}/>
                    :
                    null
            }
            <CardActionArea onClick={async () => {
                let _element = await getOrder(element._id)
                if(_element) {
                    setMiniDialog('Заказ', <Order idx={idx} route={route} element={_element} setList={setList}/>);
                    showMiniDialog(true)
                }
            }}>
                <CardContent className={classes.column}>
                    <div className={classes.row}>
                        <div className={classes.number}>{element.number}</div>&nbsp;
                        <div className={classes.status} style={{background: statusColor[status]}}>{
                            element.confirmationForwarder||element.confirmationClient?
                                element.confirmationClient?
                                    'подтвержден клиентом'
                                    :
                                    element.confirmationForwarder?
                                        'доставлен поставщиком'
                                        :
                                        status
                                :
                                status
                        }</div>
                    </div>
                    <div className={classes.row}>
                        <div className={classes.nameField}>Время заказа:&nbsp;</div>
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
                        ['admin', 'организация', 'менеджер'].includes(profile.role)&&element.updatedAt!==element.createdAt?
                            <div className={classes.row}>
                                <div className={classes.nameField}>Изменен:&nbsp;</div>
                                <div className={classes.value} style={{whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'}}>{`${pdDDMMYYHHMM(element.updatedAt)}${element.editor?`, ${element.editor}`:''}`}</div>
                            </div>
                            :
                            null
                    }
                    <div className={classes.row}>
                        <div className={classes.nameField}>Адрес:&nbsp;</div>
                        <div style={{color: element.address[1]?'rgba(0, 0, 0, 0.87)':'red'}} className={classes.value}>
                            {getClientTitle({address: [element.address]})}{element.city?` (${element.city})`:''}
                        </div>
                    </div>
                    {element.client.name!==element.address[2]?<div className={classes.row}>
                        <div className={classes.nameField}>Получатель:&nbsp;</div>
                        <div className={classes.value}>{element.client.name}</div>
                    </div>:null}
                    <div className={classes.row}>
                        <div className={classes.nameField}>Организация:&nbsp;</div>
                        <div className={classes.value}>{element.organization.name}</div>
                    </div>
                    {
                        ['агент', 'организация', 'менеджер', 'admin'].includes(profile.role)&&element.district?
                            <div className={classes.row}>
                                <div className={classes.nameField}>Район: &nbsp;</div>
                                <div className={classes.value}>{element.district}</div>
                            </div>
                            :
                            null
                    }
                    {
                        element.agent?
                            <div className={classes.row}>
                                <div className={classes.nameField}>Агент: &nbsp;</div>
                                <div className={classes.value}>{element.agent.name}</div>
                            </div>
                            :
                            null
                    }
                    {
                        element.forwarder?
                            <div className={classes.row}>
                                <div className={classes.nameField}>Экспедитор:&nbsp;</div>
                                <div className={classes.value}>{`${element.forwarder.name}, р${element.track}`}</div>
                            </div>
                            :
                            null
                    }
                    {
                        element.adss&&element.adss.length?
                            <div className={classes.row}>
                                <div className={classes.nameField}>Акции:&nbsp;</div>
                                <div>
                                    {element.adss.map((ads, idx)=>
                                        idx<4?
                                            <div key={`ads${idx}`} className={classes.value}>
                                                {ads.title}
                                            </div>
                                            :
                                            idx===4?
                                                '...'
                                                :
                                                null
                                    )}
                                </div>
                            </div>
                            :
                            null
                    }
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
                        <div className={classes.nameField}>Сумма{element.returnedPrice?' (факт./итого)':''}:</div>
                        <div className={classes.value}>
                            {element.returnedPrice?`${formatAmount(element.allPrice-element.returnedPrice)} сом/${formatAmount(element.allPrice)} сом`:`${formatAmount(element.allPrice)} сом`}
                        </div>
                    </div>
                    {
                        authenticated&&profile.role!=='client'?
                            <>
                            {
                                element.allTonnage?
                                    <div className={classes.row}>
                                        <div className={classes.nameField}>Тоннаж:&nbsp;</div>
                                        <div className={classes.value}>{element.allTonnage}&nbsp;кг</div>
                                    </div>
                                    :
                                    null
                            }
                            </>
                        :
                            null
                    }
                </CardContent>
            </CardActionArea>
            <CardActions>
                {
                    element.del!=='deleted'&&status==='отмена'&&profile.role==='admin' ?
                        <Button onClick={() => {
                            const action = async () => {
                                await deleteOrders([element._id])
                                setList(list => {
                                    list.splice(list.indexOf(element), 1)
                                    return [...list]
                                })
                            }
                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                            showMiniDialog(true)
                        }} size='small' color='secondary'>
                            Удалить
                        </Button>
                        :
                        null
                }
            </CardActions>
        </Card>
    );
})

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardOrder)
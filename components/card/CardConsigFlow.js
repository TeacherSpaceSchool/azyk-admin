import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cardStyle from '../../src/styleMUI/subbrand/cardSubbrand'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import {formatAmount, getClientTitle, pdDDMMYYHHMM} from '../../src/lib';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import {getHistories} from '../../src/gql/history';
import History from '../dialog/History';
import {getOrder} from '../../src/gql/order';
import Order from '../dialog/Order';
import {setConsigFlow} from '../../src/gql/consigFlow';
import Confirmation from '../dialog/Confirmation';
import AddConsigFlow from '../dialog/AddConsigFlow';
import Link from 'next/link';
import {useRouter} from 'next/router';

const CardStock = React.memo((props) => {
    const router = useRouter();
    const classes = cardStyle();
    //props
    const {element} = props;
    const {profile} = props.user;
    const {isMobileApp} = props.app;
    const {showMiniDialog, setMiniDialog} = props.mini_dialogActions;
    //render
    return (
        <div>
            <Card className={isMobileApp?classes.cardM:classes.cardD}>
                <CardContent>
                    <div className={classes.row}>
                        <div className={classes.nameField}>Создан:&nbsp;</div>
                        <div className={classes.value}>{pdDDMMYYHHMM(element.createdAt)}</div>
                    </div>
                    <Link href={'/client/[id]'} as={`/client/${element.client._id}`}>
                        <a>
                            <div className={classes.row}>
                                <div className={classes.nameField}>Клиент:&nbsp;</div>
                                <div className={classes.value}>{getClientTitle(element.client)}</div>
                            </div>
                        </a>
                    </Link>
                    <div className={classes.row}>
                        <div className={classes.nameField}>Сумма:&nbsp;</div>
                        <div className={classes.value}>{formatAmount(element.amount*element.sign)} сом</div>
                    </div>
                    {element.invoice?
                        <div className={classes.row}>
                            <div className={classes.nameField}>Заказ:&nbsp;</div>
                            <div className={classes.value} style={{cursor: 'pointer', color: '#ffb300'}} onClick={async () => {
                                let _element = await getOrder(element.invoice._id)
                                if(_element) {
                                    setMiniDialog('Заказ', <Order element={_element}/>);
                                    showMiniDialog(true)
                                }
                            }}>{element.invoice.number}</div>
                        </div>:null}
                </CardContent>
                <CardActions>
                    {!element.invoice?<>
                        {['admin', 'суперорганизация', 'организация', 'менеджер'].includes(profile.role)?<Button onClick={async () => {
                            const histories = await getHistories({search: element._id, filter: 'ConsigFlowAzyk'});
                            setMiniDialog('История', <History list={histories}/>);
                            showMiniDialog(true)
                        }}>История</Button>:null}
                        {['суперорганизация', 'организация', 'менеджер', 'агент'].includes(profile.role)&&!element.cancel?<Button style={{color: 'red'}} onClick={async () => {
                            const action = async () => {
                                await setConsigFlow({_id: element._id, cancel: true})
                                router.reload()
                            }
                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                            showMiniDialog(true)
                        }}>Отмена</Button>:null}
                    </>:null}
                    {['суперорганизация', 'организация', 'менеджер', 'агент'].includes(profile.role)&&!element.cancel&&element.sign===1?<Button onClick={() => {
                        setMiniDialog('Оплатить', <AddConsigFlow initialClient={element.client._id} initialAmount={element.amount}/>)
                        showMiniDialog(true)
                    }}>Оплатить</Button>:null}
                </CardActions>
            </Card>
        </div>
    );
})

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardStock)
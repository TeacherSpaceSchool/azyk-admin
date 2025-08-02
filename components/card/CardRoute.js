import React from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import cardRouteStyle from '../../src/styleMUI/route/cardRoute'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import { deleteRoute } from '../../src/gql/route'
import Link from 'next/link';
import { pdDDMMYYYYWW } from '../../src/lib'
import Confirmation from '../dialog/Confirmation'

const CardOrder = React.memo((props) => {
    const classes = cardRouteStyle();
    const {element, setList, idx} = props;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {profile} = props.user;
    const {isMobileApp} = props.app;
    const statusColor = {
        'создан': 'orange',
        'выполняется': 'blue',
        'выполнен': 'green',
    }
    return (
        <Card className={isMobileApp?classes.cardM:classes.cardD}>
        <Link href='/route/[id]' as={`/route/${element._id}`}>
                <CardActionArea>
                    <CardContent className={classes.column}>
                        <div className={classes.row}>
                            <div className={classes.nameField}>Номер:&nbsp;</div>
                            <div className={classes.value}>{element.number}</div>
                            <div className={classes.status} style={{background: statusColor[element.status]}}>{element.status}</div>
                        </div>
                        <div className={classes.row}>
                            <div className={classes.nameField}>Дата развозки:&nbsp;</div>
                            <div className={classes.value}>{pdDDMMYYYYWW(element.dateDelivery)}</div>
                        </div>
                        <div className={classes.row}>
                            <div className={classes.nameField}>Заказов:&nbsp;</div>
                            <div className={classes.value}>{element.selectedOrders.length}</div>
                        </div>
                        {
                            element.selectEcspeditor?
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Экспедитор:&nbsp;</div>
                                    <div className={classes.value}>{element.selectEcspeditor.name}</div>
                                </div>
                                :null
                        }
                    </CardContent>
                </CardActionArea>
            </Link>
            <CardActions>
                {
                    !['экспедитор', 'суперэкспедитор'].includes(profile.role)?
                        <Button onClick={async () => {
                            const action = async () => {
                                await deleteRoute({_id: element._id, selectedOrders: element.selectedOrders?element.selectedOrders.map(element=>element._id):[]})
                                setList(list => {
                                    list.splice(idx, 1);
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
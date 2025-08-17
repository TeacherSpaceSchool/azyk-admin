import React  from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import cardEquipmentStyle from '../../src/styleMUI/equipment/cardEquipment'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import Confirmation from '../../components/dialog/Confirmation'
import {deleteRepairEquipment} from '../../src/gql/repairEquipment';
import Link from 'next/link';
import {getClientTitle, pdDDMMYYYY} from '../../src/lib'

const CardRepairEquipment = React.memo((props) => {
    const classes = cardEquipmentStyle();
    const {element, setList, idx} = props;
    const {isMobileApp} = props.app;
    const {profile} = props.user;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const statusColor = {
        'обработка': 'orange',
        'принят': 'blue',
        'выполнен': 'green',
        'отмена': 'red'
    }
    return (
           <Card className={isMobileApp?classes.cardM:classes.cardD}>
                <Link href='/repairequipment/[id]' as={`/repairequipment/${element._id}`}>
                <CardActionArea>
                    <CardContent>
                        <div className={classes.status} style={{background: statusColor[element.status]}}>
                            {element.status}
                        </div>
                        <div className={classes.row}>
                            <div className={classes.nameField}>Дата подачи:&nbsp;</div>
                            <div className={classes.value}>{pdDDMMYYYY(element.createdAt)}</div>
                        </div>
                        {
                            element.dateRepair?
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Дата ремонта:&nbsp;</div>
                                    <div className={classes.value}>{pdDDMMYYYY(element.dateRepair)}</div>
                                </div>
                                :
                                null
                        }
                        <div className={classes.row}>
                            <div className={classes.nameField}>
                                Номер:&nbsp;
                            </div>
                            <div className={classes.value}>
                                {element.number}
                            </div>
                        </div>
                        <div className={classes.row}>
                            <div className={classes.nameField}>
                                Оборудование:&nbsp;
                            </div>
                            <div className={classes.value}>
                                {element.equipment}
                            </div>
                        </div>
                        {
                            element.client?
                                <div className={classes.row}>
                                    <div className={classes.nameField}>
                                        Клиент:&nbsp;
                                    </div>
                                    <div className={classes.value}>
                                        {getClientTitle(element.client)}
                                    </div>
                                </div>
                                :null
                        }
                        {
                            element.agent?
                                <div className={classes.row}>
                                    <div className={classes.nameField}>
                                        Агент:&nbsp;
                                    </div>
                                    <div className={classes.value}>
                                        {element.agent.name}
                                    </div>
                                </div>
                                :
                                null
                        }
                        {
                            element.repairMan?
                                <div className={classes.row}>
                                    <div className={classes.nameField}>
                                        Ремонтник:&nbsp;
                                    </div>
                                    <div className={classes.value}>
                                        {element.repairMan.name}
                                    </div>
                                </div>
                                :
                                null
                        }

                    </CardContent>
                </CardActionArea>
                </Link>
                    {
                        ['суперорганизация', 'организация', 'агент', 'admin', 'суперагент'].includes(profile.role)&&element.status==='отмена' ?
                            <CardActions>
                                <Button onClick={async () => {
                                    const action = async () => {
                                        await deleteRepairEquipment(element._id)
                                        setList(list => {
                                            list.splice(idx, 1)
                                            return [...list]
                                        })
                                    }
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                }} size='small' color='secondary'>
                                    Удалить
                                </Button>
                            </CardActions>
                            :
                            null
                    }
            </Card>
    );
})

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardRepairEquipment)
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
import { deleteDistrict } from '../../src/gql/district'
import Link from 'next/link';
import Confirmation from '../dialog/Confirmation'

const CardDistrict = React.memo((props) => {
    const classes = cardRouteStyle();
    const {element, setList, idx} = props;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {profile} = props.user;
    const {isMobileApp} = props.app;
    return (
        <Card className={isMobileApp?classes.cardM:classes.cardD}>
            <Link href='/district/[id]' as={`/district/${element?element._id:'new'}`}>
                <CardActionArea>
                    <CardContent className={classes.column}>
                        <div className={classes.row}>
                            <div className={classes.number}>{element.name}</div>
                        </div>
                        <div className={classes.row}>
                            <div className={classes.nameField}>Организация:&nbsp;</div>
                            <div className={classes.value}>{element.organization?element.organization.name:'AZYK.STORE'}</div>
                        </div>
                        {
                            element.manager?
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Менеджер:&nbsp;</div>
                                    <div className={classes.value}>{element.manager.name}</div>
                                </div>
                                :
                                null
                        }
                        {
                            element.agent?
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Агент:&nbsp;</div>
                                    <div className={classes.value}>{element.agent.name}</div>
                                </div>
                                :
                                null
                        }
                        {
                            element.ecspeditor?
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Экспедитор:&nbsp;</div>
                                    <div className={classes.value}>{element.ecspeditor.name}</div>
                                </div>
                                :
                                null
                        }
                        <div className={classes.row}>
                            <div className={classes.nameField}>Точек:&nbsp;</div>
                            <div className={classes.column}>
                                {element.client.length}
                            </div>
                        </div>
                    </CardContent>
                </CardActionArea>
            </Link>
            <CardActions>
                {
                    ['суперорганизация', 'организация', 'admin'].includes(profile.role)?
                        <Button onClick={async () => {
                            const action = async () => {
                                await deleteDistrict(element._id)
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

export default connect(mapStateToProps, mapDispatchToProps)(CardDistrict)
import React from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import cardRouteStyle from '../../src/styleMUI/agentRoute/cardAgentRoute'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import { deleteAgentRoute } from '../../src/gql/agentRoute'
import Link from 'next/link';
import Confirmation from '../dialog/Confirmation'

const CardAgentRoute = React.memo((props) => {
    const classes = cardRouteStyle();
    const {element, setList, idx} = props;
    const {isMobileApp} = props.app;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {profile} = props.user;
    return (
        <Card className={isMobileApp?classes.cardM:classes.cardD}>
            <Link href='/agentroute/[id]' as={`/agentroute/${element?element._id:'new'}`}>
                <CardActionArea>
                    <CardContent className={classes.column}>
                        <div className={classes.row}>
                            <div className={classes.number}>{element.district&&element.district.name}</div>
                        </div>
                        <div className={classes.row}>
                            <div className={classes.nameField}>Организация:&nbsp;</div>
                            <div className={classes.value}>{element.organization?element.organization.name:'AZYK.STORE'}</div>
                        </div>
                    </CardContent>
                </CardActionArea>
            </Link>
            <CardActions>
                {
                    ['суперорганизация', 'организация', 'менеджер', 'admin'].includes(profile.role)?
                        <Button onClick={() => {
                            const action = async () => {
                                await deleteAgentRoute(element._id)
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
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardAgentRoute)
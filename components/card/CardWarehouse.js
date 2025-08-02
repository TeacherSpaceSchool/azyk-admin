import React, {useState} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cardStyle from '../../src/styleMUI/subbrand/cardSubbrand'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import TextField from '@material-ui/core/TextField';
import Confirmation from '../dialog/Confirmation';
import {addWarehouse, deleteWarehouse, setWarehouse} from '../../src/gql/warehouse';

const CardWarehouse = React.memo((props) => {
    const classes = cardStyle();
    const {element, setList, organization, idx} = props;
    const {isMobileApp} = props.app;
    //addCard
    let [name, setName] = useState(element?element.name:'');
    let [guid, setGuid] = useState(element?element.guid:'');
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    return (
        <div>
            <Card className={isMobileApp?classes.cardM:classes.cardD}>
                    <CardContent>
                        <TextField
                            label='GUID'
                            value={guid}
                            className={classes.input}
                            onChange={ event => setGuid(event.target.value) }
                        />
                        <TextField
                            error={!name}
                            label='Название'
                            value={name}
                            className={classes.input}
                            onChange={ event => setName(event.target.value) }
                        />
                    </CardContent>
                <CardActions>
                    {
                        element?
                            <>
                                <Button onClick={async () => {
                                    if(name) {
                                        const action = async () => await setWarehouse({_id: element._id, name, guid})
                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                        showMiniDialog(true)
                                    }
                                }} size='small' color='primary'>
                                    Сохранить
                                </Button>
                                <Button size='small' color='secondary' onClick={() => {
                                    const action = async () => {
                                        const res = await deleteWarehouse(element._id)
                                        if(res) setList(list => {
                                            list.splice(idx, 1)
                                            return [...list]
                                        })
                                    }
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                }}>
                                    Удалить
                                </Button>
                            </>
                            :
                            <Button onClick={async ()=> {
                                if(name) {
                                    const action = async () => {
                                        const element = {name, organization, guid}
                                        const res = await addWarehouse(element)
                                        if(res)
                                            setList(list => [res, ...list])
                                    }
                                    setName('')
                                    setGuid('')
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                }
                            }} size='small' color='primary'>
                                Добавить
                            </Button>}
                </CardActions>
            </Card>
        </div>
    );
})

function mapStateToProps (state) {
    return {
        app: state.app
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardWarehouse)
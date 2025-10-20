import React, {useState}  from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import cardClientNetworkStyle from '../../src/styleMUI/subbrand/cardSubbrand'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import Confirmation from '../../components/dialog/Confirmation'
import {setClientNetwork, deleteClientNetwork, addClientNetwork} from '../../src/gql/clientNetwork'
import TextField from '@material-ui/core/TextField';
import * as snackbarActions from '../../redux/actions/snackbar'

const CardClientNetwork = React.memo((props) => {
    const classes = cardClientNetworkStyle();
    const {element, setList, idx} = props;
    const {showSnackBar} = props.snackbarActions;
    const {isMobileApp} = props.app;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    let [name, setName] = useState(element&&element.name?element.name:'');
    return (
           <Card className={isMobileApp?classes.cardM:classes.cardD}>
                    <CardContent>
                        <TextField
                            error={!name}
                            label='Название'
                            value={name}
                            className={classes.input}
                            onChange={(event) => setName(event.target.value)}
                        />
                    </CardContent>
               <CardActions>
                    {
                        !element ?
                            <Button onClick={async () => {
                                if(name) {
                                    const action = async () => {
                                        let clientNetwork = {name}
                                        const res = await addClientNetwork(clientNetwork)
                                        if(res) {
                                            setList(list => [res, ...list])
                                            setName('')
                                        }
                                    }
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                } else {
                                    showSnackBar('Заполните все поля')
                                }
                            }} size='small' color='primary'>
                                Добавить
                            </Button>
                            :
                            <>
                            <Button onClick={async () => {
                                let editElement = {_id: element._id}
                                if(name&&name!==element.name) editElement.name = name
                                const action = async () => await setClientNetwork(editElement)
                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                showMiniDialog(true)
                            }} size='small' color='primary'>
                                Сохранить
                            </Button>
                            <Button onClick={
                                async () => {
                                    const action = async () => {
                                        await deleteClientNetwork(element._id)
                                        setList(list => {
                                            list.splice(idx, 1)
                                            return [...list]
                                        })

                                    }
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                }
                            } size='small' color='secondary'>
                                Удалить
                            </Button>
                            </>
                    }
               </CardActions>
            </Card>
    );
})

function mapStateToProps (state) {
    return {
        app: state.app,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardClientNetwork)
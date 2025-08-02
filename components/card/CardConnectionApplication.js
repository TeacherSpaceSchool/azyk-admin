import React, {useState} from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import cardStyle from '../../src/styleMUI/connectionApplication/cardConnectionApplication'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import { addConnectionApplication, acceptConnectionApplication, deleteConnectionApplication} from '../../src/gql/connectionApplication'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import TextField from '@material-ui/core/TextField';
import Confirmation from '../dialog/Confirmation';
import { pdDDMMYYHHMM } from '../../src/lib'

const CardConnectionApplication = React.memo((props) => {
    const {profile} = props.user;
    const classes = cardStyle();
    const {element, setList, idx} = props;
    const {showSnackBar} = props.snackbarActions;
    const {isMobileApp} = props.app;
    //addCard
    let [name, setName] = useState(element?element.name:'');
    let handleName =  (event) => {
        setName(event.target.value)
    };
    let [phone, setPhone] = useState(element?element.phone:'');
    let handlePhone =  (event) => {
        setPhone(event.target.value)
    };
    let [address, setAddress] = useState(element?element.address:'');
    let handleAddress =  (event) => {
        setAddress(event.target.value)
    };
    let [whereKnow, setWhereKnow] = useState(element?element.whereKnow:'');
    let handleWhereKnow =  (event) => {
        setWhereKnow(event.target.value)
    };
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    return (
        <div>
            <Card className={isMobileApp?classes.cardM:classes.cardD}>
                {
                    element?
                        <CardActionArea>
                            <CardContent>
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Время заявки:&nbsp;</div>
                                    <div className={classes.value}>{pdDDMMYYHHMM(element.createdAt)}</div>
                                    <div className={classes.status} style={{background: element.taken?'green':'orange'}}>{element.taken?'принят':'обработка'}</div>
                                </div>
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Магазин:&nbsp;</div>
                                    <div className={classes.value}>{element.name}</div>
                                </div>
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Телефон:&nbsp;</div>
                                    <div className={classes.value}>{element.phone}</div>
                                </div>
                                {element.address?<div className={classes.row}>
                                    <div className={classes.nameField}>Адрес:&nbsp;</div>
                                    <div className={classes.value}>{element.address}</div>
                                </div>:null}
                                {element.whereKnow?<div className={classes.row}>
                                    <div className={classes.nameField}>Откуда узнали:&nbsp;</div>
                                    <div className={classes.value}>{element.whereKnow}</div>
                                </div>:null}
                            </CardContent>
                        </CardActionArea>
                        :
                        <CardContent>
                            <TextField
                                style={{width: '100%'}}
                                error={!name}
                                label='Магазин'
                                value={name}
                                className={classes.input}
                                onChange={handleName}
                            />
                            <br/>
                            <br/>
                            <TextField
                                style={{width: '100%'}}
                                error={!phone}
                                label='Телефон'
                                value={phone}
                                className={classes.input}
                                onChange={handlePhone}
                            />
                            <br/>
                            <br/>
                            <TextField
                                style={{width: '100%'}}
                                label='Адрес'
                                value={address}
                                className={classes.input}
                                onChange={handleAddress}
                            />
                            <br/>
                            <br/>
                            <TextField
                                style={{width: '100%'}}
                                label='Откуда узнали'
                                value={whereKnow}
                                className={classes.input}
                                onChange={handleWhereKnow}
                            />
                            <br/>
                        </CardContent>
                }
                {
                    element&&profile.role==='admin'&&!element.taken?
                        <CardActions>
                            <Button onClick={async () => {
                                const action = async () => {
                                    await acceptConnectionApplication({_id: element._id})
                                    setList(list => {
                                        list[idx].taken = true
                                        return [...list]
                                    })
                                }
                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                showMiniDialog(true)
                            }} size='small' color='primary'>
                                Принять
                            </Button>
                            <Button onClick={async () => {
                                const action = async () => {
                                    await deleteConnectionApplication(element._id)
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
                        !element&&!profile.role?
                            <CardActions>
                                <Button onClick={async ()=> {
                                    if(name&&phone) {
                                        const action = async () => {
                                            const res = await addConnectionApplication({name, phone, address, whereKnow})
                                            if(res) {
                                                setList(list => {
                                                    return [res, ...(list||[])]
                                                })
                                                setName('')
                                                setPhone('')
                                                setWhereKnow('')
                                                setAddress('')
                                                showSnackBar('Заявка отправлена')
                                            }
                                        }
                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                        showMiniDialog(true)
                                    }
                                    else
                                        showSnackBar('Заполните все поля')
                                }} size='small' color='primary'>
                                    Отправить
                                </Button>
                            </CardActions>
                            :
                            null
                }
            </Card>
        </div>
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
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardConnectionApplication)
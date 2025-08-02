import React, {useState} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cardStyle from '../../src/styleMUI/review/cardReview'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import { addReview, acceptReview, deleteReview} from '../../src/gql/review'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Confirmation from '../dialog/Confirmation';
import { pdDDMMYYHHMM } from '../../src/lib'

const CardReview = React.memo((props) => {
    const {profile} = props.user;
    const classes = cardStyle();
    const {element, setList, organizations, idx} = props;
    const {isMobileApp} = props.app;
    //addCard
    let [organization, setOrganization] = useState(element?element.organization:null);
    let handleOrganization =  (event) => {
        setOrganization({_id: event.target.value, name: event.target.name})
    };
    let [text, setText] = useState(element?element.text:'');
    let handleText =  (event) => {
        setText(event.target.value)
    };
    const types = ['агент', 'доставка', 'экспедитор', 'прочее'];
    let [type, setType] = useState(element?element.type:'прочее');
    let handleType =  (event) => {
        setType(event.target.value)
    };
    let [taken, setTaken] = useState(element?element.taken:false);
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    return (
        <div>
            <Card className={isMobileApp?classes.cardM:classes.cardD}>
                {
                    element?
                        <CardContent>
                            <div className={classes.row}>
                                <div className={classes.nameField}>Время отзыва:&nbsp;</div>
                                <div className={classes.value}>{pdDDMMYYHHMM(element.createdAt)}</div>
                                <div className={classes.status} style={{background: taken?'green':'orange'}}>{taken?'принят':'обработка'}</div>
                            </div>
                            <a href={`/client/${element.client._id}`} target='_blank'>
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Клиент:&nbsp;</div>
                                    <div className={classes.value}>{element.client.name}</div>
                                </div>
                            </a>
                            <div className={classes.row}>
                                <div className={classes.nameField}>Организация:&nbsp;</div>
                                <div className={classes.value}>{element.organization.name}</div>
                            </div>
                            <div className={classes.row}>
                                <div className={classes.nameField}>Тип:&nbsp;</div>
                                <div className={classes.value}>{element.type}</div>
                            </div>
                            <div className={classes.row}>
                                <div className={classes.nameField}>Отзыв:&nbsp;</div>
                                <div className={classes.value}>{element.text}</div>
                            </div>
                        </CardContent>
                        :
                        <CardContent>
                            <FormControl error={!organization} className={classes.input}>
                                <InputLabel>Организация</InputLabel>
                                <Select value={organization&&organization._id} onChange={handleOrganization}>
                                    {organizations.map((element)=>
                                        <MenuItem key={element._id} value={element._id}>{element.name}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            <br/>
                            <br/>
                            <FormControl className={classes.input}>
                                <InputLabel>Тип</InputLabel>
                                <Select
                                    value={type}
                                    onChange={handleType}
                                >
                                    {types?types.map((element)=>
                                        <MenuItem key={element} value={element}>{element}</MenuItem>
                                    ):null}
                                </Select>
                            </FormControl>
                            <br/>
                            <TextField
                                error={!text}
                                multiline
                                style={{width: '100%'}}
                                label='Текст'
                                value={text}
                                className={classes.input}
                                onChange={handleText}
                            />
                        </CardContent>
                }
                {
                    element&&profile.role!=='client'&&!taken?
                        <CardActions>
                            <Button onClick={() => {
                                const action = async () => {
                                    await acceptReview({_id: element._id})
                                    setTaken(true)
                                }
                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                showMiniDialog(true)
                            }} size='small' color='primary'>
                                Принять
                            </Button>
                            {
                                profile.role==='admin'?
                                    <Button onClick={() => {
                                        const action = async () => {
                                            await deleteReview(element._id)
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
                        :
                        !element&&profile.role==='client'?
                            <CardActions>
                                <Button onClick={()=> {
                                    if(organization&&text) {
                                        const action = async () => {
                                            let res = await addReview({organization: organization._id, text, type: type})
                                            if(res)
                                                setList(list => [res, ...list])
                                        }
                                        setType('прочее')
                                        setOrganization(null)
                                        setText('')
                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                        showMiniDialog(true)
                                    }
                                }} size='small' color='primary'>
                                    Добавить
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
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardReview)
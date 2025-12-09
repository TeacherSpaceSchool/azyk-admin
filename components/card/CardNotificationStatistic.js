import React, {useState} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cardAdsStyle from '../../src/styleMUI/notificationStatistic/cardNotificationStatistic'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import { addNotificationStatistic } from '../../src/gql/notificationStatisticAzyk'
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as snackbarActions from '../../redux/actions/snackbar'
import {checkImageInput, isNotEmpty, pdDDMMYYHHMM} from '../../src/lib'
import Confirmation from '../dialog/Confirmation'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'

const NotificationStatistic = React.memo((props) => {
    const classes = cardAdsStyle();
    const {element, setList} = props;
    const {isMobileApp} = props.app;
    //addCard
    let [preview, setPreview] = useState(element?element.icon:'/static/add.png');
    let [icon, setIcon] = useState(null);
    let handleChangeIcon = (async (event) => {
        const image = await checkImageInput(event)
        if(image) {
            setIcon(image.upload)
            setPreview(image.preview)
        } else showSnackBar('Файл слишком большой')
    })
    let [title, setTitle] = useState(element?element.title:'');
    let handleTitle =  (event) => {
        setTitle(event.target.value)
    };
    let [text, setText] = useState(element?element.text:'');
    let handleText =  (event) => {
        setText(event.target.value)
    };
    let [tag, setTag] = useState(element?element.tag:'');
    let handleTag =  (event) => {
        setTag(event.target.value)
    };
    let [url, setUrl] = useState(element?element.url:'');
    let handleUrl =  (event) => {
        setUrl(event.target.value)
    };
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {showSnackBar} = props.snackbarActions;
    return (
          <> {
                !element ?
                    <Card className={isMobileApp?classes.cardM:classes.cardD}>
                        <label htmlFor={element?element._id:'add'}>
                            <img
                                className={isMobileApp?classes.mediaM:classes.mediaD}
                                src={preview}
                                alt={'Изменить'}
                                loading='lazy'
                            />
                        </label>
                        <CardContent>
                                <TextField
                                    label='Заголовок'
                                    value={title}
                                    className={classes.input}
                                    onChange={handleTitle}
                                />
                            <br/>
                            <br/>
                            <TextField
                                label='Текст'
                                value={text}
                                className={classes.input}
                                onChange={handleText}
                            />
                            <br/>
                            <br/>
                            <TextField
                                label='Тэг(не обязательно)'
                                value={tag}
                                className={classes.input}
                                onChange={handleTag}
                            />
                            <br/>
                            <br/>
                            <TextField
                                label='URL(не обязательно)'
                                value={url}
                                className={classes.input}
                                onChange={handleUrl}
                            />
                            </CardContent>
                        <CardActions>
                            <Button onClick={async () => {
                                if(text.length && title) {
                                    setTitle('')
                                    setText('')
                                    setTag('')
                                    setUrl('')
                                    setPreview('/static/add.png')
                                    const action = async () => {
                                        const res = await addNotificationStatistic({text, title, url, tag, icon})
                                        setList(list => [res, ...list])
                                    }
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                } else {
                                    showSnackBar('Заполните все поля')
                                }
                            }
                            } size='small' color='primary'>
                                Отправить
                            </Button>
                        </CardActions>
                        <input
                            accept='image/*'
                            style={{ display: 'none' }}
                            id={element?element._id:'add'}
                            type='file'
                            onChange={handleChangeIcon}
                        />
                    </Card>
                    :
                    <Card className={isMobileApp?classes.cardM:classes.cardD}>
                    {
                            element.icon?
                                <img
                                    className={isMobileApp?classes.mediaM:classes.mediaD}
                                    src={preview}
                                    alt={element.title}
                                    loading='lazy'
                                />
                                :null
                        }
                        <CardContent>
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Создан:&nbsp;</div>
                                    <div className={classes.value}>{pdDDMMYYHHMM(element.createdAt)}</div>
                                </div>
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Заголовок:&nbsp;</div>
                                    <div className={classes.value}>{element.title}</div>
                                </div>
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Текст:&nbsp;</div>
                                    <div className={classes.value}>{element.text}</div>
                                </div>
                                {
                                    element.tag?
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>Тэг:&nbsp;</div>
                                            <div className={classes.value}>{element.tag}</div>
                                        </div>
                                        :
                                        null
                                }
                                {
                                    element.url?
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>URL:&nbsp;</div>
                                            <div className={classes.value}>{element.url}</div>
                                        </div>
                                        :
                                        null
                                }
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Доставлено:&nbsp;</div>
                                    <div className={classes.value}>{element.delivered}</div>
                                </div>
                                {
                                    isNotEmpty(element.click)?
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>Кликов:&nbsp;</div>
                                            <div className={classes.value}>{element.click}</div>
                                        </div>
                                        :null
                                }
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Провалено:&nbsp;</div>
                                    <div className={classes.value}>{element.failed}</div>
                                </div>
                        </CardContent>
                    </Card>
            }</>
    );
})

function mapStateToProps (state) {
    return {
        app: state.app
    }
}

function mapDispatchToProps(dispatch) {
    return {
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationStatistic)
import React, {useState} from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import cardPageListStyle from '../../src/styleMUI/blog/cardBlog'
import { connect } from 'react-redux'
import {maxImageSize, pdDDMMYYYY} from '../../src/lib'
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import { deleteBlog, addBlog, setBlog } from '../../src/gql/blog'
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import Confirmation from '../dialog/Confirmation'


const CardBlog = React.memo((props) => {
    const classes = cardPageListStyle();
    const {element, setList, idx} = props;
    const {profile} = props.user;
    const {isMobileApp} = props.app;
    //addCard
    let [preview, setPreview] = useState(element?element.image:'/static/add.png');
    let [image, setImage] = useState(null);
    let handleChangeImage = ((event) => {
        if(event.target.files[0].size/1024/1024<maxImageSize) {
            setImage(event.target.files[0])
            setPreview(URL.createObjectURL(event.target.files[0]))
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
    let date = pdDDMMYYYY(element?new Date(element.createdAt):new Date())
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {showSnackBar} = props.snackbarActions;
    return (
        <Card className={isMobileApp?classes.cardM:classes.cardD}>
            {
                profile.role === 'admin' ?
                    <>
                    <CardHeader
                        subheader={date}
                    />
                        <label htmlFor={element?element._id:'add'}>
                            <img
                                style={preview==='/static/add.png'?{border: '1px red solid'}:null}
                                className={isMobileApp?classes.mediaM:classes.mediaD}
                                src={preview}
                                alt={'Изменить'}
                                loading='lazy'
                            />
                        </label>
                        <CardContent>
                            <TextField
                                style={{width: '100%'}}
                                label='Имя'
                                error={!title}
                                value={title}
                                className={classes.input}
                                onChange={handleTitle}
                            />
                            <br/>
                            <br/>
                            <TextField
                                multiline
                                style={{width: '100%'}}
                                label='Текст'
                                error={!text}
                                value={text}
                                className={classes.input}
                                onChange={handleText}
                            />
                        </CardContent>
                    <CardActions>
                        {
                            element?
                                <>
                                <Button onClick={async () => {
                                    let editElement = {_id: element._id}
                                    if(title&&title!==element.title)editElement.title = title
                                    if(text.length&&text!==element.text)editElement.text = text
                                    if(image)editElement.image = image
                                    const action = async () => await setBlog(editElement)
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                }} size='small' color='primary'>
                                    Сохранить
                                </Button>
                                <Button onClick={async () => {
                                    const action = async () => {
                                        await deleteBlog(element._id)
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
                                </>
                                :
                                <Button onClick={async ()=> {
                                    if(image && text && title) {
                                        setImage(null)
                                        setPreview('/static/add.png')
                                        setTitle('')
                                        setText('')
                                        const action = async () => {
                                            const res = await addBlog({image, text, title})
                                            if(res) setList(list => [res, ...list])
                                        }
                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                        showMiniDialog(true)
                                    } else {
                                        showSnackBar('Заполните все поля')
                                    }
                                }
                                } size='small' color='primary'>
                                    Добавить
                                </Button>
                        }
                    </CardActions>
                    <input
                        accept='image/*'
                        style={{ display: 'none' }}
                        id={element?element._id:'add'}
                        type='file'
                        onChange={handleChangeImage}
                    />
                    </>
                    :
                    element?
                        <>
                            <img
                                className={isMobileApp?classes.mediaM:classes.mediaD}
                                src={element.image}
                                alt={element.title}
                                loading='lazy'
                            />
                            <div className={classes.shapka}>
                                <div className={classes.title}>{element.title}</div>
                                <div className={classes.date}>{date}</div>
                            </div>
                            <div style={{fontSize: '1rem', margin: 20, whiteSpace: 'pre-wrap'}}>
                                {element.text}
                            </div>
                        </>
                        :null
            }
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
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardBlog)
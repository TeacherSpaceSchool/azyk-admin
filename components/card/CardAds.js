import React, {useState} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import cardAdsStyle from '../../src/styleMUI/ads/cardAds'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import { deleteAds, addAds, setAds } from '../../src/gql/ads'
import {checkInt, maxImageSize} from '../../src/lib'
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as snackbarActions from '../../redux/actions/snackbar'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import Confirmation from '../dialog/Confirmation'
import Autocomplete from '@material-ui/lab/Autocomplete';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const CardAds = React.memo((props) => {
    const classes = cardAdsStyle();
    const {element, setList, organization, items, edit, idx} = props;
    const {profile} = props.user;
    const {isMobileApp} = props.app;
    //addCard
    let [preview, setPreview] = useState(element?element.image:'/static/add.png');
    let [image, setImage] = useState(null);
    let handleChangeImage = ((event) => {
        if(event.target.files[0]&&event.target.files[0].size/1024/1024<maxImageSize) {
            setImage(event.target.files[0])
            setPreview(URL.createObjectURL(event.target.files[0]))
        } else showSnackBar('Файл слишком большой')
    })
    let [title, setTitle] = useState(element?element.title:'');
    let handleTitle =  (event) => {
        setTitle(event.target.value)
    };
    let [xid, setXid] = useState(element?element.xid:'');
    let handleXid =  (event) => {
        setXid(event.target.value)
    };
    let [count, setCount] = useState(element?element.count:'');
    let handleCount=  (event) => {
        setCount(checkInt(event.target.value))
    };
    let [item, setItem] = useState(element?element.item:null);
    let [targetPrice, setTargetPrice ] = useState(element?element.targetPrice:'');
    let handleTargetPrice =  (event) => setTargetPrice(checkInt(event.target.value));
    let [url, setUrl] = useState(element?element.url:'');
    let handleUrl =  (event) => {
        setUrl(event.target.value)
    };
    let allPaymentMethods = ['Наличные', 'Перечисление', 'Консигнация']
    let [paymentMethods, setPaymentMethods] = useState(element&&element.paymentMethods?element.paymentMethods:[]);
    let handlePaymentMethods =  (event) => {
        setPaymentMethods(event.target.value)
    };
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {showSnackBar} = props.snackbarActions;
    return (
          <> {
              ['суперорганизация', 'организация', 'admin'].includes(profile.role) && edit ?
                    <Card className={isMobileApp?classes.cardM:classes.cardD}>
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
                                    label='Текст'
                                    error={!title}
                                    value={title}
                                    className={classes.input}
                                    onChange={handleTitle}
                                />
                                <br/>
                                <br/>
                            <TextField
                                label='URL'
                                value={url}
                                className={classes.input}
                                onChange={handleUrl}
                            />
                            <br/>
                            <br/>
                                <Autocomplete
                                    className={classes.input}
                                    options={items}
                                    getOptionLabel={option => option.name}
                                    value={item}
                                    onChange={(event, newValue) => {
                                        setItem(newValue)
                                    }}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField {...params} error={!item} label='Товар' fullWidth />
                                    )}/>
                                <br/>
                                <TextField
                                    type={ isMobileApp?'number':'text'}
                                    label='Количество'
                                    error={!count}
                                    value={count}
                                    className={classes.input}
                                    onChange={handleCount}
                                />
                            <br/>
                            <br/>
                                <TextField
                                    label='ID'
                                    value={xid}
                                    className={classes.input}
                                    onChange={handleXid}
                                />
                            <br/>
                            <br/>
                            <TextField
                                label='Целевая цена'
                                value={targetPrice}
                                error={!targetPrice}
                                type={ isMobileApp?'number':'text'}
                                className={classes.input}
                                onChange={handleTargetPrice}
                            />
                            <FormControl className={classes.input}>
                                <InputLabel>Способы оплаты</InputLabel>
                                <Select
                                    error={!paymentMethods.length}
                                    multiple
                                    value={paymentMethods}
                                    onChange={handlePaymentMethods}
                                >
                                    {allPaymentMethods.map((element) =>
                                        <MenuItem key={element} value={element}>{element}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </CardContent>
                        <CardActions>
                            {
                                   element?
                                        <>
                                        <Button onClick={async () => {
                                            let editElement = {_id: element._id}
                                            if(title&&title !== element.title) editElement.title = title
                                            if(xid !== element.xid) editElement.xid = xid
                                            if(url !== element.url) editElement.url = url
                                            if(count&&count !== element.count) editElement.count = checkInt(count)
                                            if(paymentMethods.length&&JSON.stringify(paymentMethods) !== JSON.stringify(editElement.paymentMethods)) editElement.paymentMethods = paymentMethods
                                            if(targetPrice&&targetPrice !== element.targetPrice) editElement.targetPrice = checkInt(targetPrice)
                                            if(item&&(!element.item||item._id!==element.item._id)) {
                                                console.log(item)
                                                editElement.item = item._id
                                            }
                                            if(image) editElement.image = image
                                            const action = async () => await setAds(editElement, organization)
                                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                            showMiniDialog(true)
                                        }} size='small' color='primary'>
                                            Сохранить
                                        </Button>
                                        <Button onClick={async () => {
                                            const action = async () => {
                                                await deleteAds(element._id)
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
                                        <Button onClick={async () => {
                                            if(image&&title&&item&&count&&targetPrice&&paymentMethods.length) {
                                                const action = async () => {
                                                    const element = {
                                                        xid, image, url, title, organization, item: item._id, count: checkInt(count),
                                                        targetPrice: checkInt(targetPrice), paymentMethods
                                                    }
                                                    const res = await addAds(element);
                                                    setList(list => [res, ...list])
                                                    setImage(null)
                                                    setPreview('/static/add.png')
                                                    setTitle('')
                                                    setUrl('')
                                                    setXid('')
                                                    setCount('')
                                                    setTargetPrice('')
                                                    setPaymentMethods(allPaymentMethods)
                                                    setItem(null)
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
                    </Card>
                    :
                    element?
                        <Card className={isMobileApp?classes.cardM:classes.cardD}>
                            <CardActionArea>
                                <a href={element.url}>
                                    <img
                                        className={isMobileApp?classes.mediaM:classes.mediaD}
                                        alt={element.title}
                                        src={element.image}
                                        loading='lazy'
                                    />
                                </a>
                                <div style={{fontSize: '1rem', margin: 20, whiteSpace: 'pre-wrap'}}>
                                    {element.title}
                                </div>
                            </CardActionArea>
                        </Card>
                        :null
            }</>
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

export default connect(mapStateToProps, mapDispatchToProps)(CardAds)
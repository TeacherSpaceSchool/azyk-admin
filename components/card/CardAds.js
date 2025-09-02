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
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import Remove from '@material-ui/icons/Remove';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';

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
    let [xidNumber, setXidNumber] = useState(element?element.xidNumber:'');
    let handleXidNumber=  (event) => {
        setXidNumber(checkInt(event.target.value))
    };
    let [item, setItem] = useState(element?element.item:null);
    let [targetItems, setTargetItems ] = useState(element?element.targetItems.map(targetItem=>{return {xids: targetItem.xids, count: targetItem.count, sum: targetItem.sum, type: targetItem.type, targetPrice: targetItem.targetPrice}}):[]);
    let [targetPrice, setTargetPrice ] = useState(element?element.targetPrice:'');
    let handleTargetPrice =  (event) => {
        setTargetPrice(checkInt(event.target.value))
    };
    let [multiplier , setMultiplier] = useState(element?element.multiplier:false);
    let [targetType, setTargetType] = useState(element?element.targetType:'Цена');
    let handleTargetType =  (event) => {
        setTargetItems([])
        setTargetType(event.target.value)
    };
    const targetTypes = ['Цена', 'Товар']
    const targetItemsTypes = ['Количество', 'Цена']
    let [url, setUrl] = useState(element?element.url:'');
    let handleUrl =  (event) => {
        setUrl(event.target.value)
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
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={multiplier}
                                        onChange={() => {setMultiplier(!multiplier)}}
                                        color='primary'
                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                    />
                                }
                                label='Множитель'
                            />
                            <br/>
                            <br/>
                            <div className={classes.row}>
                                <TextField
                                    label='ID'
                                    value={xid}
                                    className={classes.inputHalf}
                                    onChange={handleXid}
                                />
                                <TextField
                                    label='Номер ID'
                                    value={xidNumber}
                                    className={classes.inputHalf}
                                    onChange={handleXidNumber}
                                />
                            </div>
                            <br/>
                            <br/>
                            <FormControl className={classes.input}>
                                <InputLabel>Цель</InputLabel>
                                <Select
                                    value={targetType}
                                    onChange={handleTargetType}
                                    input={<Input/>}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 226,
                                                width: 250,
                                            },
                                        }
                                    }}
                                >
                                    {targetTypes.map((targetType) => (
                                        <MenuItem key={targetType} value={targetType}>
                                            {targetType}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <br/>
                            <br/>
                            {
                                targetType==='Цена'?
                                    <>
                                    <TextField
                                        label='Целевая цена'
                                        value={targetPrice}
                                        type={ isMobileApp?'number':'text'}
                                        className={classes.input}
                                        onChange={handleTargetPrice}
                                    />
                                    </>
                                    :
                                    <>
                                    {targetItems?targetItems.map((element, idx) => {
                                        return(<>
                                            <FormControl className={classes.input}>
                                                <InputLabel>Целевой товар</InputLabel>
                                                <Select
                                                    multiple
                                                    value={element.xids}
                                                    onChange={(event) => {
                                                        targetItems[idx].xids = event.target.value
                                                        setTargetItems([...targetItems])
                                                    }}
                                                    input={<Input />}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            style: {
                                                                maxHeight: 226,
                                                                width: 250,
                                                            },
                                                        }
                                                    }}
                                                >
                                                    {items?items.map((item) => (
                                                        <MenuItem key={item.name} value={item._id}>
                                                            {item.name}
                                                        </MenuItem>
                                                    )):null}
                                                </Select>
                                            </FormControl>
                                            <br/>
                                            <br/>
                                            <FormControl className={classes.input}>
                                                <InputLabel>Цель</InputLabel>
                                                <Select
                                                    value={targetItems[idx].type}
                                                    onChange={(event) => {
                                                        targetItems[idx].type = event.target.value
                                                        targetItems[idx].count = 0
                                                        targetItems[idx].targetPrice = 0
                                                        setTargetItems([...targetItems])
                                                    }}
                                                    input={<Input/>}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            style: {
                                                                maxHeight: 226,
                                                                width: 250,
                                                            },
                                                        }
                                                    }}
                                                >
                                                    {targetItemsTypes.map((targetItemsType) => (
                                                        <MenuItem key={targetItemsType} value={targetItemsType}>
                                                            {targetItemsType}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <br/>
                                            <br/>
                                            <div className={classes.row}>
                                                <FormControl className={classes.inputHalf}>
                                                    <InputLabel>{targetItems[idx].type==='Количество'?'Целевое количество':'Целевая цена'}</InputLabel>
                                                    <Input
                                                        placeholder={targetItems[idx].type==='Количество'?'Целевое количество':'Целевая цена'}
                                                        type={ isMobileApp?'number':'text'}
                                                        value={targetItems[idx].type==='Количество'?element.count:element.targetPrice}
                                                        onChange={(event) => {
                                                            if(targetItems[idx].type==='Количество')
                                                                targetItems[idx].count = checkInt(event.target.value)
                                                            else
                                                                targetItems[idx].targetPrice = checkInt(event.target.value)
                                                            setTargetItems([...targetItems])
                                                        }}
                                                        endAdornment={
                                                            <InputAdornment position='end'>
                                                                <IconButton
                                                                    onClick={() => {
                                                                        targetItems.splice(idx, 1)
                                                                        setTargetItems([...targetItems])
                                                                    }}
                                                                >
                                                                    <Remove/>
                                                                </IconButton>
                                                            </InputAdornment>
                                                        }
                                                    />
                                                </FormControl>
                                                <FormControlLabel
                                                    className={classes.inputHalf}
                                                    control={
                                                        <Switch
                                                            checked={element.sum}
                                                            onChange={() => {
                                                                targetItems[idx].sum = !targetItems[idx].sum
                                                                setTargetItems([...targetItems])
                                                            }}
                                                            color='primary'
                                                            inputProps={{ 'aria-label': 'primary checkbox' }}
                                                        />
                                                    }
                                                    label='Суммировать'
                                                />
                                            </div>
                                            <br/>
                                            <br/>
                                        </>)
                                        }
                                    ):null}
                                    <Button onClick={async () => {
                                        setTargetItems([...targetItems, {xids: [], count: 0, sum: false, type: 'Количество', targetPrice: 0}])
                                    }} size='small' color='primary'>
                                        Добавить товар
                                    </Button>
                                    </>
                            }
                        </CardContent>
                        <CardActions>
                            {
                                   element?
                                        <>
                                        <Button onClick={async () => {
                                            let editElement = {_id: element._id}
                                            if(title && title !== element.title) editElement.title = title
                                            if(xid.length && xid !== element.xid) editElement.xid = xid
                                            if(url.length && url !== element.url) editElement.url = url
                                            if(count !== element.count) editElement.count = checkInt(count)
                                            if(xidNumber !== element.xidNumber) editElement.xidNumber = checkInt(xidNumber)
                                            editElement.targetItems = targetItems
                                            if(targetPrice !== element.targetPrice) editElement.targetPrice = checkInt(targetPrice)
                                            if(multiplier !== element.multiplier) editElement.multiplier = multiplier
                                            if(targetType !== element.targetType) editElement.targetType = targetType
                                            editElement.item = item ? item._id : null
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
                                            if(item && count && image && title) {
                                                const action = async () => {
                                                    const element = {
                                                        xidNumber: checkInt(xidNumber), xid, count: checkInt(count), item: item?item._id:null, organization, image,
                                                        url, title, targetItems, targetPrice: checkInt(targetPrice), multiplier, targetType
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
import React, {useState} from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import cardSubBrandStyle from '../../src/styleMUI/category/cardCategory'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import { onoffSubBrand, addSubBrand, setSubBrand, deleteSubBrand } from '../../src/gql/subBrand'
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import Confirmation from '../dialog/Confirmation'
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { checkInt } from '../../src/lib'
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import * as lib from '../../src/lib'

const CardSubBrand = React.memo((props) => {
    const classes = cardSubBrandStyle();
    const { element, setList, list, idx, organizations } = props;
    const { isMobileApp } = props.app;
    //addCard
    let [preview, setPreview] = useState(element?element.image:'/static/add.png');
    let [image, setImage] = useState(undefined);
    let handleChangeImage = ((event) => {
        if(event.target.files[0].size/1024/1024<50){
            setImage(event.target.files[0])
            setPreview(URL.createObjectURL(event.target.files[0]))
        } else {
            showSnackBar('Файл слишком большой')
        }
    })
    let [status, setStatus] = useState(element?element.status:'active');
    let [miniInfo, setMiniInfo] = useState(element?element.miniInfo:'');
    let handleMiniInfo =  (event) => {
        setMiniInfo(event.target.value)
    };
    let [name, setName] = useState(element?element.name:'');
    let handleName =  (event) => {
        setName(event.target.value)
    };
    let [cities, setCities] = useState(element?element.cities?element.cities:[]:['Бишкек']);
    let handleCities =  (event) => {
        setCities(event.target.value)
    };
    let [priotiry, setPriotiry] = useState(element?element.priotiry:0);
    let [minimumOrder, setMinimumOrder] = useState(element?element.minimumOrder:0);
    let [organization, setOrganization] = useState(element?element.organization:{});
    let handleOrganization =  (event) => {
        setOrganization({_id: event.target.value, name: event.target.name})
    };
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    const { showSnackBar } = props.snackbarActions;
    return (
        <Card className={isMobileApp?classes.cardM:classes.cardD}>
                        <CardActionArea>
                        <CardContent>
                            <div className={classes.line}>
                                <label htmlFor={element?element._id:'add'}>
                                    <img
                                        className={classes.media}
                                        src={preview}
                                        alt={'Изменить'}
                                    />
                                </label>
                               <TextField
                                   label='Имя'
                                   value={name}
                                   className={isMobileApp?classes.inputM:classes.inputD}
                                   onChange={handleName}
                                   inputProps={{
                                       'aria-label': 'description',
                                   }}
                               />
                            </div>
                            <br/>
                            <TextField
                                label='Описание'
                                value={miniInfo}
                                className={isMobileApp?classes.inputM:classes.input}
                                onChange={handleMiniInfo}
                                inputProps={{
                                    'aria-label': 'description',
                                }}
                            />
                            <br/>
                            {!element?
                                <FormControl className={isMobileApp?classes.inputM:classes.input}>
                                    <InputLabel>Организация</InputLabel>
                                    <Select value={organization._id} onChange={handleOrganization}>
                                        {organizations.map((element)=>
                                            <MenuItem key={element._id} value={element._id} ola={element.name}>{element.name}</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                                :
                                <TextField
                                    label='Организация'
                                    value={organization.name}
                                    className={isMobileApp?classes.inputM:classes.input}
                                    inputProps={{
                                        'aria-label': 'description',
                                        readOnly: true,
                                    }}
                                />
                            }
                            <br/>
                            <FormControl className={isMobileApp?classes.inputM:classes.input} variant='outlined'>
                                <InputLabel>Город</InputLabel>
                                <Select
                                    multiple
                                    value={cities}
                                    onChange={handleCities}
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
                                    {lib.cities.map((city) => (
                                        <MenuItem key={city} value={city}>
                                            {city}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <br/>
                            <TextField
                                type={ isMobileApp?'number':'text'}
                                label='Приоритет'
                                value={priotiry}
                                className={isMobileApp?classes.inputM:classes.input}
                                onChange={(event)=>{
                                    setPriotiry(checkInt(event.target.value))}
                                }
                                inputProps={{
                                    'aria-label': 'description',
                                }}
                            />
                            <br/>
                            <TextField
                                type={ isMobileApp?'number':'text'}
                                label='Минимальный заказ'
                                value={minimumOrder}
                                className={isMobileApp?classes.inputM:classes.input}
                                onChange={(event)=>{
                                    setMinimumOrder(checkInt(event.target.value))}
                                }
                                inputProps={{
                                    'aria-label': 'description',
                                }}
                            />
                        </CardContent>
                    </CardActionArea>
                        <CardActions>
                            {
                                element!==undefined?
                                <>
                                <Button onClick={async()=>{
                                    if(cities.length) {
                                        let editElement = {_id: element._id, cities}
                                        if (miniInfo.length > 0 && miniInfo !== element.miniInfo) editElement.miniInfo = miniInfo
                                        if (name.length > 0 && name !== element.name) editElement.name = name
                                        if (priotiry !== element.priotiry) editElement.priotiry = priotiry
                                        if (minimumOrder !== element.minimumOrder) editElement.minimumOrder = minimumOrder
                                        if (image !== undefined) editElement.image = image
                                        const action = async () => {
                                            await setSubBrand(editElement)
                                        }
                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                        showMiniDialog(true)
                                    } else
                                        showSnackBar('Заполните все поля')

                                }} size='small' color='primary'>
                                    Сохранить
                                </Button>
                                    <Button onClick={async()=>{
                                        const action = async() => {
                                            await onoffSubBrand([element._id])
                                            setStatus(status==='active'?'deactive':'active')
                                        }
                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                        showMiniDialog(true)
                                    }} size='small' color={status==='active'?'primary':'secondary'}>
                                        {status==='active'?'Отключить':'Включить'}
                                    </Button>
                                    <Button size='small' color='secondary' onClick={()=>{
                                        const action = async() => {
                                            await deleteSubBrand([element._id])
                                            let _list = [...list]
                                            _list.splice(idx, 1)
                                            setList(_list)
                                        }
                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                        showMiniDialog(true)
                                    }}>
                                        Удалить
                                    </Button>
                        </>:
                        <Button onClick={async()=> {
                            if (image!==undefined&&miniInfo.length&&name.length&&cities.length&&organization._id) {
                                setImage(undefined)
                                setPreview('/static/add.png')
                                setPriotiry(0)
                                setMinimumOrder(0)
                                setMiniInfo('')
                                setName('')
                                setCities(['Бишкек'])
                                const action = async() => {
                                    setList([(await addSubBrand({image, miniInfo, name, minimumOrder, priotiry, organization: organization._id, cities})).addSubBrand, ...list])
                                }
                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                showMiniDialog(true)
                            } else
                                showSnackBar('Заполните все поля')

                        }
                        } size='small' color='primary'>
                            Добавить
                        </Button>}
                        </CardActions>
                        <input
                            accept='image/*'
                            style={{ display: 'none' }}
                            id={element?element._id:'add'}
                            type='file'
                            onChange={handleChangeImage}
                        />
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

export default connect(mapStateToProps, mapDispatchToProps)(CardSubBrand)
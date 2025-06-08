import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import clientStyle from '../../src/styleMUI/client/client'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import { getClient, onoffClient, setClient, addClient, deleteClient } from '../../src/gql/client'
import Remove from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import { urlMain } from '../../redux/constants/other'
import Confirmation from '../../components/dialog/Confirmation'
import Geo from '../../components/dialog/Geo'
import { useRouter } from 'next/router'
import {cities, pdDDMMYYHHMM} from '../../src/lib'
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import * as snackbarActions from '../../redux/actions/snackbar'
import Router from 'next/router'
import { getClientGqlSsr } from '../../src/getClientGQL'
import { validPhone } from '../../src/lib'
import initialApp from '../../src/initialApp'

const Client = React.memo((props) => {
    const { profile } = props.user;
    const classes = clientStyle();
    const { data } = props;
    const router = useRouter()
    const { isMobileApp } = props.app;
    const { showSnackBar } = props.snackbarActions;
    let [status, setStatus] = useState(data.client&&data.client.user?data.client.user.status:'');
    let [name, setName] = useState(data.client&&data.client.name?data.client.name:'');
    let [inn, setInn] = useState(data.client&&data.client.inn?data.client.inn:'');
    let [email, setEmail] = useState(data.client&&data.client.email?data.client.email:'');
    let [phone, setPhone] = useState(data.client&&data.client.phone&&data.client.phone.length>0?data.client.phone:['+996']);
    let addPhone = ()=>{
        phone = [...phone, '+996']
        setPhone(phone)
    };
    let editPhone = (event, idx)=>{
        if(event.target.value.length<14) {
            phone[idx] = event.target.value
            while (phone[idx].includes(' '))
                phone[idx] = phone[idx].replace(' ', '')
            while (phone[idx].includes('-'))
                phone[idx] = phone[idx].replace('-', '')
            while (phone[idx].includes(')'))
                phone[idx] = phone[idx].replace(')', '')
            while (phone[idx].includes('('))
                phone[idx] = phone[idx].replace('(', '')
            setPhone([...phone])
        }
    };
    let deletePhone = (idx)=>{
        phone.splice(idx, 1);
        setPhone([...phone])
    };
    let [login, setLogin] = useState(data.client&&data.client.user?data.client.user.login:'');
    let categorys = ['A','B','C','D','Horeca']
    let [category, setCategory] = useState(data.client&&data.client.category?data.client.category:'B');
    let handleCategory =  (event) => {
        setCategory(event.target.value)
    };

    //привести к геолокации
    if(data.client.address.length>0&&!Array.isArray(data.client.address[0])) data.client.address.map((addres)=>[addres])

    let [address, setAddress] = useState(data.client&&data.client.address&&data.client.address.length>0?data.client.address:[['']]);
    let [city, setCity] = useState(data.client&&data.client.city?data.client.city:'Бишкек');
    let handleCity =  (event) => {
        setCity(event.target.value)
    };
    let editAddress = (event, idx)=>{
        address[idx][0] = event.target.value
        setAddress([...address])
    };
    let editAddressName = (event, idx)=>{
        address[idx][2] = event.target.value
        setAddress([...address])
    };
    let setAddressGeo = (geo, idx)=>{
        address[idx][1] = geo
        setAddress([...address])
    };

    let [info, setInfo] = useState(data.client&&data.client.info?data.client.info:'');
    let [preview, setPreview] = useState(data.client&&data.client.image?data.client.image:'/static/add.png');
    let [image, setImage] = useState(undefined);
    let handleChangeImage = ((event) => {
        if(event.target.files[0].size/1024/1024<50){
            setImage(event.target.files[0])
            setPreview(URL.createObjectURL(event.target.files[0]))
        } else {
            showSnackBar('Файл слишком большой')
        }
    })
    const { setMiniDialog, showMiniDialog, showFullDialog, setFullDialog } = props.mini_dialogActions;
    let [newPass, setNewPass] = useState('');
    let handleNewPass =  (event) => {
        setNewPass(event.target.value)
    };
    let [hide, setHide] = useState('password');
    let handleHide =  () => {
        setHide(!hide)
    };
    useEffect(()=>{
        if(name.length===0||!city||city.length===0||phone.length===0||address.length===0||!address[0]||address[0].length===0||!address[0][0]||address[0][0].length===0||!address[0][1]||address[0][1].length===0) {
            showSnackBar('Обязательно заполните геолокацию, имя, город, номер телефона и адрес')
        }
    },[])
    return (
        <App filters={data.filterSubCategory} sorts={data.sortSubCategory} pageName={data.client?data.client.name:'Ничего не найдено'}>
            <Head>
                <title>{router.query.id==='new'?'Добавить':data.client?data.client.name:'Ничего не найдено'}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={isMobileApp?classes.column:classes.row} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    {data.client?
                        ['admin', 'суперагент', 'суперорганизация', 'организация', 'агент', 'экспедитор'].includes(profile.role)/*||(data.client.user&&profile._id===data.client.user._id)*/?
                                <>
                                <div className={classes.column}>
                                    <label htmlFor='contained-button-file'>
                                        <img
                                            className={classes.media}
                                            src={preview?preview:'/static/add.png'}
                                            alt={'Добавить'}
                                        />
                                    </label>
                                    {
                                        ['admin', 'суперагент'].includes(profile.role)&&data.client.createdAt?
                                            <>
                                                <div className={classes.row}>
                                                    <b>
                                                        Регистрация:&nbsp;
                                                    </b>
                                                    <div>
                                                        {pdDDMMYYHHMM(data.client.createdAt)}
                                                    </div>
                                                </div>
                                                <div className={classes.row}>
                                                    <b>
                                                        Обновлен:&nbsp;
                                                    </b>
                                                    <div>
                                                        {pdDDMMYYHHMM(data.client.updatedAt)}
                                                    </div>
                                                </div>
                                            </>
                                            :
                                            null
                                    }
                                    {
                                        ['admin', 'суперагент'].includes(profile.role)&&data.client.lastActive?
                                            <div className={classes.row}>
                                                <b>
                                                    Активность:&nbsp;
                                                </b>
                                                <div>
                                                    {pdDDMMYYHHMM(data.client.lastActive)}
                                                </div>
                                            </div>
                                            :
                                            null
                                    }
                                </div>
                                <div>
                                    <TextField
                                        label='Имя'
                                        error={name.length===0}
                                        value={name}
                                        className={classes.input}
                                        onChange={(event)=>{setName(event.target.value)}}
                                        inputProps={{
                                            'aria-label': 'description',
                                        }}
                                    />
                                    <FormControl className={classes.input}>
                                        <InputLabel>Категория</InputLabel>
                                        <Select value={category} onChange={handleCategory}>
                                            {categorys.map((element)=>
                                                <MenuItem key={element} value={element} ola={element}>{element}</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label='Логин'
                                        value={login}
                                        className={classes.input}
                                        onChange={(event)=>{setLogin(event.target.value)}}
                                        inputProps={{
                                            'aria-label': 'description',
                                        }}
                                    />
                                    <Input
                                        placeholder='Новый пароль'
                                        type={hide ? 'password' : 'text' }
                                        value={newPass}
                                        onChange={handleNewPass}
                                        className={classes.input}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton aria-label="Toggle password visibility" onClick={handleHide}>
                                                    {hide ? <VisibilityOff />:<Visibility />  }
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                    />
                                    <FormControl className={classes.input}>
                                        <InputLabel>Город</InputLabel>
                                        <Select value={city} onChange={handleCity}>
                                            {cities.map((element)=>
                                                <MenuItem key={element} value={element} ola={element}>{element}</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                    {address?address.map((element, idx)=>
                                            <div key={`address${idx}`}>
                                                <FormControl className={classes.input}>
                                                    <InputLabel>Название магазина</InputLabel>
                                                    <Input
                                                        placeholder='Название магазина'
                                                        value={element[2]}
                                                        className={classes.input}
                                                        onChange={(event)=>{editAddressName(event, idx)}}
                                                        inputProps={{
                                                            'aria-label': 'description',
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormControl className={classes.input}>
                                                    <InputLabel color={element[0]&&element[0].length>0?'primary':'secondary'}>Адрес магазина</InputLabel>
                                                    <Input
                                                        error={!element[0]||element[0].length===0}
                                                        value={element[0]}
                                                        className={classes.input}
                                                        onChange={(event)=>{editAddress(event, idx)}}
                                                        inputProps={{
                                                            'aria-label': 'description',
                                                        }}
                                                    />
                                                </FormControl>
                                                <div className={classes.geo} style={{color: element[1]?'#ffb300':'red'}} onClick={()=>{
                                                    setFullDialog('Геолокация', <Geo change={true} geo={element[1]} setAddressGeo={setAddressGeo} idx={idx}/>)
                                                    showFullDialog(true)
                                                }}>
                                                    {
                                                        element[1]?
                                                            'Изменить геолокацию'
                                                            :
                                                            'Задайте геолокацию'
                                                    }
                                                </div>
                                            </div>
                                        ):
                                        <br/>}
                                    {phone?phone.map((element, idx)=>
                                        <div key={`phone${idx}`}>
                                            <FormControl className={classes.input}>
                                                <InputLabel color={validPhone(element)?'primary':'secondary'}>Телефон. Формат: +996555780861</InputLabel>
                                                <Input
                                                    placeholder='Телефон. Формат: +996555780861'
                                                    value={element}
                                                    className={classes.input}
                                                    onChange={(event)=>{editPhone(event, idx)}}
                                                    inputProps={{
                                                        'aria-label': 'description',
                                                    }}
                                                    error={!validPhone(element)}
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={()=>{
                                                                    deletePhone(idx)
                                                                }}
                                                                aria-label='toggle password visibility'
                                                            >
                                                                <Remove/>
                                                            </IconButton>
                                                        </InputAdornment>
                                                    }
                                                />
                                            </FormControl>
                                        </div>
                                    ): null}
                                    <Button onClick={async()=>{
                                        addPhone()
                                    }} size='small' color='primary'>
                                        Добавить телефон
                                    </Button>
                                    <TextField
                                        label='ИНН'
                                        value={inn}
                                        className={classes.input}
                                        onChange={(event)=>{setInn(event.target.value)}}
                                        inputProps={{
                                            'aria-label': 'description',
                                        }}
                                    />
                                    <TextField
                                        label='email'
                                        value={email}
                                        className={classes.input}
                                        onChange={(event)=>{setEmail(event.target.value)}}
                                        inputProps={{
                                            'aria-label': 'description',
                                        }}
                                    />
                                    <TextField
                                        multiline={true}
                                        label='Информация'
                                        value={info}
                                        className={classes.input}
                                        onChange={(event)=>{setInfo(event.target.value)}}
                                        inputProps={{
                                            'aria-label': 'description',
                                        }}
                                    />
                                    <div className={classes.row}>
                                        {
                                            (router.query.id!=='new'&&['суперорганизация', 'организация', 'агент', 'экспедитор', 'admin', 'суперагент'].includes(profile.role))/*||(data.client.user&&profile._id===data.client.user._id)*/?
                                                <>
                                                <Button onClick={async()=>{
                                                    let checkPhone = true
                                                    for(let i=0; i<phone.length; i++){
                                                        checkPhone = validPhone(phone[i])
                                                    }
                                                    if(name&&address&&address[0]&&address[0][0]&&address[0][2]&&checkPhone) {
                                                        let editElement = {_id: data.client._id}
                                                        if (image) editElement.image = image
                                                        if (name && name.length > 0 && name !== data.client.name) editElement.name = name
                                                        if (category && category !== data.client.category) editElement.category = category
                                                        editElement.address = address
                                                        if (email !== data.client.email) editElement.email = email
                                                        if (inn !== data.client.inn) editElement.inn = inn
                                                        if (login && login.length > 0 && data.client.user.login !== login) editElement.login = login
                                                        editElement.phone = phone
                                                        if (info && info.length > 0 && info !== data.client.info) editElement.info = info
                                                        if (city && city.length > 0 && city !== data.client.city) editElement.city = city
                                                        if (newPass && newPass.length > 0) editElement.newPass = newPass
                                                       const action = async () => {
                                                            await setClient(editElement)
                                                        }
                                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                        showMiniDialog(true)
                                                    }
                                                    else {
                                                        showSnackBar('Заполните поля: имя, город, адрес и телефон')
                                                    }
                                                }} size='small' color='primary'>
                                                    Сохранить
                                                </Button>
                                                {
                                                    profile.role==='admin' ?
                                                        <Button onClick={async()=>{
                                                            const action = async() => {
                                                                await deleteClient([data.client._id])
                                                                Router.push('/clients')
                                                            }
                                                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                            showMiniDialog(true)
                                                        }} size='small' color='secondary'>
                                                            Удалить
                                                        </Button>
                                                        :
                                                        null
                                                }
                                                {['агент','суперорганизация', 'организация', 'admin', 'суперагент'].includes(profile.role)?
                                                    <Button onClick={async()=>{
                                                        const action = async() => {
                                                            await onoffClient([data.client._id])
                                                            setStatus(status==='active'?'deactive':'active')
                                                        }
                                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                        showMiniDialog(true)
                                                    }} size='small' color={status==='active'?'primary':'secondary'}>
                                                        {status==='active'?'Активный':'Неактивный'}
                                                    </Button>
                                                    :
                                                        null
                                                }
                                                </>
                                                :
                                                router.query.id==='new'&&(profile.role==='admin'||(profile.addedClient&&['суперорганизация', 'организация', 'агент'].includes(profile.role)))?
                                                    <Button onClick={async()=>{
                                                        let checkPhone = true
                                                        for(let i=0; i<phone.length; i++){
                                                            checkPhone = validPhone(phone[i])
                                                        }
                                                        if(name&&login&&newPass&&address&&address[0]&&address[0][0]&&address[0][2]&&city&&checkPhone){
                                                            let editElement = {login: login, password: newPass, category: category}
                                                            if(image!==undefined)editElement.image = image
                                                            if(name.length>0)editElement.name = name
                                                            editElement.address = address
                                                            if(email.length>0)editElement.email = email
                                                            if(inn.length>0)editElement.inn = inn
                                                            editElement.phone = phone
                                                            if(info.length>0)editElement.info = info
                                                            if(city.length>0)editElement.city = city
                                                            const action = async() => {
                                                                await addClient(editElement)
                                                                Router.push('/clients')
                                                            }
                                                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                            showMiniDialog(true)
                                                        }
                                                        else {
                                                            showSnackBar('Заполните поля: имя, адрес, город и телефон')
                                                        }
                                                    }} size='small' color='primary'>
                                                        Добавить
                                                    </Button>
                                                    :
                                                    null

                                        }
                                    </div>
                                </div>
                                </>
                                :
                                <>

                                <div className={classes.column}>
                                    <img
                                        className={classes.media}
                                        src={preview}
                                        alt={name}
                                    />
                                </div>
                                <div style={{width: isMobileApp?'100%':'calc(100% - 300px)'}}>
                                    <div className={classes.name}>
                                        {name}
                                    </div>
                                    <div className={classes.row}>
                                        <div className={classes.nameField}>
                                            Категория:&nbsp;
                                        </div>
                                        <div className={classes.value}>
                                            {category}
                                        </div>
                                    </div>
                                    <div className={classes.row}>
                                        <div className={classes.nameField}>
                                            Адрес:&nbsp;
                                        </div>
                                        <div className={classes.column}>
                                            {address?address.map((element, idx)=>
                                                <div key={`address${idx}`}>
                                                <div className={classes.value}>
                                                    {`${element[2]?`${element[2]}, `:''}${element[0]}`}
                                                </div>
                                                <div className={classes.geo} style={{color: element[1]?'#ffb300':'red'}} onClick={()=>{
                                                    if(element[1]) {
                                                        setFullDialog('Геолокация', <Geo geo={element[1]}/>)
                                                        showFullDialog(true)
                                                    }
                                                }}>
                                                    {
                                                        element[1]?
                                                            'Посмотреть геолокацию'
                                                            :
                                                            'Геолокация не задана'
                                                    }
                                                </div>
                                                </div>
                                            ):null}
                                        </div>
                                    </div>
                                    <div className={classes.row}>
                                        <div className={classes.nameField}>
                                            ИНН:&nbsp;
                                        </div>
                                        <div className={classes.value}>
                                            {inn}
                                        </div>
                                    </div>
                                    <div className={classes.row}>
                                        <div className={classes.nameField}>
                                            E-mail:&nbsp;
                                        </div>
                                        <div className={classes.value}>
                                            {email}
                                        </div>
                                    </div>
                                    <div className={classes.row}>
                                        <div className={classes.nameField}>
                                            Телефон:&nbsp;
                                        </div>
                                        <div className={classes.value}>
                                            <div className={classes.column}>
                                                {phone?phone.map((element, idx)=>
                                                    <div className={classes.value} key={`phone${idx}`}>
                                                        {element}
                                                    </div>
                                                ):null}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={classes.info}>
                                        {info}
                                    </div>
                                </div>
                                </>
                            :
                            'Ничего не найдено'
                            }
                        </CardContent>
                </Card>
            <input
                accept='image/*'
                style={{ display: 'none' }}
                id='contained-button-file'
                type='file'
                onChange={handleChangeImage}
            />
        </App>
    )
})

Client.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    return {
        data: {...(ctx.query.id==='new'?
            {
                client:
                    {
                        name: '',
                        email: '',
                        inn: '',
                        phone: [],
                        address: [],
                        info: '',
                        image: '/static/add.png',
                        reiting: 0,
                        city: '',
                        type: '',
                        birthday: null,
                        user: null,
                        patent: null,
                        passport: null,
                        certificate: null,
                        category: 'B'
                    }
            }
        :
            await getClient({_id: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined))}
    };
};

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

export default connect(mapStateToProps, mapDispatchToProps)(Client);
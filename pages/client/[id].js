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
import Confirmation from '../../components/dialog/Confirmation'
import Geo from '../../components/dialog/Geo'
import { useRouter } from 'next/router'
import {cities, maxImageSize, pdDDMMYYHHMM} from '../../src/lib'
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import * as snackbarActions from '../../redux/actions/snackbar'
import Router from 'next/router'
import { getClientGqlSsr } from '../../src/getClientGQL'
import { validPhone } from '../../src/lib'
import initialApp from '../../src/initialApp'
import {getClientNetworks} from '../../src/gql/clientNetwork';

const withoutNetwork = {name: 'Без сети', _id: null}

const Client = React.memo((props) => {
    const classes = clientStyle();
    const router = useRouter()
    //props
    const {profile} = props.user;
    const {data} = props;
    const {isMobileApp} = props.app;
    const {showSnackBar} = props.snackbarActions;
    const {setMiniDialog, showMiniDialog, showFullDialog, setFullDialog} = props.mini_dialogActions;
    //status
    let [status, setStatus] = useState(data.client?data.client.user.status:'');
    //name
    let [name, setName] = useState(data.client?data.client.name:'');
    //inn
    let [inn, setInn] = useState(data.client?data.client.inn:'');
    //email
    let [email, setEmail] = useState(data.client?data.client.email:'');
    //phone
    let [phone, setPhone] = useState(data.client?data.client.phone:[]);
    let addPhone = () => {
        phone = [...phone, '+996']
        setPhone(phone)
    };
    let editPhone = (event, idx) => {
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
    let deletePhone = (idx) => {
        phone.splice(idx, 1);
        setPhone([...phone])
    };
    //login
    let [login, setLogin] = useState(data.client?data.client.user.login:'');
    //category
    let categorys = ['A','B','C','D','Horeca']
    let [category, setCategory] = useState(data.client?data.client.category:'B');
    let handleCategory =  (event) => {
        setCategory(event.target.value)
    };
    //привести к геолокации
    if(data.client&&data.client.address.length&&!Array.isArray(data.client.address[0])) data.client.address.map((addres) =>[addres])
    //city
    let [city, setCity] = useState(data.client?data.client.city:profile.city?profile.city:'Бишкек');
    let handleCity =  (event) => {
        setCity(event.target.value)
    };
    //address
    let [address, setAddress] = useState(data.client?data.client.address:[['']]);
    let editAddress = (event, idx) => {
        address[idx][0] = event.target.value
        setAddress([...address])
    };
    let editAddressName = (event, idx) => {
        address[idx][2] = event.target.value
        setAddress([...address])
    };
    let setAddressGeo = (geo, idx) => {
        address[idx][1] = geo
        setAddress([...address])
    };
    //info
    let [info, setInfo] = useState(data.client?data.client.info:'');
    //image
    let [preview, setPreview] = useState(data.client?data.client.image:'/static/add.png');
    let [image, setImage] = useState(null);
    let handleChangeImage = ((event) => {
        if(event.target.files[0]&&event.target.files[0].size/1024/1024<maxImageSize) {
            setImage(event.target.files[0])
            setPreview(URL.createObjectURL(event.target.files[0]))
        } else showSnackBar('Файл слишком большой')
    })
    //newPass
    let [newPass, setNewPass] = useState('');
    let handleNewPass =  (event) => {
        setNewPass(event.target.value)
    };
    //hide
    let [hide, setHide] = useState(true);
    let handleHide =  () => setHide(hide => !hide);
    //networks
    let [networks, setNetworks] = useState([withoutNetwork]);
    useEffect(() => {(async () => {
        networks = [withoutNetwork, ...await getClientNetworks({search: ''})]
        setNetworks(networks)
    })()}, [])
    let [network, setNetwork] = useState(data.client&&data.client.network?data.client.network:withoutNetwork);
    let handleNetwork =  (event) => setNetwork({_id: event.target.value});
    //проверка заполненности полей
    useEffect(() => {
        if(!name||!city||!phone.length||!address.length||!address[0]||!address[0][0]||!address[0][1]) {
            showSnackBar(`Обязательно заполните: ${!address[0][1]?'геолокацию; ':''}${!name?'имя; ':''}${!city?'город; ':''}${!phone.length?'номер телефона; ':''}${!address.length||!address[0]||!address[0][0]?'адрес;':''}`)
        }
    }, [])
    //render
    return (
        <App pageName={router.query.id==='new'?'Добавить':data.client?data.client.name:'Ничего не найдено'}>
            <Head>
                <title>{router.query.id==='new'?'Добавить':data.client?data.client.name:'Ничего не найдено'}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={isMobileApp?classes.column:classes.row} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    {router.query.id==='new'||data.client?
                        ['admin', 'суперагент', 'суперорганизация', 'организация', 'агент', 'экспедитор'].includes(profile.role)/*||(data.client.user&&profile._id===data.client.user._id)*/?
                                <>
                                <div className={classes.column}>
                                    <label htmlFor='contained-button-file'>
                                        <img
                                            className={classes.media}
                                            style={preview==='/static/add.png'?{border: '1px red solid'}:null}
                                            src={preview?preview:'/static/add.png'}
                                            alt={'Добавить'}
                                        />
                                    </label>
                                    {
                                        ['admin', 'суперагент'].includes(profile.role)&&data.client?
                                            <div className={classes.row}>
                                                <b>
                                                    Регистрация:&nbsp;
                                                </b>
                                                <div>
                                                    {pdDDMMYYHHMM(data.client.createdAt)}
                                                </div>
                                            </div>
                                            :
                                            null
                                    }
                                    {
                                        ['admin', 'суперагент'].includes(profile.role)&&data.client&&data.client.createdAt!==data.client.updatedAt?
                                            <div className={classes.row}>
                                                <b>
                                                    Обновлен:&nbsp;
                                                </b>
                                                <div>
                                                    {pdDDMMYYHHMM(data.client.updatedAt)}
                                                </div>
                                            </div>
                                            :
                                            null
                                    }
                                    {
                                        ['admin', 'суперагент'].includes(profile.role)&&data.client&&data.client.lastActive?
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
                                        error={!name}
                                        value={name}
                                        className={classes.input}
                                        onChange={(event) => {setName(event.target.value)}}
                                    />
                                    <FormControl className={classes.input}>
                                        <InputLabel>Категория</InputLabel>
                                        <Select value={category} onChange={handleCategory}>
                                            {categorys.map((element) =>
                                                <MenuItem key={element} value={element} ola={element}>{element}</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        autoComplete='off'
                                        label='Логин'
                                        error={!login}
                                        value={login}
                                        className={classes.input}
                                        onChange={(event) => {setLogin(event.target.value)}}
                                    />
                                    <TextField
                                        autoComplete='new-password'
                                        label='Новый пароль'
                                        type={hide ? 'password' : 'text' }
                                        value={newPass}
                                        error={router.query.id==='new'&&!newPass}
                                        onChange={handleNewPass}
                                        className={classes.input}
                                        InputProps={{
                                            endAdornment: <InputAdornment position='end'>
                                                <IconButton onClick={handleHide}>
                                                    {hide ? <VisibilityOff />:<Visibility />  }
                                                </IconButton>
                                            </InputAdornment>
                                        }}
                                    />
                                    {
                                        profile.city?
                                            <TextField
                                                label='Город'
                                                value={city}
                                                className={classes.input}
                                                inputProps={{readOnly: true}}
                                            />
                                            :
                                            <FormControl className={classes.input}>
                                                <InputLabel>Город</InputLabel>
                                                <Select value={city} onChange={handleCity}>
                                                    {cities.map((element) =>
                                                        <MenuItem key={element} value={element} ola={element}>{element}</MenuItem>
                                                    )}
                                                </Select>
                                            </FormControl>
                                    }
                                    {address?address.map((element, idx) =>
                                            <div key={`address${idx}`}>
                                                <TextField
                                                    label='Название магазина'
                                                    error={!element[2]}
                                                    value={element[2]}
                                                    className={classes.input}
                                                    onChange={(event) => {editAddressName(event, idx)}}
                                                />
                                                <TextField
                                                    label='Адрес магазина'
                                                    error={!element[0]}
                                                    value={element[0]}
                                                    className={classes.input}
                                                    onChange={(event) => {editAddress(event, idx)}}
                                                />
                                                <div className={classes.geo} style={{marginTop: 5, color: element[1]?'#ffb300':'red'}} onClick={() => {
                                                    setFullDialog('Геолокация', <Geo change geo={element[1]} setAddressGeo={setAddressGeo} idx={idx}/>)
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
                                    {phone?phone.map((element, idx) =>
                                        <div key={`phone${idx}`}>
                                            <FormControl className={classes.input}>
                                                <InputLabel color={validPhone(element)?'primary':'secondary'}>Телефон. Формат: +996555780861</InputLabel>
                                                <Input
                                                    placeholder='Телефон. Формат: +996555780861'
                                                    value={element}
                                                    className={classes.input}
                                                    onChange={(event) => {editPhone(event, idx)}}
                                                    error={!validPhone(element)}
                                                    endAdornment={
                                                        <InputAdornment position='end'>
                                                            <IconButton onClick={() => deletePhone(idx)}>
                                                                <Remove/>
                                                            </IconButton>
                                                        </InputAdornment>
                                                    }
                                                />
                                            </FormControl>
                                        </div>
                                    ): null}
                                    <Button onClick={() => addPhone()} size='small' color='primary'>
                                        Добавить телефон
                                    </Button>
                                    <TextField
                                        label='ИНН'
                                        value={inn}
                                        className={classes.input}
                                        onChange={(event) => {setInn(event.target.value)}}
                                    />
                                    <TextField
                                        autoComplete='off'
                                        label='email'
                                        value={email}
                                        className={classes.input}
                                        onChange={(event) => {setEmail(event.target.value)}}
                                    />
                                    <TextField
                                        multiline
                                        label='Информация'
                                        value={info}
                                        className={classes.input}
                                        onChange={(event) => {setInfo(event.target.value)}}
                                    />
                                    <FormControl className={classes.input}>
                                        <InputLabel>Сеть</InputLabel>
                                        <Select value={network&&network._id} onChange={handleNetwork}>
                                            {networks.map((element) => <MenuItem key={element._id} value={element._id}>{element.name}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                    <div className={classes.row}>
                                        {
                                            (router.query.id!=='new'&&['суперорганизация', 'организация', 'агент', 'экспедитор', 'admin', 'суперагент'].includes(profile.role))/*||(data.client.user&&profile._id===data.client.user._id)*/?
                                                <>
                                                <Button onClick={() => {
                                                    let checkPhone = true
                                                    for(let i=0; i<phone.length; i++) {
                                                        checkPhone = validPhone(phone[i])
                                                    }
                                                    if(name&&address&&address[0]&&address[0][0]&&address[0][2]&&checkPhone) {
                                                        let editElement = {_id: data.client._id}
                                                        if(image) editElement.image = image
                                                        if(name && name.length && name !== data.client.name) editElement.name = name
                                                        if(category && category !== data.client.category) editElement.category = category
                                                        editElement.address = address
                                                        if(email !== data.client.email) editElement.email = email
                                                        if(inn !== data.client.inn) editElement.inn = inn
                                                        if(login && login.length && data.client.user.login !== login) editElement.login = login
                                                        editElement.phone = phone
                                                        if(info && info.length && info !== data.client.info) editElement.info = info
                                                        if(city && city.length && city !== data.client.city) editElement.city = city
                                                        if((network?network._id:null) !== (data.client.network?data.client.network._id:null)) editElement.network = network._id
                                                        if(newPass && newPass.length) editElement.newPass = newPass
                                                       const action = async () => await setClient(editElement)
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
                                                        <Button onClick={() => {
                                                            const action = async () => {
                                                                await deleteClient(data.client._id)
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
                                                    <Button onClick={() => {
                                                        const action = async () => {
                                                            await onoffClient(data.client._id)
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
                                                    <Button onClick={() => {
                                                        let checkPhone = true
                                                        for(let i=0; i<phone.length; i++) {
                                                            checkPhone = validPhone(phone[i])
                                                        }
                                                        if(name&&login&&newPass&&address&&address[0]&&address[0][0]&&address[0][2]&&city&&checkPhone) {
                                                            let editElement = {login: login, password: newPass, category, }
                                                            if(network)editElement.network = network._id
                                                            if(image)editElement.image = image
                                                            if(name.length)editElement.name = name
                                                            editElement.address = address
                                                            if(email.length)editElement.email = email
                                                            if(inn.length)editElement.inn = inn
                                                            editElement.phone = phone
                                                            if(info.length)editElement.info = info
                                                            if(city.length)editElement.city = city
                                                            const action = async () => {
                                                                const res = await addClient(editElement)
                                                                if(res)
                                                                    Router.push(`/client/${res}`)
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
                                            {address?address.map((element, idx) =>
                                                <div key={`address${idx}`}>
                                                <div className={classes.value}>
                                                    {`${element[2]?`${element[2]}, `:''}${element[0]}`}
                                                </div>
                                                <div className={classes.geo} style={{color: element[1]?'#ffb300':'red'}} onClick={() => {
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
                                                {phone?phone.map((element, idx) =>
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
        data: {
            client: await getClient(ctx.query.id, getClientGqlSsr(ctx.req))
        }
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
import Head from 'next/head';
import React, { useState, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import {deleteOrganization, getOrganization} from '../../src/gql/organization'
import organizationStyle from '../../src/styleMUI/organization/organization'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import { useRouter } from 'next/router'
import Router from 'next/router'
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import { onoffOrganization, addOrganization, setOrganization } from '../../src/gql/organization'
import InputAdornment from '@material-ui/core/InputAdornment';
import * as snackbarActions from '../../redux/actions/snackbar'
import Confirmation from '../../components/dialog/Confirmation'
import {checkFileInput, checkImageInput, checkInt, formatAmount, inputInt} from '../../src/lib'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Geo from '../../components/dialog/Geo'
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import * as lib from '../../src/lib'

const Organization = React.memo((props) => {
    const classes = organizationStyle();
    const router = useRouter()
    //props
    const {data} = props;
    const {isMobileApp} = props.app;
    const {showSnackBar} = props.snackbarActions;
    const {profile} = props.user;
    const {setMiniDialog, showMiniDialog, setFullDialog, showFullDialog} = props.mini_dialogActions;
    //state
    let [statusO, setStatusO] = useState(data.organization?data.organization.status:'');
    let [name, setName] = useState(data.organization?data.organization.name:'');
    let [onlyDistrict, setOnlyDistrict] = useState(data.organization&&data.organization.onlyDistrict!==null?data.organization.onlyDistrict:false);
    let [unite, setUnite] = useState(data.organization&&data.organization.unite!=null?data.organization.unite:false);
    let [pass, setPass] = useState(data.organization&&data.organization.pass?data.organization.pass:'');
    let [requisites, setRequisites] = useState(data.organization&&data.organization.requisites?data.organization.requisites:'');
    let [superagent, setSuperagent] = useState(data.organization&&data.organization.superagent!=null?data.organization.superagent:false);
    let [onlyIntegrate, setOnlyIntegrate] = useState(data.organization&&data.organization.onlyIntegrate!==null?data.organization.onlyIntegrate:false);
    let [addedClient, setAddedClient] = useState(data.organization&&data.organization.addedClient!==null?data.organization.addedClient:false);
    let [agentSubBrand, setAgentSubBrand] = useState(data.organization&&data.organization.agentSubBrand!==null?data.organization.agentSubBrand:false);
    let [clientSubBrand, setClientSubBrand] = useState(data.organization&&data.organization.clientSubBrand!==null?data.organization.clientSubBrand:false);
    let [calculateStock, setCalculateStock] = useState(data.organization&&data.organization.calculateStock!==null?data.organization.calculateStock:false);
    let [calculateConsig, setCalculateConsig] = useState(data.organization&&data.organization.calculateConsig!==null?data.organization.calculateConsig:false);
    let [autoAcceptAgent, setAutoAcceptAgent] = useState(data.organization&&data.organization.autoAcceptAgent!==null?data.organization.autoAcceptAgent:false);
    let [autoAcceptNight, setAutoAcceptNight] = useState(data.organization&&data.organization.autoAcceptNight!==null?data.organization.autoAcceptNight:false);
    let [divideBySubBrand1C, setDivideBySubBrand1C] = useState(data.organization&&data.organization.divideBySubBrand1C!==null?data.organization.divideBySubBrand1C:false);
    let [clientDuplicate, setClientDuplicate] = useState(data.organization&&data.organization.clientDuplicate!==null?data.organization.clientDuplicate:false);
    let [divideBySubBrand, setDivideBySubBrand] = useState(data.organization&&data.organization.divideBySubBrand!==null?data.organization.divideBySubBrand:false);
    let [dateDelivery, setDateDelivery] = useState(data.organization&&data.organization.dateDelivery!==null?data.organization.dateDelivery:false);
    let [warehouse, setWarehouse] = useState(data.organization&&data.organization.warehouse!==null?data.organization.warehouse:'');
    let [refusal, setRefusal] = useState(data.organization&&data.organization.refusal!==null?data.organization.refusal:false);
    let [minimumOrder, setMinimumOrder] = useState(data.organization!==null?data.organization.minimumOrder:0);
    let [agentHistory, setAgentHistory] = useState(data.organization!==null?data.organization.agentHistory:100);
    let [priotiry, setPriotiry] = useState(data.organization!==null?data.organization.priotiry:0);
    let [address, setAddress] = useState(data.organization?data.organization.address:[]);
    let [cities, setCities] = useState(data.organization&&data.organization.cities?data.organization.cities:['Бишкек']);
    let handleCities =  (event) => {
        setCities([event.target.value])
    };
    let [newAddress, setNewAddress] = useState('');
    let addAddress = () => {
        address = [...address, newAddress]
        setAddress(address)
        setNewAddress('')
    };
    let editAddress = (event, idx) => {
        address[idx] = event.target.value
        setAddress([...address])
    };
    let deleteAddress = (idx) => {
        address.splice(idx, 1);
        setAddress([...address])
    };
    let [email, setEmail] = useState(data.organization!==null?data.organization.email:[]);
    let [newEmail, setNewEmail] = useState('');
    let addEmail = () => {
        email = [...email, newEmail]
        setEmail(email)
        setNewEmail('')
    };
    let editEmail = (event, idx) => {
        email[idx] = event.target.value
        setEmail([...email])
    };
    let deleteEmail = (idx) => {
        email.splice(idx, 1);
        setEmail([...email])
    };
    let [phone, setPhone] = useState(data.organization!==null?data.organization.phone:[]);
    let [newPhone, setNewPhone] = useState('');
    let addPhone = () => {
        phone = [...phone, newPhone]
        setPhone(phone)
        setNewPhone('')
    };
    let editPhone = (event, idx) => {
        phone[idx] = event.target.value
        setPhone([...phone])
    };
    let deletePhone = (idx) => {
        phone.splice(idx, 1);
        setPhone([...phone])
    };
    let [info, setInfo] = useState(data.organization!==null?data.organization.info:'');
    let [miniInfo, setMiniInfo] = useState(data.organization&&data.organization.miniInfo?data.organization.miniInfo:'');
    let [catalog, setCatalog] = useState(null);
    const catalogInput = useRef(true);
    let handleChangeCatalog = ((event) => {
        const file = checkFileInput(event)
        if(file)
            setCatalog(file)
        else showSnackBar('Файл слишком большой')
    })
    let [preview, setPreview] = useState(data.organization!==null?data.organization.image:'/static/add.png');
    let [image, setImage] = useState(null);
    let handleChangeImage = (async (event) => {
        const image = await checkImageInput(event)
        if(image) {
            setImage(image.upload)
            setPreview(image.preview)
        } else showSnackBar('Файл слишком большой')
    })
    //render
    return (
        <App pageName={router.query.id==='new'?'Добавить':data.organization!==null?data.organization.name:'Ничего не найдено'}>
            <Head>
                <title>{router.query.id==='new'?'Добавить':data.organization!==null?data.organization.name:'Ничего не найдено'}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={isMobileApp?classes.column:classes.row} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    {
                        router.query.id==='new'||data.organization?
                            profile.role==='admin'||(['суперорганизация', 'организация'].includes(profile.role)&&profile.organization===router.query.id)?
                                <>
                                <div className={classes.column}>
                                    <label htmlFor='contained-button-file'>
                                        <img
                                            className={classes.media}
                                            style={preview==='/static/add.png'?{border: '1px red solid'}:null}
                                            src={preview}
                                            alt={'Добавить'}
                                        />
                                    </label>
                                    {
                                        profile.role==='admin'?
                                            <>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={refusal}
                                                        onChange={() => setRefusal(!refusal)}
                                                        color='primary'
                                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                                    />
                                                }
                                                label='Отказы'
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={onlyDistrict}
                                                        onChange={() => setOnlyDistrict(!onlyDistrict)}
                                                        color='primary'
                                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                                    />
                                                }
                                                label='Только в районах'
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={unite}
                                                        onChange={() => setUnite(!unite)}
                                                        color='primary'
                                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                                    />
                                                }
                                                label='Объединять заказы'
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={superagent}
                                                        onChange={() => {setSuperagent(!superagent)}}
                                                        color='primary'
                                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                                    />
                                                }
                                                label='Суперагент'
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={onlyIntegrate}
                                                        onChange={() => {setOnlyIntegrate(!onlyIntegrate)}}
                                                        color='primary'
                                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                                    />
                                                }
                                                label='Только по интеграции'
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={dateDelivery}
                                                        onChange={() => {setDateDelivery(!dateDelivery)}}
                                                        color='primary'
                                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                                    />
                                                }
                                                label='Дата доставки'
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={addedClient}
                                                        onChange={() => {setAddedClient(!addedClient)}}
                                                        color='primary'
                                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                                    />
                                                }
                                                label='Добавлять клиентов'
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={agentSubBrand}
                                                        onChange={() => {setAgentSubBrand(!agentSubBrand)}}
                                                        color='primary'
                                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                                    />
                                                }
                                                label='Подбренды у агента'
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={clientSubBrand}
                                                        onChange={() => {setClientSubBrand(!clientSubBrand)}}
                                                        color='primary'
                                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                                    />
                                                }
                                                label='Подбренды у клиента'
                                            />
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={autoAcceptAgent}
                                                            onChange={() => {setAutoAcceptAgent(!autoAcceptAgent)}}
                                                            color='primary'
                                                            inputProps={{ 'aria-label': 'primary checkbox' }}
                                                        />
                                                    }
                                                    label='Автоприем заказов агентов'
                                                />
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={autoAcceptNight}
                                                            onChange={() => {setAutoAcceptNight(!autoAcceptNight)}}
                                                            color='primary'
                                                            inputProps={{ 'aria-label': 'primary checkbox' }}
                                                        />
                                                    }
                                                    label='Автоприем заказов ночью'
                                                />
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={clientDuplicate}
                                                            onChange={() => {setClientDuplicate(!clientDuplicate)}}
                                                            color='primary'
                                                            inputProps={{ 'aria-label': 'primary checkbox' }}
                                                        />
                                                    }
                                                    label='Клиенты повторяются в районах'
                                                />
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={divideBySubBrand}
                                                            onChange={() => {
                                                                setDivideBySubBrand(!divideBySubBrand)
                                                            }}
                                                            color='primary'
                                                            inputProps={{ 'aria-label': 'primary checkbox' }}
                                                        />
                                                    }
                                                    label='Делить по подбрендам'
                                                />
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={divideBySubBrand1C}
                                                            onChange={() => {
                                                                setDivideBySubBrand1C(!divideBySubBrand1C)
                                                            }}
                                                            color='primary'
                                                            inputProps={{ 'aria-label': 'primary checkbox' }}
                                                        />
                                                    }
                                                    label='Делить по подбрендам 1С'
                                                />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={calculateStock}
                                                        onChange={() => {setCalculateStock(!calculateStock)}}
                                                        color='primary'
                                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                                    />
                                                }
                                                label='Подсчет остатков'
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={calculateConsig}
                                                        onChange={() => {setCalculateConsig(!calculateConsig)}}
                                                        color='primary'
                                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                                    />
                                                }
                                                label='Подсчет консигнаций'
                                            />
                                            <br/>
                                            <div className={classes.geo} style={{color: warehouse&&warehouse.length?'#ffb300':'red'}} onClick={() => {
                                                setFullDialog('Геолокация', <Geo change geo={warehouse} setAddressGeo={setWarehouse}/>)
                                                showFullDialog(true)
                                            }}>
                                                Склад
                                            </div>
                                            <div className={classes.row}>
                                                {
                                                    data.organization&&data.organization.catalog?
                                                        <Button onClick={() => {
                                                            window.open(data.organization.catalog, '_blank');
                                                        }} size='small' color='primary'>
                                                            Открыть каталог
                                                        </Button>
                                                        :
                                                        null
                                                }
                                                <Button onClick={() => {
                                                    catalogInput.current.click()
                                                }} size='small' color={catalog?'primary':'secondary'}>
                                                    Загрузить каталог
                                                </Button>
                                            </div>
                                            </>
                                            :
                                            null
                                    }
                                </div>
                                <div>
                                    <TextField
                                        label='Имя'
                                        error={!name}
                                        value={name}
                                        className={isMobileApp?classes.inputM:classes.inputD}
                                        onChange={(event) => {setName(event.target.value)}}
                                    />
                                    <FormControl error={!cities.length} className={isMobileApp?classes.inputM:classes.inputD}>
                                        <InputLabel>Город</InputLabel>
                                        <Select
                                            value={cities}
                                            onChange={handleCities}
                                            input={<Input />}
                                            inputProps={{readOnly: profile.role!=='admin',}}
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
                                    <TextField
                                        multiline
                                        label='Мини описание'
                                        error={!miniInfo}
                                        value={miniInfo}
                                        className={isMobileApp?classes.inputM:classes.inputD}
                                        onChange={(event) => {setMiniInfo(event.target.value)}}
                                    />
                                    <FormControl className={isMobileApp?classes.inputM:classes.inputD}>
                                        <InputLabel>Минимальный заказ</InputLabel>
                                        <Input
                                            type={ isMobileApp?'number':'text'}
                                            value={minimumOrder}
                                            onChange={(event) => {setMinimumOrder(inputInt(event.target.value))}}
                                        />
                                    </FormControl>
                                    <FormControl className={isMobileApp?classes.inputM:classes.inputD}>
                                        <InputLabel>История агента</InputLabel>
                                        <Input
                                            type={ isMobileApp?'number':'text'}
                                            value={agentHistory}
                                            onChange={(event) => {setAgentHistory(inputInt(event.target.value))}}
                                        />
                                    </FormControl>
                                    <TextField
                                        label='Приоритет'
                                        value={priotiry}
                                        type={ isMobileApp?'number':'text'}
                                        className={isMobileApp?classes.inputM:classes.inputD}
                                        onChange={(event) => {setPriotiry(inputInt(event.target.value))}}
                                        inputProps={{readOnly: profile.role!=='admin',}}
                                    />
                                    <TextField
                                        label='Интеграция'
                                        value={pass}
                                        className={isMobileApp?classes.inputM:classes.inputD}
                                        onChange={(event) => {setPass(event.target.value)}}
                                        inputProps={{readOnly: profile.role!=='admin',}}
                                    />
                                    {address.map((element, idx) =>
                                        <FormControl  key={`address${idx}`} className={isMobileApp?classes.inputM:classes.inputD}>
                                            <InputLabel>Адрес{idx+1}</InputLabel>
                                            <Input
                                                placeholder='Адрес'
                                                value={element}
                                                onChange={(event) => {editAddress(event, idx)}}
                                                endAdornment={
                                                    <InputAdornment position='end'>
                                                        <Button variant='text' size='small' color='secondary' onClick={() => deleteAddress(idx)}>
                                                            Удалить
                                                        </Button>
                                                    </InputAdornment>
                                                }
                                            />
                                        </FormControl>
                                    )}
                                    <br/>
                                    <Button onClick={() => {
                                        addAddress()
                                    }} size='small' color={address[0]?'primary':'secondary'}>
                                        Добавить адрес
                                    </Button>
                                    {email.map((element, idx) =>
                                        <FormControl  key={`email${idx}`} className={isMobileApp?classes.inputM:classes.inputD}>
                                            <InputLabel>Email{idx+1}</InputLabel>
                                            <Input
                                                value={element}
                                                onChange={(event) => {editEmail(event, idx)}}
                                                endAdornment={
                                                    <InputAdornment position='end'>
                                                        <Button variant='text' size='small' color='secondary' onClick={() => deleteEmail(idx)}>
                                                            Удалить
                                                        </Button>
                                                    </InputAdornment>
                                                }
                                            />
                                        </FormControl>
                                    )}
                                    <br/>
                                    <Button onClick={() => {
                                        addEmail()
                                    }} size='small' color='primary'>
                                        Добавить email
                                    </Button>
                                    {phone.map((element, idx) =>
                                        <FormControl  key={`phone${idx}`} className={isMobileApp?classes.inputM:classes.inputD}>
                                            <InputLabel>Телефон{idx+1}</InputLabel>
                                            <Input
                                                value={element}
                                                onChange={(event) => {editPhone(event, idx)}}
                                                endAdornment={
                                                    <InputAdornment position='end'>
                                                        <Button variant='text' size='small' color='secondary' onClick={() => deletePhone(idx)}>
                                                            Удалить
                                                        </Button>
                                                    </InputAdornment>
                                                }
                                            />
                                        </FormControl>
                                    )}
                                    <br/>
                                    <Button onClick={() => {
                                        addPhone()
                                    }} size='small' color={'primary'}>
                                        Добавить телефон
                                    </Button>
                                    <TextField
                                        multiline
                                        label='Реквизиты'
                                        value={requisites}
                                        className={isMobileApp?classes.inputM:classes.inputD}
                                        onChange={(event) => {setRequisites(event.target.value)}}
                                    />
                                    <TextField
                                        multiline
                                        label='Информация'
                                        error={!info}
                                        value={info}
                                        className={isMobileApp?classes.inputM:classes.inputD}
                                        onChange={(event) => {setInfo(event.target.value)}}
                                    />
                                    <div className={classes.row}>
                                        {
                                            router.query.id==='new'?
                                                <Button onClick={() => {
                                                    if(cities.length&&miniInfo&&image&&name&&address[0]&&info) {
                                                        const action = async () => {
                                                            const res = await addOrganization({
                                                                catalog,
                                                                cities,
                                                                pass,
                                                                requisites,
                                                                miniInfo,
                                                                priotiry: checkInt(priotiry),
                                                                refusal,
                                                                onlyDistrict,
                                                                unite,
                                                                superagent,
                                                                onlyIntegrate,
                                                                addedClient,
                                                                agentSubBrand,
                                                                clientSubBrand,
                                                                calculateStock,
                                                                calculateConsig,
                                                                autoAcceptAgent,
                                                                autoAcceptNight,
                                                                divideBySubBrand1C,
                                                                clientDuplicate,
                                                                divideBySubBrand,
                                                                dateDelivery,
                                                                warehouse,
                                                                image,
                                                                name,
                                                                address,
                                                                email,
                                                                phone,
                                                                info,
                                                                minimumOrder: checkInt(minimumOrder),
                                                                agentHistory: checkInt(agentHistory)
                                                            })
                                                            if(res)
                                                                Router.back()
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
                                                <Button onClick={() => {
                                                    let editElement = {_id: data.organization._id}
                                                    if(image)editElement.image = image
                                                    if(pass!==data.organization.pass)editElement.pass = pass
                                                    if(requisites!==data.organization.requisites)editElement.requisites = requisites
                                                    if(name.length&&name!==data.organization.name)editElement.name = name
                                                    if(cities.length&&JSON.stringify(cities)!==JSON.stringify(data.organization.cities)) editElement.cities = cities
                                                    if(address.length&&address!==data.organization.address)editElement.address = address
                                                    if(email.length&&email!==data.organization.email)editElement.email = email
                                                    if(phone.length&&phone!==data.organization.phone)editElement.phone = phone
                                                    if(info.length&&info!==data.organization.info)editElement.info = info
                                                    if(miniInfo.length&&miniInfo!==data.organization.miniInfo)editElement.miniInfo = miniInfo
                                                    if(onlyDistrict!==data.organization.onlyDistrict)editElement.onlyDistrict = onlyDistrict
                                                    if(unite!==data.organization.unite)editElement.unite = unite
                                                    if(superagent!==data.organization.superagent)editElement.superagent = superagent
                                                    if(onlyIntegrate!==data.organization.onlyIntegrate)editElement.onlyIntegrate = onlyIntegrate
                                                    if(addedClient!==data.organization.addedClient)editElement.addedClient = addedClient
                                                    if(agentSubBrand!==data.organization.agentSubBrand)editElement.agentSubBrand = agentSubBrand
                                                    if(clientSubBrand!==data.organization.clientSubBrand)editElement.clientSubBrand = clientSubBrand
                                                    if(calculateStock!==data.organization.calculateStock)editElement.calculateStock = calculateStock
                                                    if(calculateConsig!==data.organization.calculateConsig)editElement.calculateConsig = calculateConsig
                                                    if(autoAcceptAgent!==data.organization.autoAcceptAgent)editElement.autoAcceptAgent = autoAcceptAgent
                                                    if(autoAcceptNight!==data.organization.autoAcceptNight)editElement.autoAcceptNight = autoAcceptNight
                                                    if(divideBySubBrand1C!==data.organization.divideBySubBrand1C)editElement.divideBySubBrand1C = divideBySubBrand1C
                                                    if(clientDuplicate!==data.organization.clientDuplicate)editElement.clientDuplicate = clientDuplicate
                                                    if(divideBySubBrand!==data.organization.divideBySubBrand)editElement.divideBySubBrand = divideBySubBrand
                                                    if(dateDelivery!==data.organization.dateDelivery)editElement.dateDelivery = dateDelivery
                                                    if(warehouse!==data.organization.warehouse)editElement.warehouse = warehouse
                                                    if(refusal!==data.organization.refusal)editElement.refusal = refusal
                                                    if(minimumOrder!==data.organization.minimumOrder)editElement.minimumOrder = checkInt(minimumOrder)
                                                    if(agentHistory!==data.organization.agentHistory)editElement.agentHistory = checkInt(agentHistory)
                                                    if(catalog&&catalog!==data.organization.catalog)editElement.catalog = catalog
                                                    if(priotiry!==data.organization.priotiry)editElement.priotiry = checkInt(priotiry)
                                                    const action = async () => await setOrganization(editElement)
                                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                    showMiniDialog(true)
                                                }} size='small' color='primary'>
                                                    Сохранить
                                                </Button>
                                                {profile.role==='admin'?
                                                    <>
                                                    <Button onClick={() => {
                                                        const action = async () => {
                                                            await onoffOrganization(data.organization._id)
                                                            setStatusO(statusO==='active'?'deactive':'active')
                                                        }
                                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                        showMiniDialog(true)
                                                    }} size='small'  color={statusO==='active'?'primary':'secondary'}>
                                                        {statusO==='active'?'Отключить':'Включить'}
                                                    </Button>
                                                    <Button onClick={() => {
                                                        const action = async () => {
                                                            await deleteOrganization(data.organization._id)
                                                            Router.push('/organizations')
                                                        }
                                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                        showMiniDialog(true)
                                                    }} size='small' color='secondary'>
                                                        Удалить
                                                    </Button>
                                                    </>
                                                    :
                                                    null
                                                }
                                                </>
                                        }
                                    </div>
                                </div>
                                </>
                                :
                                <>
                                    <img
                                        className={classes.media}
                                        src={preview}
                                        alt={name}
                                    />
                                    <div style={{width: isMobileApp?'100%':'calc(100% - 300px)'}}>
                                        <div className={classes.name}>
                                            {name}
                                        </div>
                                        <br/>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>
                                                Адрес:&nbsp;
                                            </div>
                                            <div className={classes.column}>
                                                {address.map((element, idx) =>
                                                    <div key={`address${idx}`} className={classes.value}>
                                                        {element}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>
                                                Телефон:&nbsp;
                                            </div>
                                            <div className={classes.column}>
                                                {phone.map((element, idx) =>
                                                    <a href={`tel:${element}`} key={`phone${idx}`} className={classes.value}>
                                                        {element}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>
                                                E-mail:&nbsp;
                                            </div>
                                            <div className={classes.column}>
                                                {email.map((element, idx) =>
                                                    <a href={`mailto:${element}`} key={`email${idx}`} className={classes.value}>
                                                        {element}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        {
                                            minimumOrder?
                                                <div className={classes.row}>
                                                    <div className={classes.nameField}>
                                                        Минимальный заказ:&nbsp;
                                                    </div>
                                                    <div className={classes.value}>
                                                        {formatAmount(minimumOrder)}&nbsp;сом
                                                    </div>
                                                </div>
                                                :
                                                null
                                        }
                                        <br/>
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
            <input
                style={{ display: 'none' }}
                ref={catalogInput}
                type='file'
                onChange={handleChangeCatalog}
            />
        </App>
    )
})

Organization.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!ctx.store.getState().user.profile.role)
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            organization: ctx.query.id!=='new'?await getOrganization(ctx.query.id, getClientGqlSsr(ctx.req)):null
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

export default connect(mapStateToProps, mapDispatchToProps)(Organization);
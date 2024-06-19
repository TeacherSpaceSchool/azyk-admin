import Head from 'next/head';
import React, { useState } from 'react';
import App from '../layouts/App';
import { connect } from 'react-redux'
import { getContact, setContact } from '../src/gql/contact'
import contactStyle from '../src/styleMUI/contact'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../redux/actions/mini_dialog'
import * as snackbarActions from '../redux/actions/snackbar'
import Remove from '@material-ui/icons/Remove';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Confirmation from '../components/dialog/Confirmation'
import AddSocial from '../components/dialog/AddSocial'
import Geo from '../components/dialog/Geo'
import { urlMain } from '../redux/constants/other'
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import PhoneIcon from "@material-ui/icons/Phone";


const Contact = React.memo((props) => {
    const classes = contactStyle();
    const { data } = props;
    const { isMobileApp } = props.app;
    const { showSnackBar } = props.snackbarActions;
    let [name, setName] = useState(data.contact.name);
    let [address, setAddress] = useState(data.contact.address);
    let [newAddress, setNewAddress] = useState('');
    let addAddress = ()=>{
        address = [...address, newAddress]
        setAddress(address)
        setNewAddress('')
    };
    let editAddress = (event, idx)=>{
        address[idx] = event.target.value
        setAddress([...address])
    };
    let deleteAddress = (idx)=>{
        address.splice(idx, 1);
        setAddress([...address])
    };
    let [warehouse, setWarehouse] = useState(data.contact.warehouse);
    let [email, setEmail] = useState(data.contact.email);
    let [newEmail, setNewEmail] = useState('');
    let addEmail = ()=>{
        email = [...email, newEmail]
        setEmail(email)
        setNewEmail('')
    };
    let editEmail = (event, idx)=>{
        email[idx] = event.target.value
        setEmail([...email])
    };
    let deleteEmail = (idx)=>{
        email.splice(idx, 1);
        setEmail([...email])
    };
    let [phone, setPhone] = useState(data.contact.phone);
    let [newPhone, setNewPhone] = useState('');
    let addPhone = ()=>{
        phone = [...phone, newPhone]
        setPhone(phone)
        setNewPhone('')
    };
    let editPhone = (event, idx)=>{
        phone[idx] = event.target.value
        setPhone([...phone])
    };
    let deletePhone = (idx)=>{
        phone.splice(idx, 1);
        setPhone([...phone])
    };
    let [social, setSocial] = useState(data.contact.social);
    let addSocial = (value, idx)=>{
        social[idx] = value
        setSocial([...social])
    };
    let [info, setInfo] = useState(data.contact.info);
    let [preview, setPreview] = useState(data.contact.image===''?'/static/add.png':data.contact.image);
    let [image, setImage] = useState(undefined);
    let handleChangeImage = ((event) => {
        if(event.target.files[0].size/1024/1024<50){
            setImage(event.target.files[0])
            setPreview(URL.createObjectURL(event.target.files[0]))
        } else {
            showSnackBar('Файл слишком большой')
        }
    })
    const { profile } = props.user;
    const { setMiniDialog, showMiniDialog, setFullDialog, showFullDialog } = props.mini_dialogActions;
    return (
        <App filters={data.filterSubCategory} sorts={data.sortSubCategory} pageName='Контакты'>
            <Head>
                <title>Контакты</title>
                <meta name='description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:title' content='Азык - электронный склад связывающий производителя с торговой точкой' />
                <meta property='og:description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:type' content='website' />
                <meta property='og:image' content={`${urlMain}/static/512x512.png`} />
                <meta property='og:url' content={`${urlMain}/contact`} />
                <link rel='canonical' href={`${urlMain}/contact`}/>
            </Head>
            <Card className={classes.page}>
                    <CardContent className={isMobileApp?classes.column:classes.row}>
                        {
                            profile.role==='admin'?
                                <>
                                    <div className={classes.column}>
                                        <label htmlFor='contained-button-file'>
                                            <img
                                                className={isMobileApp?classes.mediaM:classes.mediaD}
                                                src={preview}
                                                alt={'Добавить'}
                                            />
                                        </label>
                                        <br/>
                                        <div className={classes.geo} style={{color: warehouse&&warehouse.length>0?'#ffb300':'red'}} onClick={()=>{
                                            setFullDialog('Геолокация', <Geo change={true} geo={warehouse} setAddressGeo={setWarehouse}/>)
                                            showFullDialog(true)
                                        }}>
                                            Склад
                                        </div>
                                        Наши страницы
                                        <div className={classes.row}>
                                            <img src='/static/instagram.svg' onClick={()=>{
                                                setMiniDialog('Instagram', <AddSocial social={social[0]} action={addSocial} idx={0}/>)
                                                showMiniDialog(true)
                                            }} className={classes.mediaSocial}/>
                                            <img src='/static/facebook.svg' onClick={()=>{
                                                setMiniDialog('Facebook', <AddSocial social={social[1]} action={addSocial} idx={1}/>)
                                                showMiniDialog(true)
                                            }} className={classes.mediaSocial}/>
                                            <img src='/static/twitter.svg' onClick={()=>{
                                                setMiniDialog('Twitter', <AddSocial social={social[2]} action={addSocial} idx={2}/>)
                                                showMiniDialog(true)
                                            }} className={classes.mediaSocial}/>
                                            <img src='/static/telegram.svg' onClick={()=>{
                                                setMiniDialog('Telegram', <AddSocial social={social[3]} action={addSocial} idx={3}/>)
                                                showMiniDialog(true)
                                            }} className={classes.mediaSocial}/>
                                        </div>
                                    </div>
                                    <div>
                                        <TextField
                                                label='Имя'
                                                value={name}
                                                className={classes.input}
                                                onChange={(event)=>{setName(event.target.value)}}
                                                inputProps={{
                                                    'aria-label': 'description',
                                                }}
                                            />
                                        {address.map((element, idx)=>
                                            <FormControl  key={`address${idx}`} className={classes.input}>
                                                <InputLabel>Адрес</InputLabel>
                                                <Input
                                                    placeholder='Адрес'
                                                    value={element}
                                                    onChange={(event)=>{editAddress(event, idx)}}
                                                    inputProps={{
                                                        'aria-label': 'description',
                                                    }}
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={()=>{
                                                                    deleteAddress(idx)
                                                                }}
                                                                aria-label='toggle password visibility'
                                                            >
                                                                <Remove/>
                                                            </IconButton>
                                                        </InputAdornment>
                                                    }
                                                />
                                            </FormControl>
                                        )}
                                        <Button onClick={async()=>{
                                            addAddress()
                                        }} size='small' color='primary'>
                                            Добавить адрес
                                        </Button>
                                        <br/>
                                        <br/>
                                        {email.map((element, idx)=>
                                            <FormControl  key={`email${idx}`} className={classes.input}>
                                                <InputLabel>Email</InputLabel>
                                                <Input
                                                    value={element}
                                                    onChange={(event)=>{editEmail(event, idx)}}
                                                    inputProps={{
                                                        'aria-label': 'description',
                                                    }}
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={()=>{
                                                                    deleteEmail(idx)
                                                                }}
                                                                aria-label='toggle password visibility'
                                                            >
                                                                <Remove/>
                                                            </IconButton>
                                                        </InputAdornment>
                                                    }
                                                />
                                            </FormControl>
                                        )}
                                        <Button onClick={async()=>{
                                            addEmail()
                                        }} size='small' color='primary'>
                                            Добавить email
                                        </Button>
                                        <br/>
                                        <br/>
                                        {phone.map((element, idx)=>
                                            <FormControl key={`phone${idx}`} className={classes.input}>
                                                <InputLabel>Телефон</InputLabel>
                                                <Input
                                                    value={element}
                                                    onChange={(event)=>{editPhone(event, idx)}}
                                                    inputProps={{
                                                        'aria-label': 'description',
                                                    }}
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
                                        )}
                                        <Button onClick={async()=>{
                                            addPhone()
                                        }} size='small' color='primary'>
                                            Добавить телефон
                                        </Button>
                                        <br/>
                                        <br/>
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
                                            <Button onClick={async()=>{
                                                let editElement = {
                                                    name: name,
                                                    address: address,
                                                    email: email,
                                                    phone: phone,
                                                    social: social,
                                                    info: info,
                                                    warehouse: warehouse
                                                }
                                                if(image!==undefined)editElement.image = image
                                                const action = async() => {
                                                    await setContact(editElement)
                                                }
                                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                showMiniDialog(true)
                                            }} size='small' color='primary'>
                                                Сохранить
                                            </Button>
                                        </div>
                                    </div>
                                    </>
                                :
                                <>
                                <div className={classes.column}>
                                    <img
                                        className={isMobileApp?classes.mediaM:classes.mediaD}
                                        src={preview}
                                        alt={name}
                                    />
                                    {
                                        social[0].length>0||social[1].length>0||social[2].length>0||social[3].length>0?
                                            <>
                                        Наши страницы
                                        <div className={classes.row}>
                                            {
                                                social[0].length>0?
                                                    <a href={social[0]}>
                                                        <img src='/static/instagram.svg' className={classes.mediaSocial}/>
                                                    </a>
                                                    :
                                                    null
                                            }
                                            {
                                                social[1].length>0?
                                                    <a href={social[1]}>
                                                        <img src='/static/facebook.svg' className={classes.mediaSocial}/>
                                                    </a>
                                                    :
                                                    null
                                            }
                                            {
                                                social[2].length>0?
                                                    <a href={social[2]}>
                                                        <img src='/static/twitter.svg' className={classes.mediaSocial}/>
                                                    </a>
                                                    :
                                                    null
                                            }
                                            {
                                                social[3].length>0?
                                                    <a href={social[3]}>
                                                        <img src='/static/telegram.svg' className={classes.mediaSocial}/>
                                                    </a>
                                                    :
                                                    null

                                            }
                                        </div>
                                        </>
                                            :
                                            null
                                    }
                                </div>
                                            <div>
                                                <div className={classes.name}>
                                                    {name}
                                                </div>
                                                <br/>
                                                {
                                                    address[0]?<div className={classes.row}>
                                                        <div className={classes.nameField}>
                                                            Адрес:&nbsp;
                                                        </div>
                                                        <div className={classes.column}>
                                                            {address.map((element, idx)=>
                                                                <div key={`address${idx}`} className={classes.value}>
                                                                    {element}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>:null
                                                }
                                                <div className={classes.row}>
                                                    <div className={classes.nameField}>
                                                        Телефон:&nbsp;
                                                    </div>
                                                    <div className={classes.column}>
                                                        {phone.map((element, idx)=>{
                                                            let tel = ''
                                                            for(let i=0; i<element.length; i++){
                                                                if('0123456789+'.includes(element[i]))
                                                                    tel+=element[i]
                                                            }
                                                            if(tel.length>11)
                                                                return (
                                                                    <a href={`tel:${tel}`} key={`phone${idx}`} className={classes.value}>
                                                                        {element}
                                                                    </a>
                                                                )
                                                            else
                                                                return (
                                                                    <div key={`phone${idx}`} className={classes.value}>
                                                                        {element}
                                                                    </div>
                                                                )
                                                        })}
                                                    </div>
                                                </div>
                                                <div className={classes.row}>
                                                    <a
                                                        href='https://api.whatsapp.com/send?phone=996559995197&text='
                                                        className={classes.value}
                                                        style={{color: 'green', display: 'flex', fontSize: 20, alignItems: 'center'}}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
                                                            <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"></path>
                                                            <path fill="#fff" d="M4.868,43.803c-0.132,0-0.26-0.052-0.355-0.148c-0.125-0.127-0.174-0.312-0.127-0.483l2.639-9.636c-1.636-2.906-2.499-6.206-2.497-9.556C4.532,13.238,13.273,4.5,24.014,4.5c5.21,0.002,10.105,2.031,13.784,5.713c3.679,3.683,5.704,8.577,5.702,13.781c-0.004,10.741-8.746,19.48-19.486,19.48c-3.189-0.001-6.344-0.788-9.144-2.277l-9.875,2.589C4.953,43.798,4.911,43.803,4.868,43.803z"></path>
                                                            <path fill="#cfd8dc" d="M24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,4C24.014,4,24.014,4,24.014,4C12.998,4,4.032,12.962,4.027,23.979c-0.001,3.367,0.849,6.685,2.461,9.622l-2.585,9.439c-0.094,0.345,0.002,0.713,0.254,0.967c0.19,0.192,0.447,0.297,0.711,0.297c0.085,0,0.17-0.011,0.254-0.033l9.687-2.54c2.828,1.468,5.998,2.243,9.197,2.244c11.024,0,19.99-8.963,19.995-19.98c0.002-5.339-2.075-10.359-5.848-14.135C34.378,6.083,29.357,4.002,24.014,4L24.014,4z"></path>
                                                            <path fill="#40c351" d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199h0.006c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z"></path>
                                                            <path fill="#fff" fill-rule="evenodd" d="M19.268,16.045c-0.355-0.79-0.729-0.806-1.068-0.82c-0.277-0.012-0.593-0.011-0.909-0.011c-0.316,0-0.83,0.119-1.265,0.594c-0.435,0.475-1.661,1.622-1.661,3.956c0,2.334,1.7,4.59,1.937,4.906c0.237,0.316,3.282,5.259,8.104,7.161c4.007,1.58,4.823,1.266,5.693,1.187c0.87-0.079,2.807-1.147,3.202-2.255c0.395-1.108,0.395-2.057,0.277-2.255c-0.119-0.198-0.435-0.316-0.909-0.554s-2.807-1.385-3.242-1.543c-0.435-0.158-0.751-0.237-1.068,0.238c-0.316,0.474-1.225,1.543-1.502,1.859c-0.277,0.317-0.554,0.357-1.028,0.119c-0.474-0.238-2.002-0.738-3.815-2.354c-1.41-1.257-2.362-2.81-2.639-3.285c-0.277-0.474-0.03-0.731,0.208-0.968c0.213-0.213,0.474-0.554,0.712-0.831c0.237-0.277,0.316-0.475,0.474-0.791c0.158-0.317,0.079-0.594-0.04-0.831C20.612,19.329,19.69,16.983,19.268,16.045z" clip-rule="evenodd"></path>
                                                        </svg>
                                                        WhatsApp
                                                    </a>
                                                    &nbsp;&nbsp;&nbsp;
                                                    <a
                                                        href='tel:+996554776667'
                                                        className={classes.value}
                                                        style={{color: 'blue', display: 'flex', fontSize: 20, alignItems: 'center'}}
                                                    >
                                                        <PhoneIcon/>
                                                        Позвонить
                                                    </a>
                                                </div>
                                                {
                                                    email[0]?<div className={classes.row}>
                                                        <div className={classes.nameField}>
                                                            E-mail:&nbsp;
                                                        </div>
                                                        <div className={classes.column}>
                                                            {email.map((element, idx) =>
                                                                <a href={`mailto:${element}`} key={`email${idx}`}
                                                                   className={classes.value}>
                                                                    {element}
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>:null
                                                }
                                                <br/>
                                                <div className={classes.info}>
                                                    {info}
                                                </div>
                                            </div>
                                            </>
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

Contact.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    return {
        data: {
            ...await getContact(ctx.req?await getClientGqlSsr(ctx.req):undefined)
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

export default connect(mapStateToProps, mapDispatchToProps)(Contact);
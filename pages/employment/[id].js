import initialApp from '../../src/initialApp'
import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import {getEmployment, setEmployments, onoffEmployment, addEmployment, deleteEmployment} from '../../src/gql/employment'
import organizationStyle from '../../src/styleMUI/employment/employment'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Remove from '@material-ui/icons/Remove';
import { useRouter } from 'next/router'
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { getOrganizations } from '../../src/gql/organization'
import Router from 'next/router'
import * as userActions from '../../redux/actions/user'
import * as snackbarActions from '../../redux/actions/snackbar'
import TextField from '@material-ui/core/TextField';
import Confirmation from '../../components/dialog/Confirmation'
import { urlMain } from '../../redux/constants/other'
import { getClientGqlSsr } from '../../src/getClientGQL'
import {validPhone} from "../../src/lib";

const Client = React.memo((props) => {
    const { profile } = props.user;
    const classes = organizationStyle();
    const { data } = props;
    const { isMobileApp, city } = props.app;
    const { showSnackBar } = props.snackbarActions;
    const initialRender = useRef(true);
    let [organizations, setOrganizations] = useState(data.organizations);
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            } else {
                setOrganizations((await getOrganizations({search: '', filter: '', city: city})).organizations)
                setOrganization({})
            }
        })()
    },[city])
    let [status, setStatus] = useState(data.employment!==null?data.employment.user.status:'');
    let [name, setName] = useState(data.employment!==null&&data.employment.name?data.employment.name:'');
    let [email, setEmail] = useState(data.employment!==null&&data.employment.email?data.employment.email:'');
    let [phone, setPhone] = useState(data.employment&&data.employment.phone?data.employment.phone:[]);
    let addPhone = ()=>{
        phone = [...phone, '']
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
    let [login, setLogin] = useState(data.employment&&data.employment.user?data.employment.user.login:'');
    let [organization, setOrganization] = useState(data.employment&&data.employment.organization?data.employment.organization:{});
    let handleOrganization =  (event) => {
        setOrganization({_id: event.target.value, name: event.target.name})
    };
    let [role, setRole] = useState(data.employment&&data.employment.user?data.employment.user.role:'');
    let handleRole =  (event) => {
        setRole(event.target.value)
    };
    let [password, setPassword] = useState('');
    let handlePassword =  (event) => {
        setPassword(event.target.value)
    };
    let [hide, setHide] = useState('password');
    let handleHide =  () => {
        setHide(!hide)
    };
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    const router = useRouter()
    const { logout } = props.userActions;
    let roles = ['организация', 'менеджер', 'экспедитор', 'агент', 'ремонтник', 'мерчендайзер']
    if(profile.role==='admin')
        roles.push('суперорганизация')
    let superRoles = ['суперменеджер', 'суперагент', 'суперэкспедитор']
    useEffect(()=>{
        if(router.query.id!=='new'&&!organization.name){
            setOrganization({name: 'AZYK.STORE', _id: 'super'})
        }
    },[])
    return (
        <App cityShow={router.query.id==='new'} filters={data.filterSubCategory} sorts={data.sortSubCategory} pageName={data.employment!==null?router.query.id==='new'?'Добавить':data.employment.name:'Ничего не найдено'}>
            <Head>
                <title>{data.employment!==null?router.query.id==='new'?'Добавить':data.employment.name:'Ничего не найдено'}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                {
                            data.employment!==null?
                                ['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                                    <>
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
                                            placeholder={router.query.id==='new'?'Пароль':'Новый пароль'}
                                            type={hide ? 'password' : 'text' }
                                            value={password}
                                            onChange={handlePassword}
                                            className={classes.input}
                                            endAdornment={
                                                <InputAdornment position='end'>
                                                    <IconButton aria-label='Toggle password visibility' onClick={handleHide}>
                                                        {hide ? <VisibilityOff />:<Visibility />  }
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                        />
                                            <TextField
                                                label='Имя'
                                                value={name}
                                                className={classes.input}
                                                onChange={(event)=>{setName(event.target.value)}}
                                                inputProps={{
                                                    'aria-label': 'description',
                                                }}
                                            />
                                        {phone?phone.map((element, idx)=>
                                                <FormControl key={`phone${idx}`} className={classes.input}>
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
                                                            <InputAdornment position='end'>
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
                                        ): null}
                                        <Button onClick={async()=>{
                                            addPhone()
                                        }} size='small' color='primary'>
                                            Добавить телефон
                                        </Button>
                                        <br/>
                                        <TextField
                                            label='email'
                                            value={email}
                                            className={classes.input}
                                            onChange={(event)=>{setEmail(event.target.value)}}
                                            inputProps={{
                                                'aria-label': 'description',
                                            }}
                                        />
                                        {router.query.id==='new'&&profile.role==='admin'?
                                            <FormControl className={classes.input}>
                                                <InputLabel>Организация</InputLabel>
                                                <Select value={organization._id}onChange={handleOrganization}>
                                                    {organizations.map((element)=>
                                                        <MenuItem key={element._id} value={element._id} ola={element.name}>{element.name}</MenuItem>
                                                    )}
                                                </Select>
                                            </FormControl>
                                            :
                                            router.query.id!=='new'?
                                                <TextField
                                                    label='Организация'
                                                    value={organization.name}
                                                    className={classes.input}
                                                    inputProps={{
                                                        'aria-label': 'description',
                                                        readOnly: true,
                                                    }}
                                                />
                                                :null
                                        }
                                        <FormControl className={classes.input}>
                                            <InputLabel>Роль</InputLabel>
                                            <Select
                                                value={role}
                                                onChange={handleRole}
                                                inputProps={{
                                                    'aria-label': 'description',
                                                    readOnly: profile._id===data.employment.user._id||!['admin'].includes(profile.role),
                                                }}
                                            >
                                                {(organization._id==='super'?superRoles:roles).map((element)=>{
                                                    //if(!['admin'].includes(profile.role))
                                                        return <MenuItem key={element} value={element}>{element}</MenuItem>
                                                })
                                                }
                                            </Select>
                                        </FormControl>
                                        <div className={classes.row}>
                                            {
                                                router.query.id==='new'?
                                                    <Button onClick={async()=>{
                                                        let checkPhone = !phone.length
                                                        if(!checkPhone) {
                                                            checkPhone = true
                                                            for(let i=0; i<phone.length; i++){
                                                                checkPhone = validPhone(phone[i])
                                                            }
                                                        }
                                                        if (checkPhone&&name.length>0&&password.length>0&&role.length>0&&organization._id!==undefined) {
                                                            const action = async() => {
                                                                await addEmployment({
                                                                    name: name,
                                                                    email: email,
                                                                    phone: phone,
                                                                    login: login,
                                                                    password: password,
                                                                    role: role,
                                                                    organization: organization._id!=='super'?organization._id:null,
                                                                })
                                                                Router.push(`/employments/${organization._id}`)
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
                                                    <Button onClick={async()=>{
                                                        let checkPhone = !phone.length
                                                        if(!checkPhone) {
                                                            checkPhone = true
                                                            for(let i=0; i<phone.length; i++){
                                                                checkPhone = validPhone(phone[i])
                                                            }
                                                        }
                                                        if(checkPhone) {
                                                            let editElement = {_id: data.employment._id}
                                                            editElement.phone = phone
                                                            if (name.length > 0 && name !== data.employment.name) editElement.name = name
                                                            if (login.length > 0 && login !== data.employment.user.login) editElement.login = login
                                                            if (email.length > 0 && email !== data.employment.email) editElement.email = email
                                                            if (password.length > 0) editElement.newPass = password
                                                            if (role.length > 0 && role !== data.employment.role) editElement.role = role
                                                            const action = async () => {
                                                                await setEmployments(editElement)
                                                            }
                                                            setMiniDialog('Вы уверены?', <Confirmation
                                                                action={action}/>)
                                                            showMiniDialog(true)
                                                        }
                                                        else
                                                            showSnackBar('Заполните все поля')
                                                    }} size='small' color='primary'>
                                                        Сохранить
                                                    </Button>

                                                    {
                                                        profile._id!==data.employment.user._id&&['admin'].includes(profile.role)?
                                                            <>
                                                            <Button onClick={async()=>{
                                                                const action = async() => {
                                                                    await onoffEmployment([data.employment._id])
                                                                    setStatus(status==='active'?'deactive':'active')
                                                                }
                                                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                                showMiniDialog(true)
                                                            }} size='small' color={status==='active'?'primary':'secondary'}>
                                                                {status==='active'?'Отключить':'Включить'}
                                                            </Button>
                                                            <Button onClick={async()=>{
                                                                const action = async() => {
                                                                    await deleteEmployment([data.employment._id], data.employment.organization._id)
                                                                    Router.push(`/employments/${data.employment.organization._id}`)
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
                                                    {
                                                        profile._id===data.employment.user._id?
                                                            <Button onClick={async()=>{
                                                                const action = async() => {
                                                                    logout(true)
                                                                }
                                                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                                showMiniDialog(true)
                                                            }} size='small' color='primary'>
                                                                Выйти
                                                            </Button>
                                                            :
                                                            null
                                                    }
                                                    </>
                                            }
                                        </div>
                                    </>
                                    :
                                    'Ничего не найдено'
                                :
                                'Ничего не найдено'
                        }
                </CardContent>
                </Card>
        </App>
    )
})

Client.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['суперорганизация', 'организация', 'admin'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            ...ctx.query.id!=='new'?await getEmployment({_id: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined):{employment:{name: '',email: '',phone: [], user: {login: '',status: '',role: '',},organization: {_id: ''},}},
            organizations: [
                {name: 'AZYK.STORE', _id: 'super'},
                ...(await getOrganizations({search: '', filter: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined)).organizations
            ]

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
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Client);
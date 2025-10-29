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
import { getClientGqlSsr } from '../../src/getClientGQL'
import {validPhone} from '../../src/lib';

const Client = React.memo((props) => {
    const classes = organizationStyle();
    //props
    const {profile} = props.user;
    const {data} = props;
    const {isMobileApp, city} = props.app;
    const {showSnackBar} = props.snackbarActions;
    const {logout} = props.userActions;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    //ref
    const initialRender = useRef(true);
    //state
    let [organizations, setOrganizations] = useState(data.organizations);
    useEffect(() => {(async () => {
            if(initialRender.current)
                initialRender.current = false;
            else {
                setOrganizations(await getOrganizations({search: '', filter: '', city}))
                setOrganization(null)
            }
    })()}, [city])
    let [status, setStatus] = useState(data.employment?data.employment.user.status:'');
    let [name, setName] = useState(data.employment?data.employment.name:'');
    let [email, setEmail] = useState(data.employment?data.employment.email:'');
    let [phone, setPhone] = useState(data.employment?data.employment.phone:[]);
    let addPhone = () => {
        phone = [...phone, '']
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
    let [login, setLogin] = useState(data.employment?data.employment.user.login:'');
    let [organization, setOrganization] = useState(data.employment?data.employment.organization:null);
    let handleOrganization =  (event) => setOrganization({_id: event.target.value})
    let [role, setRole] = useState(data.employment?data.employment.user.role:'');
    let handleRole =  (event) => {
        setRole(event.target.value)
    };
    let [password, setPassword] = useState('');
    let handlePassword =  (event) => {
        setPassword(event.target.value)
    };
    let [hide, setHide] = useState(true);
    let handleHide =  () => setHide(hide => !hide);
    const router = useRouter()
    let roles = ['организация', 'менеджер', 'экспедитор', 'агент', 'ремонтник', 'мерчендайзер']
    if(profile.role==='admin')
        roles.push('суперорганизация')
    let superRoles = ['суперменеджер', 'суперагент', 'суперэкспедитор']
    useEffect(() => {
        if(router.query.id!=='new'&&organization&&!organization.name)
            setOrganization({name: 'AZYK.STORE', _id: 'super'})
    }, [])
    //render
    return (
        <App cityShow={router.query.id==='new'} pageName={router.query.id==='new'?'Добавить':data.employment!==null?data.employment.name:'Ничего не найдено'}>
            <Head>
                <title>{router.query.id==='new'?'Добавить':data.employment!==null?data.employment.name:'Ничего не найдено'}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    {
                        router.query.id==='new'||data.employment!==null?
                            ['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                                <>
                                    <TextField
                                        error={!login}
                                        autoComplete='off'
                                        label='Логин'
                                        value={login}
                                        className={classes.input}
                                        onChange={(event) => {setLogin(event.target.value)}}
                                    />
                                    <TextField
                                        autoComplete='new-password'
                                        label='Новый пароль'
                                        type={hide ? 'password' : 'text' }
                                        value={password}
                                        error={router.query.id==='new'&&!password}
                                        onChange={handlePassword}
                                        className={classes.input}
                                        InputProps={{
                                            endAdornment: <InputAdornment position='end'>
                                                <IconButton onClick={handleHide}>
                                                    {hide ? <VisibilityOff />:<Visibility />  }
                                                </IconButton>
                                            </InputAdornment>
                                        }}
                                    />
                                    <TextField
                                        error={!name}
                                        label='Имя'
                                        value={name}
                                        className={classes.input}
                                        onChange={(event) => {setName(event.target.value)}}
                                    />
                                    {phone?phone.map((element, idx) =>
                                        <FormControl key={`phone${idx}`} className={classes.input}>
                                            <InputLabel color={validPhone(element)?'primary':'secondary'}>Телефон. Формат: +996YYYXXXXXX</InputLabel>
                                            <Input
                                                placeholder='Телефон. Формат: +996YYYXXXXXX'
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
                                    ): null}
                                    <Button onClick={() => addPhone()} size='small' color='primary'>
                                        Добавить телефон
                                    </Button>
                                    <br/>
                                    <TextField
                                        autoComplete='off'
                                        label='email'
                                        value={email}
                                        className={classes.input}
                                        onChange={(event) => {setEmail(event.target.value)}}
                                    />
                                    {router.query.id==='new'&&profile.role==='admin'?
                                        <FormControl error={!organization} className={classes.input}>
                                            <InputLabel>Организация</InputLabel>
                                            <Select value={organization&&organization._id}onChange={handleOrganization}>
                                                {organizations.map((element) =>
                                                    <MenuItem key={element._id} value={element._id}>{element.name}</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                        :
                                        router.query.id!=='new'?
                                            <TextField
                                                label='Организация'
                                                value={organization.name}
                                                className={classes.input}
                                                inputProps={{readOnly: true}}
                                            />
                                            :null
                                    }
                                    <FormControl error={!role} className={classes.input}>
                                        <InputLabel>Роль</InputLabel>
                                        <Select
                                            value={role}
                                            onChange={handleRole}
                                            inputProps={{readOnly: data.employment&&profile._id===data.employment.user._id||!['admin'].includes(profile.role),}}
                                        >
                                            {(organization&&organization._id==='super'?superRoles:roles).map((element) => {
                                                return <MenuItem key={element} value={element}>{element}</MenuItem>
                                            })}
                                        </Select>
                                    </FormControl>
                                    <div className={classes.row}>
                                        {
                                            router.query.id==='new'?
                                                <Button onClick={() => {
                                                    let checkPhone = !phone.length
                                                    if(!checkPhone) {
                                                        checkPhone = true
                                                        for(let i=0; i<phone.length; i++) {
                                                            checkPhone = validPhone(phone[i])
                                                        }
                                                    }
                                                    if(checkPhone&&name&&login&&password&&role&&organization) {
                                                        const action = async () => {
                                                            const res = await addEmployment({
                                                                name,
                                                                email,
                                                                phone,
                                                                login,
                                                                password,
                                                                role,
                                                                organization: organization._id!=='super'?organization._id:null,
                                                            })
                                                            if(res)
                                                                Router.push(`/employment/${res}`)
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
                                                    <Button onClick={async () => {
                                                        let checkPhone = !phone.length
                                                        if(!checkPhone) {
                                                            checkPhone = true
                                                            for(let i=0; i<phone.length; i++) {
                                                                checkPhone = validPhone(phone[i])
                                                            }
                                                        }
                                                        if(checkPhone) {
                                                            let editElement = {_id: data.employment._id}
                                                            editElement.phone = phone
                                                            if(name&&name !== data.employment.name) editElement.name = name
                                                            if(login&&login !== data.employment.user.login) editElement.login = login
                                                            if(email&&email !== data.employment.email) editElement.email = email
                                                            if(password) editElement.newPass = password
                                                            if(role&& role !== data.employment.role) editElement.role = role
                                                            const action = async () => await setEmployments(editElement)
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
                                                                <Button onClick={async () => {
                                                                    const action = async () => {
                                                                        await onoffEmployment(data.employment._id)
                                                                        setStatus(status==='active'?'deactive':'active')
                                                                    }
                                                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                                    showMiniDialog(true)
                                                                }} size='small' color={status==='active'?'primary':'secondary'}>
                                                                    {status==='active'?'Отключить':'Включить'}
                                                                </Button>
                                                                <Button onClick={async () => {
                                                                    const action = async () => {
                                                                        await deleteEmployment(data.employment._id)
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
                                                            <Button onClick={async () => {
                                                                const action = () => logout(true)
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
    // eslint-disable-next-line no-undef
    const [employment, organizations] = await Promise.all([
        ctx.query.id!=='new'?getEmployment(ctx.query.id, getClientGqlSsr(ctx.req)):null,
        ctx.query.id==='new'?getOrganizations({search: '', filter: ''}, getClientGqlSsr(ctx.req)):null
    ])
    return {
        data: {
            employment,
            ...organizations?{organizations: [{name: 'AZYK.STORE', _id: 'super'}, ...organizations]}:{}
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
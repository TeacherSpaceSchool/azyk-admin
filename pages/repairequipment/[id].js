import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import {getRepairEquipment, setRepairEquipment, deleteRepairEquipment, addRepairEquipment} from '../../src/gql/repairEquipment'
import { getClients } from '../../src/gql/client'
import organizationStyle from '../../src/styleMUI/equipment/equipment'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import { useRouter } from 'next/router'
import Router from 'next/router'
import * as snackbarActions from '../../redux/actions/snackbar'
import TextField from '@material-ui/core/TextField';
import Confirmation from '../../components/dialog/Confirmation'
import { getClientGqlSsr } from '../../src/getClientGQL'
import Autocomplete from '@material-ui/lab/Autocomplete';
import initialApp from '../../src/initialApp'
import Remove from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CircularProgress from '@material-ui/core/CircularProgress';
import {getOrganizations} from '../../src/gql/organization';
import {getClientTitle} from '../../src/lib';

const RepairEquipment = React.memo((props) => {
    const {profile} = props.user;
    const classes = organizationStyle();
    const {data} = props;
    const {isMobileApp, city} = props.app;
    const {showSnackBar} = props.snackbarActions;
    const initialRender = useRef(true);
    const [clients, setClients] = useState([]);
    const [inputValue, setInputValue] = React.useState('');
    const searchTimeOut = useRef(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
            if(inputValue.length < 3) {
                setClients([]);
                if(open)
                    setOpen(false)
                if(loading)
                    setLoading(false)
            }
            else {
                if(!loading)
                    setLoading(true)
                if(searchTimeOut.current)
                    clearTimeout(searchTimeOut.current)
                searchTimeOut.current = setTimeout(async () => {
                    setClients(await getClients({search: inputValue, sort: '-name', filter: 'all', city}))
                    if(!open)
                        setOpen(true)
                    setLoading(false)
                }, 500)
            }
    }, [inputValue]);
    const handleChange = event => {
        setInputValue(event.target.value);
    };
    let handleClient =  (client) => {
        setClient(client)
        setOpen(false)
    };
    let [accept, setAccept] = useState(data.repairEquipment?data.repairEquipment.accept:false);
    let [done, setDone] = useState(data.repairEquipment?data.repairEquipment.done:false);
    let [cancel, setCancel] = useState(data.repairEquipment?data.repairEquipment.cancel:false);
    let [organizations, setOrganizations] = useState(data.organizations);
    let [defect, setDefect] = useState(data.repairEquipment?data.repairEquipment.defect:[]);
    let [repair, setRepair] = useState(data.repairEquipment?data.repairEquipment.repair:[]);
    let [organization, setOrganization] = useState(data.repairEquipment?data.repairEquipment.organization:profile.organization?{_id: profile.organization}:null);
    let [client, setClient] = useState(data.repairEquipment?data.repairEquipment.client:null);
    let [equipment, setEquipment] = useState(data.repairEquipment?data.repairEquipment.equipment:null);
    let handleOrganization = async (organization) => {
        setOrganization(organization)
    };
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const router = useRouter()
    useEffect(() => {
        (async () => {
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                setOrganization(null)
                setOrganizations(await getOrganizations({search: '', filter: '', city}))
            }
        })()
    }, [city])
    return (
        <App cityShow={router.query.id==='new'} pageName={router.query.id==='new'?'Добавить':data.repairEquipment?data.repairEquipment.number:'Ничего не найдено'}>
            <Head>
                <title>{router.query.id==='new'?'Добавить':data.repairEquipment?data.repairEquipment.number:'Ничего не найдено'}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                {
                    router.query.id==='new'||data.repairEquipment?
                        <>
                        {
                            !profile.organization&& router.query.id==='new'?
                                <Autocomplete
                                    className={classes.input}
                                    options={organizations}
                                    getOptionLabel={option => option.name}
                                    value={organization}
                                    onChange={(event, newValue) => handleOrganization(newValue)}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => <TextField error={!organization} {...params} label='Выберите организацию' fullWidth />}
                                />
                                :
                                !profile.organization&&organization?
                                    <TextField
                                        label='Организация'
                                        value={organization.name}
                                        className={classes.input}
                                        inputProps={{readOnly: true}}
                                    />
                                    :
                                    null
                        }
                        {
                            router.query.id==='new'||profile.role!=='ремонтник'&&!data.repairEquipment.accept&&!data.repairEquipment.cancel?
                                <Autocomplete
                                    onClose={() =>setOpen(false)}
                                    open={open}
                                    disableOpenOnFocus
                                    className={classes.input}
                                    options={clients}
                                    getOptionLabel={option => getClientTitle(option)}
                                    onChange={(event, newValue) => handleClient(newValue)}
                                    value={client}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField error={!client} {...params} label='Выберите клиента' fullWidth
                                                   onChange={handleChange}
                                                   InputProps={{
                                                       ...params.InputProps,
                                                       endAdornment: (
                                                           <React.Fragment>
                                                               {loading ? <CircularProgress color='inherit' size={20} /> : null}
                                                               {params.InputProps.endAdornment}
                                                           </React.Fragment>
                                                       ),
                                                   }}
                                        />
                                    )}
                                />
                                :
                                <TextField
                                    label='Клиент'
                                    value={getClientTitle(client)}
                                    className={classes.input}
                                    inputProps={{readOnly: true}}
                                />
                        }
                        <TextField
                            error={!equipment}
                            label='Оборудование'
                            value={equipment}
                            className={classes.input}
                            inputProps={{readOnly: data.repairEquipment&&(accept||cancel)}}
                            onChange={(event) => setEquipment(event.target.value)}
                        />
                        {
                            data.repairEquipment&&data.repairEquipment.agent?
                                <TextField
                                    label='Агент'
                                    value={data.repairEquipment.agent.name}
                                    className={classes.input}
                                    inputProps={{readOnly: true}}
                                />
                                :
                                null
                        }
                        {
                            data.repairEquipment&&data.repairEquipment.repairman?
                                <TextField
                                    label='Ремонтник'
                                    value={data.repairEquipment.repairman.name}
                                    className={classes.input}
                                    inputProps={{readOnly: true}}
                                />
                                :
                                null
                        }
                        <ExpansionPanel className={classes.input}>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                <h3 style={{color: defect[0]?'black':'red'}}>
                                    Неисправностей {defect.length}
                                </h3>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails className={classes.column}>
                                {defect?defect.map((element, idx) =>
                                    <div className={classes.input} key={`defect${idx}`}>
                                        <FormControl className={classes.input}>
                                            <InputLabel>{`Неисправность ${idx+1}`}</InputLabel>
                                            <Input
                                                placeholder={`Неисправность ${idx+1}`}
                                                value={element}
                                                className={classes.input}
                                                onChange={(event) => {
                                                    defect[idx] = event.target.value
                                                    setDefect([...defect])
                                                }}
                                                inputProps={{readOnly: router.query.id!=='new'&&(profile.role==='ремонтник'||data.repairEquipment.accept||data.repairEquipment.cancel)}}
                                                endAdornment={
                                                    router.query.id==='new'||profile.role!=='ремонтник'&&!data.repairEquipment.accept&&!data.repairEquipment.cancel?
                                                        <InputAdornment position='end'>
                                                            <IconButton
                                                                onClick={() => {
                                                                    defect.splice(idx, 1);
                                                                    setDefect([...defect])
                                                                }}
                                                            >
                                                                <Remove/>
                                                            </IconButton>
                                                        </InputAdornment>
                                                        :
                                                        null
                                                }
                                            />
                                        </FormControl>
                                    </div>
                                ): null}
                                {
                                    router.query.id==='new'||profile.role!=='ремонтник'&&!data.repairEquipment.accept&&!data.repairEquipment.cancel?
                                        <Button onClick={async () => {
                                            defect = [...defect, '']
                                            setDefect(defect)
                                        }} size='small' color='primary'>
                                            Добавить неисправность
                                        </Button>
                                        :
                                        null
                                }
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                        {
                            data.repairEquipment&&data.repairEquipment.accept?
                                <ExpansionPanel className={classes.input}>
                                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                        <h3>
                                            Ремонт {repair.length}
                                        </h3>
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails className={classes.column}>
                                        {repair?repair.map((element, idx) =>
                                            <div className={classes.input} key={`repair${idx}`}>
                                                <FormControl className={classes.input}>
                                                    <InputLabel>{`Ремонт ${idx+1}`}</InputLabel>
                                                    <Input
                                                        placeholder={`Ремонт ${idx+1}`}
                                                        value={element}
                                                        className={classes.input}
                                                        onChange={(event) => {
                                                            repair[idx] = event.target.value
                                                            setRepair([...repair])
                                                        }}
                                                        inputProps={{readOnly: !['admin', 'ремонтник'].includes(profile.role)||data.repairEquipment.done}}
                                                        endAdornment={
                                                            ['admin', 'ремонтник'].includes(profile.role)&&!data.repairEquipment.done?
                                                                <InputAdornment position='end'>
                                                                    <IconButton
                                                                        onClick={() => {
                                                                            repair.splice(idx, 1);
                                                                            setRepair([...repair])
                                                                        }}
                                                                    >
                                                                        <Remove/>
                                                                    </IconButton>
                                                                </InputAdornment>
                                                                :
                                                                null
                                                        }
                                                    />
                                                </FormControl>
                                            </div>
                                        ): null}
                                        {
                                            ['admin', 'ремонтник'].includes(profile.role)&&!data.repairEquipment.done ?
                                                <Button onClick={async () => {
                                                    repair = [...repair, '']
                                                    setRepair(repair)
                                                }} size='small' color='primary'>
                                                    Добавить ремонт
                                                </Button>
                                                :
                                                null
                                        }
                                    </ExpansionPanelDetails>
                                </ExpansionPanel>
                                :
                                null
                        }
                        {
                            router.query.id!=='new'?
                                <>
                                <FormControlLabel
                                    disabled={!(['admin', 'ремонтник'].includes(profile.role)&&!cancel&&!done)}
                                    control={
                                        <Checkbox
                                            checked={accept}
                                            onChange={() => {
                                                setAccept(!accept)
                                            }}
                                            color='primary'
                                        />
                                    }
                                    label={'Заявка принята'}
                                />
                                <FormControlLabel
                                    disabled={!(['admin', 'ремонтник'].includes(profile.role)&&!cancel&&data.repairEquipment.accept&&!data.repairEquipment.done)}
                                    control={
                                        <Checkbox
                                            checked={done}
                                            onChange={() => {
                                                setDone(!done)
                                            }}
                                            color='primary'
                                        />
                                    }
                                    label={'Заявка выполнена'}
                                />
                                <FormControlLabel
                                    disabled={!(['агент', 'admin', 'суперагент', 'суперорганизация', 'организация'].includes(profile.role)&&!accept)}
                                    control={
                                        <Checkbox
                                            checked={cancel}
                                            onChange={() => {
                                                setCancel(!cancel)
                                            }}
                                            color='secondary'
                                        />
                                    }
                                    label={'Заявка отменена'}
                                />
                                </>
                                :
                                null
                        }
                        <div className={classes.row}>
                            {
                                router.query.id==='new'?
                                    <Button onClick={async () => {
                                        if(defect.length&&equipment&&client&&organization) {
                                            const action = async () => {
                                                const res = await addRepairEquipment({organization: organization._id, equipment, client: client._id, defect})
                                                if(res)
                                                    Router.push(`/repairequipment/${res}`)
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
                                        let editElement = {_id: data.repairEquipment._id}
                                        if(accept!==data.repairEquipment.accept)editElement.accept = accept
                                        if(done!==data.repairEquipment.done)editElement.done = done
                                        if(cancel!==data.repairEquipment.cancel)editElement.cancel = cancel
                                        if(profile.role!=='ремонтник'&&!data.repairEquipment.accept&&!data.repairEquipment.cancel)editElement.defect = defect
                                        if(profile.role!=='ремонтник'&&!data.repairEquipment.accept&&!data.repairEquipment.cancel)editElement.equipment = equipment
                                        if(profile.role!=='ремонтник'&&!data.repairEquipment.accept&&!data.repairEquipment.cancel&&client)editElement.client = client._id
                                        if(['admin', 'ремонтник'].includes(profile.role)&&!data.repairEquipment.done&&data.repairEquipment.accept)editElement.repair = repair
                                        const action = async () => {
                                            await setRepairEquipment(editElement)
                                            router.reload()
                                        }
                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                        showMiniDialog(true)
                                    }} size='small' color='primary'>
                                        Сохранить
                                    </Button>
                                    {
                                        data.repairEquipment.cancel?
                                            <Button onClick={
                                                async () => {
                                                    const action = async () => {
                                                        await deleteRepairEquipment(data.repairEquipment._id)
                                                        Router.push(`/repairequipments/${organization._id}`)
                                                    }
                                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                    showMiniDialog(true)
                                                }
                                            } size='small' color='secondary'>
                                                Удалить
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
                }
                </CardContent>
            </Card>
        </App>
    )
})

RepairEquipment.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!(['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'ремонтник'].includes(ctx.store.getState().user.profile.role)))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    // eslint-disable-next-line no-undef
    const [repairEquipment, organizations] = await Promise.all([
        ctx.query.id!=='new'?getRepairEquipment(ctx.query.id, getClientGqlSsr(ctx.req)):null,
        ctx.query.id==='new'?getOrganizations({search: '', filter: ''}, getClientGqlSsr(ctx.req)):null
    ])
    return {
        data: {
            repairEquipment,
            ...organizations?{organizations}:{}
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

export default connect(mapStateToProps, mapDispatchToProps)(RepairEquipment);
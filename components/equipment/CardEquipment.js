import React, {useEffect, useState} from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import cardAutoStyle from '../../src/styleMUI/auto/cardAuto'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import Confirmation from '../../components/dialog/Confirmation'
import {setEquipment, deleteEquipment, addEquipment} from '../../src/gql/equipment'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import * as snackbarActions from '../../redux/actions/snackbar'
import {useRouter} from 'next/router';
import CircularProgress from '@material-ui/core/CircularProgress';
import {getClients} from '../../src/gql/client';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const models = ['USS175', 'USS374', 'USS440', 'Super FD']

const CardEquipment = React.memo((props) => {
    const classes = cardAutoStyle();
    const router = useRouter()
    const { element, setList, list, idx, agents, city } = props;
    const { showSnackBar } = props.snackbarActions;
    const { isMobileApp } = props.app;
    const { profile } = props.user;
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    let [number, setNumber] = useState(element&&element.number?element.number:'');
    let [model, setModel] = useState(element&&element.model?element.model:'');
    let handleModel =  (event) => {
        setModel(event.target.value)
    };
    let [agent, setAgent] = useState(element&&element.agent?element.agent:undefined);
    let [client, setClient] = useState(element&&element.client?element.client:undefined);
    let [clients, setClients] = useState([]);
    const [inputValue, setInputValue] = React.useState('');
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        (async()=>{
            if (inputValue.length < 3) {
                setClients([]);
                if (open)
                    setOpen(false)
                if (loading)
                    setLoading(false)
            }
            else {
                if (!loading)
                    setLoading(true)
                if (searchTimeOut)
                    clearTimeout(searchTimeOut)
                searchTimeOut = setTimeout(async () => {
                    setClients((await getClients({search: inputValue, sort: '-name', filter: 'all', city})).clients)
                    if (!open)
                        setOpen(true)
                    setLoading(false)
                }, 500)
                setSearchTimeOut(searchTimeOut)
            }
        })()
    }, [inputValue]);
    const handleChange = event => {
        setInputValue(event.target.value);
    };
    let handleClient =  (client) => {
        setClient(client)
        setOpen(false)
    };
    return (
           <Card className={isMobileApp?classes.cardM:classes.cardD}>
                <CardActionArea>
                    <CardContent>
                        <TextField
                            error={!number}
                            label='Номер'
                            value={number}
                            className={classes.input}
                            onChange={(event)=>{setNumber(event.target.value)}}
                            inputProps={{
                                'aria-label': 'description',
                            }}
                        />
                        <br/>
                        <FormControl className={classes.input} error={!model}>
                            <InputLabel>Модель</InputLabel>
                            <Select value={model} onChange={handleModel}>
                                {models.map((element)=>
                                    <MenuItem key={element} value={element}>{element}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                        <br/>
                        {
                            process.browser?
                                <>
                                    <Autocomplete
                                        onClose={()=>setOpen(false)}
                                        open={open}
                                        disableOpenOnFocus
                                        className={classes.input}
                                        options={clients}
                                        getOptionLabel={option => `${option.name}${option.address&&option.address[0]?` (${option.address[0][2]?`${option.address[0][2]}, `:''}${option.address[0][0]})`:''}`}
                                        onChange={(event, newValue) => {
                                            handleClient(newValue)
                                        }}
                                        value={client}
                                        noOptionsText='Ничего не найдено'
                                        renderInput={params => (
                                            <TextField error={['менеджер', 'агент'].includes(profile.role)&&!client} {...params} label='Выберите клиента' variant='standard' fullWidth
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
                                    {
                                        profile.role!=='агент'?
                                            <Autocomplete
                                                className={classes.input}
                                                options={agents}
                                                value={agent}
                                                getOptionLabel={option => option.name}
                                                onChange={(event, newValue) => {
                                                    setAgent(newValue)
                                                }}
                                                noOptionsText='Ничего не найдено'
                                                renderInput={params => (
                                                    <TextField {...params} label='Выберите агента' variant='standard' fullWidth />
                                                )}
                                            />
                                            :
                                            null
                                    }
                                </>
                                :
                                null
                        }
                    </CardContent>
                </CardActionArea>
               <CardActions>
                    {
                        !element ?
                            <Button onClick={async()=>{
                                if (number&&model&&(!['менеджер', 'агент'].includes(profile.role)||client)) {
                                    const action = async() => {
                                        let equipment = {
                                            number,
                                            model,
                                            organization: router.query.id
                                        }
                                        if(agent)
                                            equipment.agent = agent._id;
                                        if(client)
                                            equipment.client = client._id;
                                        const res = await addEquipment(equipment)
                                        setList([res.addEquipment, ...list])
                                        setModel('')
                                        setAgent(null)
                                        setClient(null)
                                        setNumber('')
                                    }
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                } else {
                                    showSnackBar('Заполните все поля')
                                }
                            }} model='small' color='primary'>
                                Добавить
                            </Button>
                            :
                            <>
                            <Button onClick={async()=>{
                                let editElement = {_id: element._id}
                                if(model!==element.model)editElement.model = model
                                if(number!==element.number)editElement.number = number
                                if(!element.agent||agent&&agent._id!==element.agent._id)editElement.agent = agent?._id
                                if(!element.client||client&&client._id!==element.client._id)editElement.client = client?._id
                                const action = async() => {
                                    await setEquipment(editElement)
                                }
                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                showMiniDialog(true)
                            }} model='small' color='primary'>
                                Сохранить
                            </Button>
                            <Button onClick={
                                async()=>{
                                    const action = async() => {
                                        await deleteEquipment([element._id])
                                        list.splice(idx, 1)
                                        setList([...list])

                                    }
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                }
                            } model='small' color='secondary'>
                                Удалить
                            </Button>
                            </>
                    }
               </CardActions>
            </Card>
    );
})

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardEquipment)
import React, {useEffect, useRef, useState} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cardStyle from '../../src/styleMUI/subbrand/cardSubbrand'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import {
    addIntegrate1C,
    setIntegrate1C,
    deleteIntegrate1C,
    getClientsIntegrate1C,
    getEcspeditorsIntegrate1C, getItemsIntegrate1C, getAgentsIntegrate1C
} from '../../src/gql/integrate1C'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Confirmation from '../dialog/Confirmation';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {isNotEmpty} from '../../src/lib';
import CircularProgress from '@material-ui/core/CircularProgress';
import {useRouter} from 'next/router';
import {checkInt} from '../../redux/constants/other';

const CardIntegrate = React.memo((props) => {
    const classes = cardStyle();
    const {element, setList, organization, idx, setSimpleStatistic} = props;
    const {isMobileApp, filter} = props.app;
    const router = useRouter()
    //guid
    let [guid, setGuid] = useState(element?element.guid:'');
    let handleGuid =  (event) => {
        setGuid(event.target.value)
    };
    //type
    const types = ['агент', 'товар', 'клиент', 'экспедитор'];
    let [type, setType] = useState(element? element.agent? 'агент' : element.item? 'товар' : element.client? 'клиент' : element.ecspeditor? 'экспедитор' : '' : '');
    let handleType =  (event) => {
        setType(event.target.value)
        setOption(null)
        setOptions([])
        setInputValue('')
        getOptions('', event.target.value)
    };
    useEffect(() => {
        if(!element) handleType({target: {value: filter}})
    }, [filter])
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    /*Autocomplete*/
    const [options, setOptions] = useState([]);
    const [option, setOption] = useState(null);
    let handleOption =  (option) => {
        setOpen(false)
        setOption(option)
    };
    const [inputValue, setInputValue] = useState('');
    const searchTimeOut = useRef(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true)
    const getOptions = async(inputValue, argType) => {
        if(argType) type = argType
        if(type) {
            if(type === 'клиент' && inputValue.length < 3) {
                setOptions([]);
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
                    const getOptions = type === 'агент' ? async () => await getAgentsIntegrate1C({
                        search: inputValue,
                        organization: router.query.id
                    }) : (type === 'товар' ? async () => await getItemsIntegrate1C({
                        search: inputValue,
                        organization: router.query.id
                    }) : (type === 'клиент' ? async () => await getClientsIntegrate1C({
                        search: inputValue,
                        organization: router.query.id
                    }) : async () => await getEcspeditorsIntegrate1C({
                        search: inputValue,
                        organization: router.query.id
                    })))
                    const options = await getOptions()
                    setOptions(options)
                    if(!open)
                        setOpen(true)
                    setLoading(false)
                }, 500)
            }
        }
    }
    const cancelGetOptions = () => {
        if(searchTimeOut.current)
            clearTimeout(searchTimeOut.current)
        setLoading(false)
        setOpen(false)
    }
    const handleChange = event => {
        setInputValue(event.target.value);
    };
    const getFocus = useRef(false);
    /*Autocomplete*/
    return (
        <div>
            <Card className={isMobileApp?classes.cardM:classes.cardD}>
                <CardContent>
                    <TextField
                        label='GUID'
                        value={guid}
                        className={classes.input}
                        onChange={handleGuid}
                    />
                    {element||filter?
                        <TextField
                            label='Тип'
                            value={type}
                            className={classes.input}
                            inputProps={{readOnly: true}}
                        />
                        :
                        <FormControl className={classes.input}>
                            <InputLabel>Тип</InputLabel>
                            <Select
                                value={type}
                                onChange={handleType}
                            >
                                {types?types.map((element) =>
                                    <MenuItem key={element} value={element}>{element}</MenuItem>
                                ):null}
                            </Select>
                        </FormControl>
                    }
                    {
                        element?
                            <TextField
                                label={type}
                                value={
                                    element.item&&element.item.name||element.agent&&element.agent.name||element.client&&element.client.name||
                                    element.ecspeditor&&element.ecspeditor.name
                                }
                                className={classes.input}
                                inputProps={{readOnly: true}}
                            />
                            :
                            type?<Autocomplete
                                    style={{marginBottom: 10}}
                                    open={open}
                                    className={classes.input}
                                    options={options}
                                    getOptionLabel={option => option.name}
                                    onInputChange={(event, newInputValue) => {
                                        setInputValue(newInputValue);
                                        getOptions(newInputValue)
                                    }}
                                    onChange={(event, newValue) => {
                                        cancelGetOptions()
                                        handleOption(newValue)
                                    }}
                                    inputValue={inputValue}
                                    noOptionsText={type==='клиент'&&inputValue.length<3?'Поиск...':'Ничего не найдено'}
                                    renderInput={params => (
                                        <TextField {...params} label='Выбрать' fullWidth
                                                   onClick={() => {
                                                       if(!getFocus.current)
                                                           setOpen(open => !open)
                                                       else
                                                           getFocus.current = false
                                                   }}
                                                   onFocus={() => {
                                                       getFocus.current = true
                                                       setOpen(true)
                                                   }}
                                                   onBlur={() => setOpen(false)}
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
                                :null
                    }
                </CardContent>
                <CardActions>
                    {
                        element?
                            <>
                                {
                                    guid!==element.guid? <Button onClick={async () => {
                                        let editElement = {_id: element._id, guid}
                                        const action = async () => {
                                            await setIntegrate1C(editElement)
                                            setList(list => {
                                                list[idx].guid = guid
                                                return [...list]
                                            })
                                        }
                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                        showMiniDialog(true)
                                    }} size='small' color='primary'>
                                        Сохранить
                                    </Button> : null
                                }
                                <Button size='small' color='secondary' onClick={() => {
                                    const action = async () => {
                                        await deleteIntegrate1C(element._id)
                                        setList(list => {
                                            list.splice(idx, 1)
                                            return [...list]
                                        })
                                        setSimpleStatistic(simpleStatistic => {
                                            const idx = type==='агент'?1:type==='товар'?3:type==='клиент'?4:2
                                            if(isNotEmpty(simpleStatistic[idx]))
                                                simpleStatistic[idx] = checkInt(simpleStatistic[idx]) + 1
                                            return [...simpleStatistic]
                                        })
                                    }
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                }}>
                                    Удалить
                                </Button>
                            </>
                            :
                            option&&guid?<Button onClick={async () => {
                                const action = async () => {
                                    let element = {
                                        guid, organization, [type==='агент'?'agent':type==='товар'?'item':type==='клиент'?'client':'ecspeditor']: option._id
                                    }
                                    let res = await addIntegrate1C(element)
                                    if(res) {
                                        setList(list => [res, ...list])
                                        setSimpleStatistic(simpleStatistic => {
                                            const idx = type==='агент'?1:type==='товар'?3:type==='клиент'?4:2
                                            if(isNotEmpty(simpleStatistic[idx]))
                                                simpleStatistic[idx] = checkInt(simpleStatistic[idx]) - 1
                                            return [...simpleStatistic]
                                        })
                                    }
                                }
                                setGuid('')
                                setType('')
                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                showMiniDialog(true)
                            }} size='small' color='primary'>
                                Добавить
                            </Button>:null}
                </CardActions>
            </Card>
        </div>
    );
})

function mapStateToProps (state) {
    return {
        app: state.app
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardIntegrate)
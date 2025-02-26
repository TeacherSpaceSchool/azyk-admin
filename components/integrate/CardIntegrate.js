import React, {useState} from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import cardCategoryStyle from '../../src/styleMUI/subcategory/cardSubcategory'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import { addIntegrate1C, setIntegrate1C, deleteIntegrate1C} from '../../src/gql/integrate1C'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Confirmation from '../dialog/Confirmation';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {cities} from "../../src/lib";

const CardIntegrate = React.memo((props) => {
    const classes = cardCategoryStyle();
    const { element, setList, organization, items, clients, agents, ecspeditors, list, idx } = props;
    const { isMobileApp } = props.app;
    //addCard
    let [itemsByCity, setItemsByCity] = useState([]);
    let [guid, setGuid] = useState(element?element.guid:'');
    let handleGuid =  (event) => {
        setGuid(event.target.value)
    };
    let [city, setCity] = useState(element&&element.item?element.item.city:'Бишкек');
    let handleCity =  (event) => {
        setItem({})
        setCity(event.target.value)
        setItemsByCity(items.filter(element=>element.city===event.target.value))
    };
    let [item, setItem] = useState(element?element.item:{});
    let handleItem =  (item) => {
        setItem(item)
    };
    let [client, setClient] = useState(element?element.client:{});
    let handleClient =  (client) => {
        setClient(client)
    };
    let [agent, setAgent] = useState(element?element.agent:{});
    let handleAgent =  (agent) => {
        setAgent(agent)
    };
    let [ecspeditor, setEcspeditor] = useState(element?element.ecspeditor:{});
    let handleEcspeditor =  (ecspeditor) => {
        setEcspeditor(ecspeditor)
    };
    const types = ['агент', 'товар', 'клиент', 'экспедитор'];
    let [type, setType] = useState(element?
        element.agent&&element.agent._id?
            'агент'
            :
            element.item&&element.item._id?
                'товар'
                :
                element.client&&element.client._id?
                    'клиент'
                    :
                    element.ecspeditor&&element.ecspeditor._id?
                        'экспедитор'
                        :
                        ''
        :
        ''
    );
    let handleType =  (event) => {
        setType(event.target.value)
        setClient({})
        setAgent({})
        setEcspeditor({})
        setItem({})
        if(event.target.value!=='товар')
            setItemsByCity([])
        else
            handleCity({target: {value: 'Бишкек'}})
    };
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    return (
        <div>
            <Card className={isMobileApp?classes.cardM:classes.cardD}>
                <CardActionArea>
                    <CardContent>
                        <TextField
                            label='GUID'
                            value={guid}
                            className={classes.input}
                            onChange={handleGuid}
                            inputProps={{
                                'aria-label': 'description',
                            }}
                        />
                        <br/>
                        <br/>
                        <FormControl className={classes.input}>
                            <InputLabel>Тип</InputLabel>
                            <Select
                                value={type}
                                onChange={handleType}
                            >
                                {types?types.map((element)=>
                                        <MenuItem key={element} value={element}>{element}</MenuItem>
                                ):null}
                            </Select>
                        </FormControl>
                        <br/>
                        <br/>
                        {
                            type==='агент'?
                                <Autocomplete
                                    className={classes.input}
                                    options={agents}
                                    getOptionLabel={option => option.name}
                                    value={agent}
                                    onChange={(event, newValue) => {
                                        handleAgent(newValue)
                                    }}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField {...params} label='Выберите агента' fullWidth />
                                    )}
                                />
                                :
                                type==='товар'?
                                    <>
                                    <FormControl className={classes.input}>
                                        <InputLabel>Город</InputLabel>
                                        <Select value={city} onChange={handleCity}>
                                            {cities.map((element)=>
                                                <MenuItem key={element} value={element} ola={element}>{element}</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                    <br/>
                                    <br/>
                                    <Autocomplete
                                        className={classes.input}
                                        options={itemsByCity}
                                        getOptionLabel={option => option.name}
                                        value={item}
                                        onChange={(event, newValue) => {
                                            handleItem(newValue)
                                        }}
                                        noOptionsText='Ничего не найдено'
                                        renderInput={params => (
                                            <TextField {...params} label='Выберите товар' fullWidth />
                                        )}
                                    />
                                    </>
                                    :
                                    type==='клиент'?
                                        <Autocomplete
                                            className={classes.input}
                                            options={clients}
                                            getOptionLabel={option => option.name}
                                            value={client}
                                            onChange={(event, newValue) => {
                                                handleClient(newValue)
                                            }}
                                            noOptionsText='Ничего не найдено'
                                            renderInput={params => (
                                                <TextField {...params} label='Выберите клиента' fullWidth />
                                            )}
                                        />
                                        :
                                        type==='экспедитор'?
                                            <Autocomplete
                                                className={classes.input}
                                                options={ecspeditors}
                                                getOptionLabel={option => option.name}
                                                value={ecspeditor}
                                                onChange={(event, newValue) => {
                                                    handleEcspeditor(newValue)
                                                }}
                                                noOptionsText='Ничего не найдено'
                                                renderInput={params => (
                                                    <TextField {...params} label='Выберите экспедитора' fullWidth />
                                                )}
                                            />
                                            :
                                            null
                        }
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    {
                        element!==undefined?
                            <>
                            <Button onClick={async()=>{
                                let editElement = {_id: element._id, organization: organization}
                                if(guid!==element.guid)editElement.guid = guid
                                if(ecspeditor)editElement.ecspeditor = ecspeditor._id
                                if(client)editElement.client = client._id
                                if(agent)editElement.agent = agent._id
                                if(item)editElement.item = item._id
                                const action = async() => {
                                    await setIntegrate1C(editElement)
                                }
                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                showMiniDialog(true)
                            }} size='small' color='primary'>
                                Сохранить
                            </Button>
                            <Button size='small' color='secondary' onClick={()=>{
                                const action = async() => {
                                    await deleteIntegrate1C([element._id])
                                    let _list = [...list]
                                    _list.splice(idx, 1)
                                    setList(_list)
                                }
                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                showMiniDialog(true)
                            }}>
                                Удалить
                            </Button>
                            </>
                            :
                            <Button onClick={async()=> {
                                const action = async() => {
                                    let element = {guid: guid, organization: organization, ecspeditor: ecspeditor._id, client: client._id, agent: agent._id, item: item._id}
                                    let res = await addIntegrate1C(element)
                                    if(res)
                                        setList([res, ...list])
                                }
                                setGuid('')
                                setType('')
                                setEcspeditor({})
                                setAgent({})
                                setItem({})
                                setClient({})
                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                showMiniDialog(true)
                            }} size='small' color='primary'>
                                Добавить
                            </Button>}
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
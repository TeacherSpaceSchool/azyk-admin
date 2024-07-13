import React, {useEffect, useState} from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import cardCategoryStyle from '../../src/styleMUI/subcategory/cardSubcategory'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import TextField from '@material-ui/core/TextField';
import Confirmation from '../dialog/Confirmation';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import {getClientsForPlanClients, setPlanClient, deletePlanClient} from '../../src/gql/planClient';
import {inputInt} from '../../src/lib';
import * as snackbarActions from '../../redux/actions/snackbar';
import {checkInt} from '../../redux/constants/other';

const CardPlanClient = React.memo((props) => {
    const classes = cardCategoryStyle();
    const { element, setList, organization, list, idx, count, setCount, district } = props;
    const { isMobileApp, city } = props.app;
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    const { showSnackBar } = props.snackbarActions;
    //client
    const [clients, setClients] = useState([]);
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
                    setClients((await getClientsForPlanClients({city: city, search: inputValue, organization, district})).clientsForPlanClients)
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
    let [client, setClient] = useState(element?.client);
    let handleClient = async (client) => {
        setList([...list]);
        setClient(client)
        setOpen(false)
    };
    //month
    let [month, setMonth] = useState(element?.month);
    //visit
    let [visit, setVisit] = useState(element?.visit);
    //actions




    return (
        <div>
            <Card className={isMobileApp?classes.cardM:classes.cardD}>
                <CardActionArea>
                    <CardContent>
                        {
                            element?
                                <div>
                                    <div style={{marginBottom: 5, lineHeight: 1.5, fontSize: 14, fontWeight: 'bold'}}>
                                        {element.client.name}{element.client.address&&element.client.address[0]?` (${element.client.address[0][2]?`${element.client.address[0][2]}, `:''}${element.client.address[0][0]})`:''}
                                    </div>
                                    <div className={classes.row}>
                                        <div className={classes.nameField}>Прогресс:&nbsp;</div>
                                        <div className={classes.value}>{element.current} сом</div>
                                    </div>
                                </div>
                                :
                                process.browser?<Autocomplete
                                    style={{marginBottom: 10}}
                                    onClose={()=>setOpen(false)}
                                    open={open}
                                    disableOpenOnFocus
                                    className={classes.input}
                                    options={clients}
                                    getOptionLabel={option => `${option.name}${option.address&&option.address[0]?` (${option.address[0][2]?`${option.address[0][2]}, `:''}${option.address[0][0]})`:''}`}
                                    onChange={(event, newValue) => {
                                        handleClient(newValue)
                                    }}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField {...params} label='Выберите клиента' fullWidth
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
                                />:<div style={{marginBottom: 10}}/>
                        }
                        <div className={classes.row}>
                            <TextField
                                type={ isMobileApp?'number':'text'}
                                label='Посещение план'
                                value={visit}
                                style={{width: 'calc(50% - 5px)'}}
                                onChange={(event)=>{setVisit(inputInt(event.target.value))}}
                                inputProps={{
                                    'aria-label': 'description',
                                }}
                            />
                            <div style={{width: 10}}/>
                            <TextField
                                type={ isMobileApp?'number':'text'}
                                label='Месячный план'
                                value={month}
                                style={{width: 'calc(50% - 5px)'}}
                                onChange={(event)=>{setMonth(inputInt(event.target.value))}}
                                inputProps={{
                                    'aria-label': 'description',
                                }}
                            />
                        </div>
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <Button onClick={async()=>{
                        if(client) {
                            let editElement = {
                                organization: organization,
                                client: client._id,
                                month: checkInt(month),
                                visit: checkInt(visit)
                            }

                            const action = async () => {
                                let res = await setPlanClient(editElement)
                                if(res.setPlanClient.data==='OK') {
                                    if(!element) {
                                        editElement.client = client
                                        setList([editElement, ...list])
                                    }
                                }
                            }
                            if(!element) {
                                setVisit('')
                                setMonth('')
                                handleClient(null)
                            }
                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                            showMiniDialog(true)
                        }
                        else
                            showSnackBar('Заполните все поля');
                    }} size='small' color='primary'>
                        {element?'Сохранить':'Добавить'}
                    </Button>
                    {
                        element?
                            <Button size='small' color='secondary' onClick={()=>{
                                const action = async() => {
                                    await deletePlanClient({_id: element._id})
                                    let _list = [...list]
                                    _list.splice(idx, 1)
                                    setList(_list)
                                    setCount(count-1)
                                }
                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                showMiniDialog(true)
                            }}>
                                Удалить
                            </Button>
                            :
                            null
                    }
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
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardPlanClient)
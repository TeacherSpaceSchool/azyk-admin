import React, {useEffect, useRef, useState} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cardStyle from '../../src/styleMUI/subbrand/cardSubbrand'
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
import {getClientTitle, inputInt} from '../../src/lib';
import * as snackbarActions from '../../redux/actions/snackbar';
import {checkInt} from '../../redux/constants/other';

const CardPlanClient = React.memo((props) => {
    const classes = cardStyle();
    const {element, setList, organization, idx, setCount, district} = props;
    const {isMobileApp} = props.app;
    const {profile} = props.user;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {showSnackBar} = props.snackbarActions;
    //client
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
                    setClients(await getClientsForPlanClients({city: organization.cities[0], search: inputValue, organization: organization._id, district}))
                    if(!open)
                        setOpen(true)
                    setLoading(false)
                }, 500)
            }
    }, [inputValue]);
    const handleChange = event => setInputValue(event.target.value);
    let [client, setClient] = useState(element?element.client:null);
    let handleClient = (client) => {
        setClient(client)
        setOpen(false)
    };
    //month
    let [month, setMonth] = useState(element?element.month:null);
    //visit
    let [visit, setVisit] = useState(element?element.visit:null);
    const isEdit = ['суперорганизация', 'организация', 'менеджер', 'admin'].includes(profile.role)
    //render
    return (
        <div>
            <Card className={isMobileApp?classes.cardM:classes.cardD}>
                <CardContent>
                    {
                        element?
                            <>
                                {element.client?<div style={{marginBottom: 5, lineHeight: 1.5, fontSize: 14, fontWeight: 'bold'}}>
                                    {getClientTitle(element.client)}
                                </div>:null}
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Прогресс:&nbsp;</div>
                                    <div className={classes.value}>{element.current} сом</div>
                                </div>
                            </>
                            :
                            process.browser?<Autocomplete
                                style={{marginBottom: 10}}
                                onClose={()=>setOpen(false)}
                                open={open}
                                disableOpenOnFocus
                                className={classes.input}
                                options={clients}
                                getOptionLabel={option => getClientTitle(option)}
                                onChange={(event, newValue) => handleClient(newValue)}
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
                            />:<div style={{height: 48, marginBottom: 10}}/>
                    }
                    {
                        isEdit?
                            <div className={classes.row}>
                                <TextField
                                    type={ isMobileApp?'number':'text'}
                                    label='Посещение план'
                                    value={visit}
                                    style={{width: 'calc(50% - 5px)'}}
                                    onChange={(event) => setVisit(inputInt(event.target.value))}
                                />
                                <div style={{width: 10}}/>
                                <TextField
                                    type={ isMobileApp?'number':'text'}
                                    label='Месячный план'
                                    value={month}
                                    style={{width: 'calc(50% - 5px)'}}
                                    onChange={(event) => setMonth(inputInt(event.target.value))}
                                />
                            </div>
                            :
                            <>
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Посещение план:&nbsp;</div>
                                    <div className={classes.value}>{visit} сом</div>
                                </div>
                                <div className={classes.row}>
                                    <div className={classes.nameField} style={{marginBottom: 0}}>Месячный план:&nbsp;</div>
                                    <div className={classes.value} style={{marginBottom: 0, color: element.current<month?'orange':'green'}}>{month} сом</div>
                                </div>
                            </>
                    }
                </CardContent>
                {isEdit?<CardActions>
                    <Button onClick={async () => {
                        if(client) {
                            let editElement = {
                                organization: organization._id,
                                client: client._id,
                                month: checkInt(month),
                                visit: checkInt(visit)
                            }
                            const action = async () => {
                                let res = await setPlanClient(editElement)
                                if(res) {
                                    if(!element) {
                                        editElement.client = client
                                        editElement._id = res
                                        setList(list => [editElement, ...list])
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
                            <Button size='small' color='secondary' onClick={() => {
                                const action = async () => {
                                    await deletePlanClient({_id: element._id})
                                    setList(list => {
                                        list.splice(idx, 1)
                                        return [...list]
                                    })
                                    setCount(count => count-1)
                                }
                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                showMiniDialog(true)
                            }}>
                                Удалить
                            </Button>
                            :
                            null
                    }
                </CardActions>:null}
            </Card>
        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(CardPlanClient)
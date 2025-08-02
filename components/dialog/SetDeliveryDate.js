import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import * as appActions from '../../redux/actions/app'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getClients } from '../../src/gql/client'
import Confirmation from './Confirmation'
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { saveDeliveryDates } from '../../src/gql/deliveryDate'

const SetDeliveryDate =  React.memo(
    (props) =>{
        const {classes, organization, deliveryDates, setDeliveryDates} = props;
        const {isMobileApp} = props.app;
        const {showSnackBar} = props.snackbarActions;
        const {showMiniDialog, setMiniDialog} = props.mini_dialogActions;
        const searchTimeOut = useRef(null);
        const [open, setOpen] = useState(false);
        const [inputValue, setInputValue] = React.useState('');
        const [loading, setLoading] = useState(true);
        const [clients, setClients] = useState([]);
        useEffect(() => {
            (async () => {
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
                        setClients(await getClients({search: inputValue, sort: '-name', filter: 'all'}))
                        if(!open)
                            setOpen(true)
                        setLoading(false)
                    }, 500)
                }
            })()
        }, [inputValue]);
        const handleChange = event => {
            setInputValue(event.target.value);
        };
        let [client, setClient] = useState([]);
        let handleClient =  (client) => {
            setClient(client)
            setOpen(false)
        };
        let [days, setDays] = useState([true, true, true, true, true, true, false]);
        const width = isMobileApp? (window.innerWidth-112) : 500
        const prioritys = [1, 0]
        let [priority, setPriority] = useState(0);
        let handlePriority =  (event) => {
            setPriority(event.target.value)
        };
        return (
            <div className={classes.main}>
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
                    noOptionsText='Ничего не найдено'
                    style={{width: width}}
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
                />
                <br/>
                <FormControl style={{width: width}} className={classes.input}>
                    <InputLabel>Приоритет</InputLabel>
                    <Select
                        value={priority}
                        onChange={handlePriority}
                    >
                        {prioritys?prioritys.map((element)=>
                            <MenuItem key={element} value={element}>{element}</MenuItem>
                        ):null}
                    </Select>
                </FormControl>
                <br/>
                <div style={{width: width, flexWrap: 'wrap'}} className={classes.row}>
                    <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[0] = !days[0];setDays([...days])}} size='small' color={days[0]?'primary':''}>
                        ПН
                    </Button>
                    <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[1] = !days[1];setDays([...days])}} size='small' color={days[1]?'primary':''}>
                        ВТ
                    </Button>
                    <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[2] = !days[2];setDays([...days])}} size='small' color={days[2]?'primary':''}>
                        СР
                    </Button>
                    <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[3] = !days[3];setDays([...days])}} size='small' color={days[3]?'primary':''}>
                        ЧТ
                    </Button>
                    <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[4] = !days[4];setDays([...days])}} size='small' color={days[4]?'primary':''}>
                        ПТ
                    </Button>
                    <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[5] = !days[5];setDays([...days])}} size='small' color={days[5]?'primary':''}>
                        СБ
                    </Button>
                    <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[6] = !days[6];setDays([...days])}} size='small' color={days[6]?'primary':''}>
                        ВС
                    </Button>
                </div>
                <br/>
                <div>
                    <Button variant="contained" color='primary' onClick={async () => {
                        if(client&&client._id) {
                            const action = async () => {
                                await saveDeliveryDates([client._id], organization._id, days, priority)
                                if(deliveryDates[client._id]) {
                                    deliveryDates[client._id] = {
                                        client: client._id,
                                        days: days,
                                        priority: priority,
                                        organization: organization._id
                                    }
                                    setDeliveryDates({...deliveryDates})
                                }
                            }
                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                            showMiniDialog(true)
                        }
                        else {
                            showSnackBar('Заполните все поля');
                        }
                        close()
                    }} className={classes.button}>
                        Сохранить
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => {showMiniDialog(false);}} className={classes.button}>
                        Закрыть
                    </Button>
                </div>
            </div>
        );
    }
)

function mapStateToProps (state) {
    return {
        app: state.app
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
    }
}

SetDeliveryDate.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(SetDeliveryDate));
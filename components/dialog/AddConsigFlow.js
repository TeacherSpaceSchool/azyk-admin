import React, {useEffect, useRef, useState} from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as appActions from '../../redux/actions/app'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import Autocomplete from '@material-ui/lab/Autocomplete';
import {getClients} from '../../src/gql/client';
import {checkFloat, getClientTitle, inputFloat} from '../../src/lib';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {addConsigFlow} from '../../src/gql/consigFlow';
import * as snackbarActions from '../../redux/actions/snackbar'
import {useRouter} from 'next/router';

const AddConsigFlow =  React.memo(
    (props) =>{
        const router = useRouter();
        //props
        const {classes, initialClient, initialAmount} = props;
        const {isMobileApp, city, district, network} = props.app;
        const width = isMobileApp? (window.innerWidth-112) : 500
        const {showMiniDialog} = props.mini_dialogActions;
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
                    setClients(await getClients({search: inputValue, sort: 'name', filter: 'all', city, district, network}))
                    if(!open)
                        setOpen(true)
                    setLoading(false)
                }, 500)
            }
        }, [inputValue]);
        const handleChange = event => setInputValue(event.target.value);
        let [client, setClient] = useState(null);
        let handleClient = (client) => {
            setClient(client)
            setOpen(false)
        };
        //amount
        let [amount, setAmount] = useState(initialAmount);
        //sign
        let signs = [{name: 'Консигнация', value: 1}, {name: 'Оплата', value: -1}]
        let [sign, setSign] = useState(-1);
        let handleSign =  (event) => setSign(event.target.value);
        //render
        return (
            <div className={classes.main}>
                {!initialClient?<><Autocomplete
                    style={{marginBottom: 10, width}}
                    onClose={() => setOpen(false)}
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
                /><br/></>:null}
                <div className={classes.row}>
                    <FormControl className={classes.input} style={{width: (width-10)/2}}>
                        <InputLabel>Тип</InputLabel>
                        <Select inputProps={{readOnly: initialAmount}}
                            value={sign}
                            onChange={handleSign}
                        >
                            {signs.map((element) =>
                                <MenuItem key={element.value} value={element.value}>{element.name}</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                    <div style={{width: 10}}/>
                    <TextField
                        label='Сумма'
                        style={{width: (width-10)/2}}
                        value={amount}
                        className={classes.input}
                        onChange={ event => setAmount(inputFloat(event.target.value)) }
                    />
                </div>
                <br/>
                <div>
                    <Button variant='contained' color='primary' onClick={async () => {
                        if(initialClient) client = {_id: initialClient}
                        amount = checkFloat(amount||initialAmount)
                        if(client&&amount) {
                            await addConsigFlow({client: client._id, sign, amount: amount})
                            router.reload()
                        } else showSnackBar('Заполните все поля')
                    }} className={classes.button}>
                        {initialAmount?'Оплатить':'Добавить'}
                    </Button>
                    <Button variant='contained' color='secondary' onClick={() => showMiniDialog(false)} className={classes.button}>
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(AddConsigFlow));
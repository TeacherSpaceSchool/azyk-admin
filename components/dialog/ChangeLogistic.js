import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import Autocomplete from '@material-ui/lab/Autocomplete';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import * as snackbarActions from '../../redux/actions/snackbar';
import {setInvoicesLogic} from '../../src/gql/order';
import {getEmployments} from '../../src/gql/employment';
import {rowReverseDialog} from '../../src/lib';

const tracks = [1, 2, 3, 4, 5];

const ChangeLogistic =  React.memo(
    (props) =>{
        //props
        const {classes, type, invoices, setList, dateDelivery} = props;
        const {showSnackBar} = props.snackbarActions;
        const {organization} = props.app;
        const {isMobileApp} = props.app;
        const {showMiniDialog} = props.mini_dialogActions;
        const width = isMobileApp? (window.innerWidth-112) : 500
        //forwarders
        let [forwarders, setForwarders] = useState([]);
        useEffect(() => {(async () => {
            setForwarders(await getEmployments({organization, search: '', filter: 'экспедитор'}))
        })()}, [])
        //forwarder
        let [forwarder, setForwarder] = useState(null);
        //track
        let [track, setTrack] = useState(null);
        let handleTrack =  (event) => {
            setTrack(event.target.value)
        };
        //paymentMethod
        let paymentMethods = ['Наличные', 'Перечисление', 'Консигнация']
        let [paymentMethod, setPaymentMethod] = useState(null);
        let handlePaymentMethod =  (event) => {
            setPaymentMethod(event.target.value)
        };
        //render
        return (
            <div className={classes.main}>
                {type==='forwarder'?
                    <Autocomplete
                        style={{width: width}}
                        className={classes.textField}
                        options={forwarders}
                        getOptionLabel={option => option.name}
                        value={forwarder}
                        onChange={(event, newValue) => setForwarder(newValue)}
                        noOptionsText='Ничего не найдено'
                        renderInput={params => <TextField {...params} label='Экспедитор' fullWidth/>}
                    />:null}
                {type==='track'?<FormControl style={{width: width}} className={classes.input}>
                    <InputLabel>Рейс</InputLabel>
                    <Select
                        value={track}
                        onChange={handleTrack}
                    >
                        {tracks.map((element) => <MenuItem key={element} value={element}>{element}</MenuItem>)}
                    </Select>
                </FormControl>:null}
                {type==='paymentMethod'?<FormControl style={{width: width}} className={classes.input}>
                        <InputLabel>Способ оплаты</InputLabel>
                        <Select value={paymentMethod} onChange={handlePaymentMethod}>
                            {paymentMethods.map((element) =>
                                <MenuItem key={element} value={element} >{element}</MenuItem>
                            )}
                        </Select>
                    </FormControl>:null}
                <br/>
                <div style={rowReverseDialog(isMobileApp)}>
                    <Button variant='contained' color='primary' onClick={async () => {
                       if(paymentMethod||forwarder||track) {
                           await setInvoicesLogic({
                               track,
                               paymentMethod,
                               ...forwarder?{forwarder: forwarder._id}:{},
                               invoices,
                               dateDelivery
                           })
                           showMiniDialog(false);
                           setList(list => {
                               return list.map(invoice => {
                                   if(invoices.includes(invoice._id)) {
                                       if (forwarder) invoice.forwarder = forwarder
                                       if (track) invoice.track = track
                                       if (paymentMethod) invoice.paymentMethod = paymentMethod
                                   }
                                   return invoice
                               })
                           })
                       } else showSnackBar('Заполните все поля')
                    }} className={classes.button}>
                        Сохранить
                    </Button>
                    <Button variant='contained' color='secondary' onClick={() => {showMiniDialog(false);}} className={classes.button}>
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
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
    }
}

ChangeLogistic.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(ChangeLogistic));
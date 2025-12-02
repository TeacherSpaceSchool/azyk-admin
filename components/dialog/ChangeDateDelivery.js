import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import * as snackbarActions from '../../redux/actions/snackbar';
import {setInvoicesDateDelivery} from '../../src/gql/order';
import {pdDatePicker, rowReverseDialog} from '../../src/lib';

const ChangeDateDelivery =  React.memo(
    (props) =>{
        //ref
        const dateRef = useRef(null);
        //props
        const {classes, invoices, setList, dateDelivery} = props;
        const {showSnackBar} = props.snackbarActions;
        const {isMobileApp} = props.app;
        const {showMiniDialog} = props.mini_dialogActions;
        const width = isMobileApp? (window.innerWidth-112) : 500
        //newDateDelivery
        let [newDateDelivery, setNewDateDelivery] = useState(null);
        useEffect(() => {
            if(dateDelivery) {
                setNewDateDelivery(pdDatePicker(dateDelivery))
            }
        }, []);
        const action = async () => {
            if(newDateDelivery) {
                await setInvoicesDateDelivery({dateDelivery: newDateDelivery, invoices})
                showMiniDialog(false);
                setList(list => list.map(invoice => {
                    if(invoices.includes(invoice._id)) invoice.dateDelivery = newDateDelivery
                    return invoice
                }))
            } else showSnackBar('Заполните все поля')
        }
        //render
        return (
            <div className={classes.main}>
                <TextField
                    error={!newDateDelivery}
                    style={{width}}
                    className={classes.textField}
                    label='Дата доставки'
                    type={'date'}
                    InputLabelProps={{shrink: true}}
                    value={newDateDelivery}
                    onInput={ event => setNewDateDelivery(event.target.value)}
                    onKeyPress={event => {
                        if(event.key === 'Enter') action()
                    }}
                    inputRef={dateRef}
                    onClick={() => dateRef.current.showPicker()}
                />
                <br/>
                <div style={rowReverseDialog(isMobileApp)}>
                    <Button variant='contained' color='primary' onClick={action} className={classes.button}>
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

ChangeDateDelivery.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(ChangeDateDelivery));
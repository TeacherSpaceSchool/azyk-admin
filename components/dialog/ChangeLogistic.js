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

const tracks = [1, 2, 3, 4, 5];

const ChangeLogistic =  React.memo(
    (props) =>{
        //props
        const {classes, type, invoices, getList, setSelectedOrders, dateDelivery} = props;
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
        //render
        return (
            <div className={classes.main}>
                {
                    type==='forwarder'?
                        <Autocomplete
                            style={{width: width}}
                            className={classes.textField}
                            options={forwarders}
                            getOptionLabel={option => option.name}
                            value={forwarder}
                            onChange={(event, newValue) => setForwarder(newValue)}
                            noOptionsText='Ничего не найдено'
                            renderInput={params => <TextField {...params} label='Экспедитор' fullWidth/>}
                        />
                        :
                        <FormControl style={{width: width}} className={classes.input}>
                            <InputLabel>Рейс</InputLabel>
                            <Select
                                value={track}
                                onChange={handleTrack}
                            >
                                {tracks.map((element) => <MenuItem key={element} value={element}>{element}</MenuItem>)}
                            </Select>
                        </FormControl>
                }
                <br/>
                <div>
                    <Button variant='contained' color='primary' onClick={async () => {
                       if(forwarder||track) {
                           await setInvoicesLogic({track, ...forwarder?{forwarder: forwarder._id}:{}, invoices, dateDelivery})
                           setSelectedOrders([])
                           showMiniDialog(false);
                           await getList()
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
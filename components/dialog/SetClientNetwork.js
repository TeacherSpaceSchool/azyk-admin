import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as appActions from '../../redux/actions/app'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import Autocomplete from '@material-ui/lab/Autocomplete';
import {rowReverseDialog} from '../../src/lib';

const SetClientNetwork =  React.memo(
    (props) =>{
        const {classes, clientNetworks, clientNetwork} = props;
        let [clientNetworkChange, setClientNetworkChange] = useState(clientNetwork);
        const {isMobileApp} = props.app;
        const {showMiniDialog} = props.mini_dialogActions;
        const {setClientNetwork} = props.appActions;
        const width = isMobileApp? (window.innerWidth-112) : 500
        return (
            <div className={classes.main}>
                <Autocomplete
                    style={{width: width}}
                    className={classes.textField}
                    options={clientNetworks}
                    getOptionLabel={option => option.name}
                    value={clientNetworkChange}
                    onChange={(event, newValue) => {
                        setClientNetworkChange(newValue)
                    }}
                    noOptionsText='Ничего не найдено'
                    renderInput={params => (
                        <TextField {...params} label='Сети клиентов' fullWidth
                                   onKeyPress={async event => {
                                       if(event.key === 'Enter'&&clientNetworkChange) {
                                           await setClientNetwork(clientNetworkChange._id)
                                           showMiniDialog(false);
                                       }
                                   }}/>
                    )}
                />
                <br/>
                <div style={rowReverseDialog(isMobileApp)}>
                    <Button variant='contained' color='primary' onClick={async () => {
                       if(clientNetworkChange)
                           await setClientNetwork(clientNetworkChange._id)
                       showMiniDialog(false);
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
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(SetClientNetwork));
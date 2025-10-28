import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as appActions from '../../redux/actions/app'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import Autocomplete from '@material-ui/lab/Autocomplete';

const SetOrganizations =  React.memo(
    (props) =>{
        const {classes, organizations} = props;
        const {isMobileApp, organization} = props.app;
        let [organizationChange, setOrganizationChange] = useState(organization?organizations.find(f => f._id === organization):null);
        const {showMiniDialog} = props.mini_dialogActions;
        const {setOrganization} = props.appActions;
        const width = isMobileApp? (window.innerWidth-112) : 500
        return (
            <div className={classes.main}>
                <Autocomplete
                    style={{width: width}}
                    className={classes.textField}
                    options={organizations}
                    getOptionLabel={option => option.name}
                    value={organizationChange}
                    onChange={(event, newValue) => {
                        setOrganizationChange(newValue)
                    }}
                    noOptionsText='Ничего не найдено'
                    renderInput={params => (
                        <TextField {...params} label='Организация' fullWidth
                                   onKeyPress={event => {
                                       if(event.key === 'Enter'&&organizationChange) {
                                           setOrganization(organizationChange._id)
                                           showMiniDialog(false);
                                       }
                                   }}/>
                    )}
                />
                <br/>
                <div>
                    <Button variant="contained" color='primary' onClick={() => {
                       if(organizationChange)
                           setOrganization(organizationChange._id)
                       showMiniDialog(false);
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
    }
}

SetOrganizations.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(SetOrganizations));
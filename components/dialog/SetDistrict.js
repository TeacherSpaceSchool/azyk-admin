import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import Autocomplete from '@material-ui/lab/Autocomplete';

const SetDistrict =  React.memo(
    (props) =>{
        const {classes, districts, setDistrict} = props;
        let [districtChange, setDistrictChange] = useState(null);
        const {isMobileApp} = props.app;
        const {showMiniDialog} = props.mini_dialogActions;
        const width = isMobileApp? (window.innerWidth-112) : 500
        return (
            <div className={classes.main}>
                <Autocomplete
                    style={{width: width}}
                    className={classes.textField}
                    options={districts}
                    getOptionLabel={option => option.name}
                    value={districtChange}
                    onChange={(event, newValue) => {
                        setDistrictChange(newValue)
                    }}
                    noOptionsText='Ничего не найдено'
                    renderInput={params => (
                        <TextField {...params} label='Район' fullWidth
                                   onKeyPress={async event => {
                                       if(event.key === 'Enter'&&districtChange) {
                                           await setDistrict(districtChange._id)
                                           showMiniDialog(false);
                                       }
                                   }}/>
                    )}
                />
                <br/>
                <div>
                    <Button variant="contained" color='primary' onClick={async () => {
                        if(districtChange) {
                            await setDistrict(districtChange._id)
                            showMiniDialog(false);
                        }
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
    }
}

SetDistrict.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(SetDistrict));
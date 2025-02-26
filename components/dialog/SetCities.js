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
import { setCityCookie } from '../../src/lib'
import * as lib from '../../src/lib'

const SetCities =  React.memo(
    (props) =>{
        const { classes, cities } = props;
        const { isMobileApp, city } = props.app;
        let [cityChange, setCityChange] = useState(city);
        const { showMiniDialog } = props.mini_dialogActions;
        const { setCity } = props.appActions;
        const width = isMobileApp? (window.innerWidth-112) : 500
        const _cities = cities?cities:lib.cities
        return (
            <div className={classes.main}>
                <Autocomplete
                    style={{width: width}}
                    className={classes.textField}
                    options={_cities}
                    getOptionLabel={option => option}
                    value={cityChange}
                    onChange={(event, newValue) => {
                        setCityChange(newValue)
                    }}
                    noOptionsText='Ничего не найдено'
                    renderInput={params => (
                        <TextField {...params} label='Город' fullWidth
                                   onKeyPress={async event => {
                                       if (event.key === 'Enter'&&cityChange) {
                                           await setCity(cityChange)
                                           setCityCookie(cityChange?cityChange:'')
                                           showMiniDialog(false);
                                       }
                                   }}/>
                    )}
                />
                <br/>
                <div>
                    <Button variant="contained" color="primary" onClick={async()=>{
                        await setCity(cityChange)
                        setCityCookie(cityChange?cityChange:'')
                        showMiniDialog(false);
                    }} className={classes.button}>
                        Сохранить
                    </Button>
                    <Button variant="contained" color="secondary" onClick={()=>{showMiniDialog(false);}} className={classes.button}>
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

SetCities.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(SetCities));
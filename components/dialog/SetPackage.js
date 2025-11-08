import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import {checkInt, rowReverseDialog} from '../../src/lib'

const SetPackage =  React.memo(
    (props) =>{
        const {action, classes, idx} = props;
        const {isMobileApp} = props.app;
        const {showMiniDialog} = props.mini_dialogActions;
        let [count, setCount] = useState('');
        let handleCount =  (event) => {
            setCount(checkInt(event.target.value))
        };
        return (
            <div className={classes.main}>
                <TextField
                    autoFocus
                    value={count}
                    className={classes.input}
                    onChange={handleCount}
                    onKeyPress={event => {
                        if(event.key === 'Enter') {
                            action(idx, count);
                            showMiniDialog(false);
                        }
                    }}
                />
                <br/>
                <br/>
                <div style={rowReverseDialog(isMobileApp)}>
                    <Button variant='contained' color='primary' onClick={async () => {
                        action(idx, count);
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
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch)
    }
}

SetPackage.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(SetPackage));
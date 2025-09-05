import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as appActions from '../../redux/actions/app'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import Done from '@material-ui/icons/Done';
import Clear from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';
import dialogContentStyle from '../../src/styleMUI/dialogContent'

const Confirmation =  React.memo(
    (props) =>{
        const {showMiniDialog} = props.mini_dialogActions;
        const {showLoad} = props.appActions;
        const {classes, action} = props;
        return (
            <center className={classes.line}>
                <IconButton onClick={async () => {
                    showMiniDialog(false)
                    showLoad(true)
                    await action()
                    showLoad(false)
                }}>
                    <Done className={classes.button} />
                </IconButton>
                <IconButton onClick={async () => {
                    showMiniDialog(false)
                }}>
                    <Clear className={classes.button}/>
                </IconButton>
            </center>
        );
    }
)

function mapStateToProps () {
    return {}
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
    }
}

Confirmation.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(Confirmation));
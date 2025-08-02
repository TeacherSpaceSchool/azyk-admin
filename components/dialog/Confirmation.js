import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as appActions from '../../redux/actions/app'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import Done from '@material-ui/icons/Done';
import Clear from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';
import dialogContentStyle from '../../src/styleMUI/dialogContent'

const Confirmation =  React.memo(
    (props) =>{
        const {showMiniDialog} = props.mini_dialogActions;
        const {showSnackBar} = props.snackbarActions;
        const {showLoad} = props.appActions;
        const {classes, action} = props;
        return (
            <div className={classes.line}>
                <IconButton onClick={async () => {
                    await showMiniDialog(false)
                    showLoad(true)
                    try {
                        await action()
                    }  catch (err) {
                        console.error(err)
                        showSnackBar('Ошибка')
                    }
                    showLoad(false)
                }}>
                    <Done className={classes.button} />
                </IconButton>
                <IconButton onClick={async () => {
                    showMiniDialog(false)
                }}>
                    <Clear className={classes.button}/>
                </IconButton>
            </div>
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
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
    }
}

Confirmation.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(Confirmation));
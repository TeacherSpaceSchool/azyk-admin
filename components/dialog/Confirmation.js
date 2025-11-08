import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as appActions from '../../redux/actions/app'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import Button from '@material-ui/core/Button';
import {rowReverseDialog} from '../../src/lib';

const Confirmation =  React.memo(
    (props) =>{
        const {showMiniDialog} = props.mini_dialogActions;
        const {showLoad} = props.appActions;
        const {action} = props;
        const {isMobileApp} = props.app;
        return <>
            <div style={rowReverseDialog(isMobileApp)}>
                <Button variant='contained' color='primary' style={{width: 100}} onClick={async () => {
                    showMiniDialog(false)
                    showLoad(true)
                    await action()
                    showLoad(false)
                }}>
                    Принять
                </Button>
                <div style={{width: 16}}/>
                <Button variant='contained' color='secondary' style={{width: 100}} onClick={() => showMiniDialog(false)}>
                    Отмена
                </Button>
            </div>
            <div style={{height: 16}}/>
        </>
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

Confirmation.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(Confirmation));
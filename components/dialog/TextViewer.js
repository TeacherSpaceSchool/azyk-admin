import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import Button from '@material-ui/core/Button';
import {rowReverseDialog} from '../../src/lib';

const TextViewer =  React.memo((props) =>{
    const {showFullDialog} = props.mini_dialogActions;
    const {classes, text} = props;
    const {isMobileApp} = props.app;
    return (
        <div className={classes.column}>
            <div className={classes.value} style={{whiteSpace: 'pre', height: 'calc(100vh - 79px)', overflow: 'auto'}}>
                {text}
            </div>
            <div style={rowReverseDialog(isMobileApp)}>
                <Button variant='contained' color='secondary' onClick={() => {showFullDialog(false);}} className={classes.button}>
                    Закрыть
                </Button>
            </div>
        </div>
    );
})

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

TextViewer.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(TextViewer));
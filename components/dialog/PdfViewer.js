import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import Button from '@material-ui/core/Button';
import {rowReverseDialog} from '../../src/lib';

const PdfViewer =  React.memo(
    (props) =>{
        const {showFullDialog} = props.mini_dialogActions;
        const {classes, pdf} = props;
        const {isMobileApp} = props.app;
        return (
            <div className={classes.column}>
                <object style={{height: window.innerHeight-140, width: window.innerWidth-48}} data={pdf} type='application/pdf'>
                    <iframe style={{height: window.innerHeight-145, width: window.innerWidth-48}} src={`https://docs.google.com/viewer?url=${pdf}&embedded=true`}/>
                </object>
                <div style={rowReverseDialog(isMobileApp)}>
                    <Button variant='contained' color='secondary' onClick={() => {showFullDialog(false);}} className={classes.button}>
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

PdfViewer.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(PdfViewer));
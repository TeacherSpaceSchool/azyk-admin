import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import Button from '@material-ui/core/Button';

const Ads =  React.memo((props) =>{
    const {showMiniDialog} = props.mini_dialogActions;
    const {classes, ads} = props;
    return (
        <div className={classes.column}>
            <div style={{fontSize: '1rem', marginBottom: 10, whiteSpace: 'pre-wrap'}}>
                {ads.title}
            </div>
            <center>
                <Button variant='text' color='secondary' onClick={() => showMiniDialog(false)} className={classes.button}>
                    Закрыть
                </Button>
            </center>
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

Ads.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(Ads));
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import Button from '@material-ui/core/Button';
import {pdDDMMHHMM, rowReverseDialog} from '../../src/lib';

const historyTypes = {
    0: 'create',
    1: 'set',
    2: 'delete'
}

const History =  React.memo((props) =>{
    const {showMiniDialog} = props.mini_dialogActions;
    const {classes, list} = props;
    const {isMobileApp} = props.app;
    return (
        <div className={classes.column}>
            {list.map((element) => {
                const {createdAt, user, employment, client, type, data} = element
                return <div>{pdDDMMHHMM(createdAt)} {user.role} {employment?employment.name:''}{client?client.name:''} {historyTypes[type]}{data?` ${data}`:''}</div>
            })}
            <div style={rowReverseDialog(isMobileApp)}>
                <Button variant='contained' color='secondary' onClick={() => showMiniDialog(false)} className={classes.button}>
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

History.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(History));
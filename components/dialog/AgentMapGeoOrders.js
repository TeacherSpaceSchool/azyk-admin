import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import Button from '@material-ui/core/Button';
import dialogContentStyle from '../../src/styleMUI/dialogContent'

const AgentMapGeoOrders =  React.memo(
    (props) =>{
        const {classes, orders, setIndexOrder} = props;
        const {showMiniDialog} = props.mini_dialogActions;
        return (
            <div className={classes.column}>
                {
                    orders.map((order, idx) => {
                        return (
                            <div key={`order${idx}`} style={{cursor: 'pointer', marginBottom: 15, width: '100%', border: '1px solid #E0E0E0', padding: 10}} className={classes.column} onClick={() => {
                                setIndexOrder(order[2]);
                                showMiniDialog(false);
                            }}>
                                <div className={classes.row}>
                                    <div className={classes.nameField} style={{marginBottom: 5}}>
                                        Магазин:&nbsp;</div>
                                    <div className={classes.value} style={{marginBottom: 5}}>{order[0]}</div>
                                </div>
                                <div className={classes.row}>
                                    <div className={classes.nameField} style={{marginBottom: 10}}>
                                        Растояние:&nbsp;</div>
                                    <div className={classes.value} style={{marginBottom: 10}}>
                                        {order[1]}&nbsp;м
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
                <center>
                    <Button variant="contained" color="secondary" onClick={() => {showMiniDialog(false);}} className={classes.button}>
                        Закрыть
                    </Button>
                </center>
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
    }
}

AgentMapGeoOrders.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(AgentMapGeoOrders));
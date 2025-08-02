import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import Button from '@material-ui/core/Button';
import dialogContentStyle from '../../src/styleMUI/dialogContent'

const ItemList =  React.memo(
    (props) =>{
        const {classes, items} = props;
        const {showMiniDialog} = props.mini_dialogActions;
        let organization, number;
        return (
            <div className={classes.column}>
                {
                    items.map((item, idx) => {
                        return(
                                <div key={`item${idx}`} className={classes.column}>
                                    {
                                        !idx||item[2]!==organization?
                                            <>
                                            {
                                                (() => {organization = item[2]; number = 0})()
                                            }
                                            <div style={{fontWeight: 'bold', marginBottom: 10, marginTop: !idx?0:10}}>{organization}</div>
                                            </>
                                            :
                                            null
                                    }
                                    <div className={classes.row}>
                                        <div className={classes.nameField} style={{marginBottom: 5}}>Товар {++number}:&nbsp;</div>
                                        <div className={classes.value} style={{marginBottom: 5}}>{item[0]}</div>
                                    </div>
                                    <div className={classes.row}>
                                        <div className={classes.nameField} style={{marginBottom: 10}}>Количество:&nbsp;</div>
                                        <div className={classes.value} style={{marginBottom: 10}}>{item[1]}&nbsp;шт</div>
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

ItemList.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(ItemList));
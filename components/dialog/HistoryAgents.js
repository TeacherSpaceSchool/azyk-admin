import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { getOrderHistorys } from '../../src/gql/order'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import Button from '@material-ui/core/Button';
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import { pdDDMMYYHHMM } from '../../src/lib'
import Link from "next/link";

const HistoryAgents =  React.memo(
    (props) =>{
        const { isMobileApp } = props.app;
        const { showMiniDialog } = props.mini_dialogActions;
        const { classes, agentsHistory } = props;
        const width = isMobileApp? (window.innerWidth-112) : 500;
        return (
            <div className={classes.column} style={{width: width}}>
                {
                    agentsHistory.map((agentHistory) =>
                        <>
                            <div className={classes.row}>
                                <div className={classes.nameField}>Изменен:&nbsp;</div>
                                <div className={classes.value}>{pdDDMMYYHHMM(new Date(agentHistory.date))}</div>
                            </div>
                            <div className={classes.row}>
                                <div className={classes.nameField}>Агент:&nbsp;</div>
                                <Link href='/employment/[id]' as={`/employment/${agentHistory.agent._id}`}>
                                    <div style={{cursor: 'pointer', color: '#ffb300',
                                        marginBottom: 10,
                                        fontWeight: '500',
                                        fontSize: '0.95rem',
                                        fontFamily: 'Roboto'}}>{agentHistory.agent.name}</div>
                                </Link>
                            </div>
                        </>
                    )
                }
                <br/>
                <center>
                    <Button variant='contained' color='secondary' onClick={()=>{showMiniDialog(false);}} className={classes.button}>
                        Закрыть
                    </Button>
                </center>
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
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
    }
}

HistoryAgents.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(HistoryAgents));
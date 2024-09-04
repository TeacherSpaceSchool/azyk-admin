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
        const { classes, agents } = props;
        const width = isMobileApp? (window.innerWidth-112) : 500;
        return (
            <div className={classes.column} style={{width: width}}>
                {
                    agents.map((agent) =>
                        <Link href='/employment/[id]' as={`/employment/${agent._id}`}>
                            <div style={{cursor: 'pointer', color: '#ffb300',
                                marginBottom: 10,
                                fontWeight: '500',
                                fontSize: '0.95rem',
                                fontFamily: 'Roboto'}}>{agent.name}</div>
                        </Link>
                    )
                }
                <br/>
                <div>
                    <Button variant='contained' color='secondary' onClick={()=>{showMiniDialog(false);}} className={classes.button}>
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
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
    }
}

HistoryAgents.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(HistoryAgents));
import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'

const MyDialog =  React.memo(
    (props) =>{
        const {title, child, show} = props.mini_dialog;
        const {showMiniDialog} = props.mini_dialogActions;
        return (
                <Dialog
                    open={show}
                    onClose={() => {showMiniDialog(false)}}
                >
                    <DialogTitle style={!title?{height: 0, padding: '0px !important'}:{}} onClose={() => {showMiniDialog(false)}}>{title}</DialogTitle>
                    <DialogContent>
                        {child}
                    </DialogContent>
                </Dialog>
        );
    }
)

function mapStateToProps (state) {
    return {
        mini_dialog: state.mini_dialog
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyDialog);
import React from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';
import * as snackbarActions from '../../redux/actions/snackbar'

const MyDialog =  React.memo(
    (props) =>{
        const {title, show} = props.snackbar;
        const {closeSnackBar} = props.snackbarActions;
        return (
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={show}
                autoHideDuration={6000}
                onClose={closeSnackBar}
                ContentProps={{
                    'aria-describedby': 'message-id',
                }}
                message={<span id="message-id">{title}</span>}
                action={[
                    <Button key="undo" color="secondary" size="small" onClick={closeSnackBar}>
                        Закрыть
                    </Button>
                ]}
            />
        );
    }
)

function mapStateToProps (state) {
    return {
        snackbar: state.snackbar
    }
}

function mapDispatchToProps(dispatch) {
    return {
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyDialog)
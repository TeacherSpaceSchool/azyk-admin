import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cardErrorStyle from '../../src/styleMUI/error/cardError'
import {pdDDMMYYHHMM} from '../../src/lib'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import {bindActionCreators} from 'redux';
import * as mini_dialogActions from '../../redux/actions/mini_dialog';
import TextViewer from '../dialog/TextViewer';

const CardIntegrationLog = React.memo((props) => {
    const classes = cardErrorStyle();
    const {element} = props;
    const {showFullDialog, setFullDialog} = props.mini_dialogActions;
    const {isMobileApp} = props.app;
    return (
        <Card className={isMobileApp?classes.cardM:classes.cardD}>
            <CardContent>
                <div className={classes.date}>
                    {pdDDMMYYHHMM(element.createdAt)}
                </div>
                <br/>
                <div className={classes.row}>
                    <div className={classes.nameField}>
                        Путь:&nbsp;
                    </div>
                    <div className={classes.value}>
                        {element.path}
                    </div>
                </div>
                <Button onClick={async () => {
                    setFullDialog(element.title, <TextViewer text={element.xml}/>)
                    showFullDialog(true)
                }} size='small' color='primary'>
                    Просмотреть XML
                </Button>
            </CardContent>
        </Card>
    );
})

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

export default connect(mapStateToProps, mapDispatchToProps)(CardIntegrationLog)
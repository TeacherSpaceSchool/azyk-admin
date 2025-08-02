import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cardErrorStyle from '../../src/styleMUI/error/cardError'
import {pdDDMMYYHHMM} from '../../src/lib'
import { connect } from 'react-redux'


const CardError = React.memo((props) => {
    const classes = cardErrorStyle();
    const {element} = props;
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
                        Ошибка:&nbsp;
                    </div>
                    <div className={classes.value}>
                        {element.err}
                    </div>
                </div>
                {
                    element.path?
                        <div className={classes.row}>
                            <div className={classes.nameField}>
                                Путь:&nbsp;
                            </div>
                            <div className={classes.value}>
                                {element.path}
                            </div>
                        </div>
                        :
                        null
                }
            </CardContent>
        </Card>
    );
})

function mapStateToProps (state) {
    return {
        app: state.app
    }
}

export default connect(mapStateToProps)(CardError)
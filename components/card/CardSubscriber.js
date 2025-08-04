import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import cardSubscriberStyle from '../../src/styleMUI/subscriber/cardSubscriber'
import { connect } from 'react-redux'
import {pdDDMMYYHHMM} from '../../src/lib'


const NotificationStatistic = React.memo((props) => {
    const classes = cardSubscriberStyle();
    const {element} = props;
    const {isMobileApp} = props.app;
    return (
        <Card className={isMobileApp?classes.cardM:classes.cardD}>
            <CardContent>
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Дата подписки:&nbsp;</div>
                                    <div className={classes.value}>{pdDDMMYYHHMM(element.createdAt)}</div>
                                </div>
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Номер:&nbsp;</div>
                                    <div className={classes.value}>{element.number}</div>
                                </div>
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Подписчик:&nbsp;</div>
                                    <div className={classes.value}>{element.user}</div>
                                </div>
                                <div className={classes.row}>
                                    <div className={classes.nameField}>Статус:&nbsp;</div>
                                    <div className={classes.value}>{element.status}</div>
                                </div>
                        </CardContent>
                    </Card>
    );
})

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app
    }
}

export default connect(mapStateToProps)(NotificationStatistic)
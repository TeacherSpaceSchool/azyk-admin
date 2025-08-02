import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cardErrorStyle from '../../src/styleMUI/error/cardError'
import {pdDDMMYYHHMM} from '../../src/lib'
import { connect } from 'react-redux'
import {useRouter} from 'next/router';

const historyTypes = {
    0: 'create',
    1: 'set',
    2: 'delete'
}

const CardHistory = React.memo((props) => {
    const classes = cardErrorStyle();
    const router = useRouter();
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
                        Редактор:&nbsp;
                    </div>
                    <div className={classes.value} style={element.employment||element.client?{color: '#ffb300', cursor: 'pointer'}:{}} onClick={() => {
                        if(element.employment||element.client)
                            router.push(`/${element.employment?'employments':'clients'}/${(element.employment||element.client)._id}`)
                    }}>
                        {element.user.role} {element.employment?element.employment.name:element.client?element.client.name:''}
                    </div>
                </div>
                <div className={classes.row}>
                    <div className={classes.nameField}>
                        Тип:&nbsp;
                    </div>
                    <div className={classes.value}>
                        {historyTypes[element.type]}
                    </div>
                </div>
                <div className={classes.row}>
                    <div className={classes.nameField}>
                        Модель:&nbsp;
                    </div>
                    <div className={classes.value}>
                        {element.model}
                    </div>
                </div>
                {
                    element.object?
                        <div className={classes.row}>
                            <div className={classes.nameField}>
                                Объект:&nbsp;
                            </div>
                            <div className={classes.value}>
                                {element.object}
                            </div>
                        </div>
                        :
                        null
                }
                {
                    element.name?
                        <div className={classes.row}>
                            <div className={classes.nameField}>
                                Имя:&nbsp;
                            </div>
                            <div className={classes.value}>
                                {element.name}
                            </div>
                        </div>
                        :
                        null
                }
                {
                    element.data?
                        <div className={classes.row}>
                            <div className={classes.nameField}>
                                Данные:&nbsp;
                            </div>
                            <div className={classes.value}>
                                {element.data}
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

export default connect(mapStateToProps)(CardHistory)
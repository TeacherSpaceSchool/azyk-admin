import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cardMerchandisingStyle from '../../src/styleMUI/merchandising/cardMerchandising'
import { connect } from 'react-redux'
import {getClientTitle, pdDDMMHHMM, pdDDMMYYHHMM} from '../../src/lib'
import Link from 'next/link';

const CardFhoClient = React.memo((props) => {
    const classes = cardMerchandisingStyle();
    const {element} = props;
    const {isMobileApp} = props.app;
    return (
        <Card className={isMobileApp?classes.cardM:classes.cardD}>
            <Link href='/fhoclient/[id]' as={`/fhoclient/${element._id}`}>
                <CardContent>
                    <div className={classes.row}>
                        <div className={classes.nameField}>Создан:&nbsp;</div>
                        <div className={classes.value}>{pdDDMMYYHHMM(element.createdAt)}</div>
                    </div>
                    <div className={classes.row}>
                        <div className={classes.nameField}>Клиент:&nbsp;</div>
                        <div className={classes.value} style={{color: 'black'}}>{getClientTitle(element.client)}</div>
                    </div>
                    <div className={classes.row}>
                        <div className={classes.nameField}>Фото:&nbsp;</div>
                        <div className={classes.value} style={{...!element.images.length?{color: 'red'}:{}}}>{element.images.length}</div>
                    </div>
                    {element.history[0]?<div className={classes.row}>
                        <div className={classes.nameField}>Редактор:&nbsp;</div>
                        <div className={classes.value}>
                            {pdDDMMHHMM(element.history[0].date)} {element.history[0].editor}
                        </div>
                    </div>:null}
                </CardContent>
            </Link>
        </Card>
    );
})

function mapStateToProps (state) {
    return {
        app: state.app
    }
}

export default connect(mapStateToProps)(CardFhoClient)
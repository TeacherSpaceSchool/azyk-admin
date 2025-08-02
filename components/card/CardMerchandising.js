import React, { useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cardMerchandisingStyle from '../../src/styleMUI/merchandising/cardMerchandising'
import { connect } from 'react-redux'
import {pdDDMMYYHHMM} from '../../src/lib'
import Link from 'next/link';

const CardMerchandising = React.memo((props) => {
    const classes = cardMerchandisingStyle();
    const {element} = props;
    const {isMobileApp} = props.app;
    let [differenceDate, setDifferenceDate] = useState(0);
    useEffect(() => {
        let now = new Date()
        setDifferenceDate((now - new Date(element.date))/(1000 * 60 * 60 * 24))
    }, []);
    return (
        <Card className={isMobileApp?classes.cardM:classes.cardD}>
            <div className={classes.status} style={{background: element.check?'green':'orange'}}>{element.check?'принят':'обработка'}</div>
            <Link href='/merchandising/[id]' as={`/merchandising/${element._id}`}>
                <a>
                <CardContent>
                    <div className={classes.row}>
                        <div className={classes.nameField}>Тип:&nbsp;</div>
                        <div className={classes.value} style={{color: 'black'}}>{element.type}</div>
                    </div>
                    <div className={classes.row} style={{color: differenceDate<7?'green':differenceDate<31?'orange':'red'}}>
                        <div className={classes.nameField}>Дата проверки:&nbsp;</div>
                        <div className={classes.value}>{pdDDMMYYHHMM(element.date)}</div>
                    </div>
                    <div className={classes.row}>
                        <div className={classes.nameField}>Клиент:&nbsp;</div>
                        <div className={classes.value} style={{color: 'black'}}>{`${element.client.name}${element.client.address&&element.client.address[0]?` (${element.client.address[0][2]?`${element.client.address[0][2]}, `:''}${element.client.address[0][0]})`:''}`}</div>
                    </div>
                    <div className={classes.row}>
                        <div className={classes.nameField}>Оценка:&nbsp;</div>
                        <div className={classes.value} style={{color: 'black'}}>{element.stateProduct}</div>
                    </div>
                    {
                        element.fhos.length?
                            <div className={classes.row}>
                                <div className={classes.nameField}>Оценка ФХО:&nbsp;</div>
                                <div style={{color: 'black'}}>
                                    {
                                        element.fhos.map((fho, idx)=><div key={`fho${idx}${element._id}`} className={classes.value}>{fho.state}</div>)
                                    }
                                </div>
                            </div>
                            :
                            null
                    }
                    {
                        element.agent?
                            <div className={classes.row}>
                                <div className={classes.nameField}>Агент:&nbsp;</div>
                                <div className={classes.value} style={{color: 'black'}}>{element.agent.name}</div>
                            </div>
                            :
                            null
                    }
                </CardContent>
                </a>
            </Link>
        </Card>
    );
})

function mapStateToProps (state) {
    return {
        app: state.app
    }
}

export default connect(mapStateToProps)(CardMerchandising)
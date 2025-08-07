import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cardErrorStyle from '../../src/styleMUI/offlineorder/cardOfflineOrder'
import {pdDDMMYYHHMM, unawaited} from '../../src/lib'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import Router from 'next/router'
import { addAgentHistoryGeo } from '../../src/gql/agentHistoryGeo'
import { getGeoDistance } from '../../src/lib'
import { addOrders } from '../../src/gql/order'
import { addBasket } from '../../src/gql/basket'
import { deleteOfflineOrderByKey } from '../../src/service/idb/offlineOrders';

const CardOfflineOrder = React.memo((props) => {
    const classes = cardErrorStyle();
    const {element, list, setList, idx} = props;
    const {isMobileApp} = props.app;
    return (
        <Card className={isMobileApp?classes.cardM:classes.cardD}>
            <CardContent>
                <div className={classes.date}>
                    {pdDDMMYYHHMM(element.dateDelivery)}
                </div>
                <br/>
                <div className={classes.row}>
                    <div className={classes.nameField}>
                        Получатель:&nbsp;
                    </div>
                    <div className={classes.value}>
                        {element.name}
                    </div>
                </div>
                <div className={classes.row}>
                    <div className={classes.nameField}>
                        Адрес:&nbsp;
                    </div>
                    <div className={classes.value}>
                        {`${element.address[2]?`${element.address[2]}, `:''}${element.address[0]}`}
                    </div>
                </div>
                <div className={classes.row}>
                    <div className={classes.nameField}>
                        Сумма:&nbsp;
                    </div>
                    <div className={classes.value}>
                        {element.allPrice}
                    </div>
                </div>
            </CardContent>
            <CardActions>
                {
                    process.browser&&navigator.onLine?
                        <Button onClick={async () => {
                            if(element.geo&&element.address[1].includes(', ')) {
                                let distance = getGeoDistance(element.geo.latitude, element.geo.longitude, ...(element.address[1].split(', ')))
                                if(distance<1000) {
                                    unawaited(() => addAgentHistoryGeo({client: element.client, geo: `${element.geo.latitude}, ${element.geo.longitude}`}))
                                }
                            }
                            for (let i = 0; i < element.basket.length; i++) {
                                if(element.basket[i].count > 0)
                                    await addBasket({
                                        item: element.basket[i]._id,
                                        count: element.basket[i].count
                                    })
                            }
                            await addOrders({
                                inv: element.inv,
                                unite: element.unite,
                                info: element.info,
                                paymentMethod: element.paymentMethod,
                                organization: element.organization,
                                client: element.client,
                                dateDelivery: new Date(element.dateDelivery)
                            })
                            await deleteOfflineOrderByKey(element.key)
                            Router.push('/orders')
                        }} size='small' color='primary'>
                            Синхронизировать
                        </Button>
                        :
                        null
                }
                <Button onClick={async () => {
                    await deleteOfflineOrderByKey(element.key)
                    list.splice(idx, 1)
                    setList([...list])
                }} size='small' color='secondary'>
                    Удалить
                </Button>
            </CardActions>
        </Card>
    );
})

function mapStateToProps (state) {
    return {
        app: state.app
    }
}

export default connect(mapStateToProps)(CardOfflineOrder)
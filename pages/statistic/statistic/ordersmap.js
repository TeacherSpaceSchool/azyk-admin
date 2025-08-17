import Head from 'next/head';
import React, {useState, useEffect} from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import Router from 'next/router'
import initialApp from '../../../src/initialApp'
import { getOrdersMap } from '../../../src/gql/statistic'
import { Map, YMaps, ObjectManager } from 'react-yandex-maps';
import CircularProgress from '@material-ui/core/CircularProgress';
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import {dayStartDefault, pdDatePicker} from '../../../src/lib'

const filters = [{name: 'Все', value: false}, {name: 'Online', value: true}]

const OrdersMap = React.memo((props) => {
    const {isMobileApp, date, organization, city, filter} = props.app;
    const {showLoad} = props.appActions;
    let [load, setLoad] = useState(true);
    useEffect(() => {
        if(process.browser) {
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    }, [process.browser])
    const [geos, setGeos] = useState([]);
    const [key, setKey] = useState(0);
    useEffect(() => {
        (async () => {
            showLoad(true)
            const geos = await getOrdersMap({
                organization: organization&&organization._id, date: date, online: filter===true, city
            });
            setGeos([...geos.map((geo) => {
                return {
                    type: 'Feature',
                    id: `${geo[0]}, ${geo[1]}`,
                    geometry: {type: 'Point', coordinates: [parseFloat(geo[0]), parseFloat(geo[1])]}
                }
            })]);
            setKey(key => key+1)
            showLoad(false)
        })()
    }, [organization, date, filter, city])

    return (
        <>
        <YMaps>
            <App cityShow pageName='Карта посещений' dates organizations filters={filters}>
                <Head>
                    <title>Карта посещений</title>
                    <meta name='robots' content='noindex, nofollow'/>
                </Head>
                {
                    process.browser&&geos?
                        <div style={{height: window.innerHeight-70, width: isMobileApp?window.innerWidth:window.innerWidth-300, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            {load?<CircularProgress/>:null}
                            <div style={{display: load?'none':'block'}}>
                                <Map onLoad={() => {setLoad(false)}} height={window.innerHeight-64} width={isMobileApp?window.innerWidth:window.innerWidth-300} state={{ center: [42.8700000, 74.5900000], zoom: 12 }}>
                                    <ObjectManager
                                        key={key}
                                        defaultFeatures={geos}
                                        options={{clusterize: true, gridSize: 128}}
                                        objects={{openBalloonOnClick: true, preset: 'islands#greenDotIcon'}}
                                        clusters={{preset: 'islands#redClusterIcons'}}
                                    />

                                </Map>
                            </div>
                        </div>
                        :
                        null
                }
            </App>
        </YMaps>
            <div className='count'>
                Заказов: {geos.length}
            </div>
        </>
    )
})

OrdersMap.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    let date = new Date()
    if(date.getHours()<dayStartDefault)
        date.setDate(date.getDate() - 1)
    ctx.store.getState().app.date = pdDatePicker(date)
    ctx.store.getState().app.organization = ctx.store.getState().user.profile.organization
    return {};
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrdersMap);
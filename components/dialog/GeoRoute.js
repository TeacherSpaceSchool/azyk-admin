import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import { Map, YMaps, Placemark, TrafficControl, Polyline } from 'react-yandex-maps';
import Order from './Order';
import OpenOrderRoute from './OpenOrderRoute';
import * as snackbarActions from '../../redux/actions/snackbar'
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import GpsFixed from '@material-ui/icons/GpsFixed';
import Navigation from '@material-ui/icons/Navigation';
import {getOrder} from '../../src/gql/order'

const Geo =  React.memo(
    (props) =>{
        const {showFullDialog, setMiniDialog, showMiniDialog} = props.mini_dialogActions;
        const {showSnackBar} = props.snackbarActions;
        const {classes, legs, invoices, setList} = props;
        let [_list, _setList] = useState(invoices);
        let _setList_ = (list) => {
            setList([...list])
            _setList([...list])
        }
        let [load, setLoad] = useState(true);
        const geolocationTimeOut = useRef(null);
        let [geo, setGeo] = useState(null);
        let [follow, setFollow] = useState(false);
        let [navigation, setNavigation] = useState(false);
        let [unacceptedIdx, setUnacceptedIdx] = useState(0);
        useEffect(() => {
            if(navigator.geolocation) {
                geolocationTimeOut.current = setInterval(() => {
                    navigator.geolocation.getCurrentPosition((position) => {
                        setGeo([position.coords.latitude, position.coords.longitude])
                    });
                }, 1000)
                return () => {
                    clearInterval(geolocationTimeOut.current)
                }
            } else {
                showSnackBar('Геолокация не поддерживается')
            }
        }, []);
        useEffect(() => {
            if(navigation) {
                unacceptedIdx = -1
                for(let i=0; i<_list.length; i++) {
                    if(unacceptedIdx===-1&&!_list[i].confirmationForwarder) {
                        unacceptedIdx = i
                    }
                }
                setUnacceptedIdx(unacceptedIdx)
            }
        }, [navigation, _list]);

        return (
            <YMaps>
                <div className={classes.column}>
                    <div style={{height: window.innerHeight-128, width: window.innerWidth-48, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        {
                            load?<CircularProgress/>:null
                        }
                        {geo&&follow?
                            <div style={{display: load?'none':'block'}}>
                                <Map onLoad={() => {setLoad(false)}} height={window.innerHeight-128} width={window.innerWidth-48} defaultState={{ center: ['42.8700000', '74.5900000'], zoom: 12 }}
                                     state={{ center: geo, zoom: 18 }}>
                                    <TrafficControl options={{ float: 'right' }} />
                                    {legs.map((leg, idx) => {
                                        if(!navigation||idx===unacceptedIdx||(unacceptedIdx===-1&&idx===legs.length-1))
                                            return(
                                                <Polyline
                                                    key={`leg${idx}`}
                                                    geometry={leg.map(element=>element.split(', '))}
                                                    options={{
                                                        balloonCloseButton: false,
                                                        strokeColor: '#000',
                                                        strokeWidth: 4,
                                                        strokeOpacity: 1,
                                                    }}
                                                />
                                            )
                                        }
                                    )}
                                    {geo?
                                        <Placemark
                                            options={{draggable: false, iconColor: 'indigo'}}
                                            properties={{iconCaption: 'Я'}}
                                            geometry={geo} />
                                        :
                                        null
                                    }
                                    {
                                        !navigation||unacceptedIdx===0||unacceptedIdx===-1?
                                            <Placemark
                                                options={{
                                                    draggable: false,
                                                    iconColor: '#ffb300'
                                                }}
                                                properties={{iconCaption: 'Cклад'}}
                                                geometry={legs[0][0].split(', ')}/>
                                            :
                                            null
                                    }
                                    {_list.map((invoice, idx) => {
                                        if(!navigation||idx===unacceptedIdx||idx===unacceptedIdx-1||(unacceptedIdx===-1&&idx===_list.length-1))
                                            return(
                                                <Placemark
                                                    key={invoice._id}
                                                    onClick={async () => {
                                                        let _elemenet = await getOrder(invoice._id)
                                                        if(_elemenet) {
                                                            if(geo) {
                                                                setMiniDialog('Заказ', <OpenOrderRoute idx={idx} _list={_list}
                                                                                              _setList_={_setList_}
                                                                                              route={false}
                                                                                                       _elemenet={_elemenet}
                                                                                              geoMy={geo}
                                                                                              geoOrder={invoice.address[1].split(', ')}
                                                                />);
                                                            }
                                                            else {
                                                                setMiniDialog('Заказ', <Order idx={idx} list={_list}
                                                                                              setList={_setList_}
                                                                                              route={false}
                                                                                              element={_elemenet}/>);
                                                            }
                                                            showMiniDialog(true)
                                                        }
                                                    }}
                                                    options={{
                                                        draggable: false,
                                                        iconColor: invoice.confirmationForwarder?'#ffb300':'#ff0000'
                                                    }}
                                                    properties={{iconCaption: `${idx+1}) ${invoice.address[2] ? `${invoice.address[2]}, ` : ''}${invoice.address[0]}`}}
                                                    geometry={invoice.address[1].split(', ')}/>
                                            )
                                        }
                                    )}
                                </Map>
                            </div>
                            :
                            <div style={{display: load?'none':'block'}}>
                                <Map onLoad={() => {setLoad(false)}} height={window.innerHeight-128} width={window.innerWidth-48} defaultState={{ center: ['42.8700000', '74.5900000'], zoom: 12 }} >
                                    <TrafficControl options={{ float: 'right' }} />
                                    {legs.map((leg, idx) => {
                                        if(!navigation||idx===unacceptedIdx||(unacceptedIdx===-1&&idx===legs.length-1))
                                            return(
                                                <Polyline
                                                    key={`leg${idx}`}
                                                    geometry={leg.map(element=>element.split(', '))}
                                                    options={{
                                                        balloonCloseButton: false,
                                                        strokeColor: '#0F0',
                                                        strokeWidth: 4,
                                                        strokeOpacity: 1,
                                                    }}
                                                />
                                            )
                                    }
                                    )}
                                    {geo?
                                        <Placemark
                                            options={{
                                                draggable: false,
                                                iconColor: 'indigo'
                                            }}
                                            properties={{iconCaption: 'Я'}}
                                            geometry={geo} />
                                        :
                                        null
                                    }
                                    {
                                        !navigation||unacceptedIdx===0||unacceptedIdx===-1?
                                            <Placemark
                                                options={{
                                                    draggable: false,
                                                    iconColor: '#ffb300'
                                                }}
                                                properties={{iconCaption: 'Cклад'}}
                                                geometry={legs[0][0].split(', ')}/>
                                            :
                                            null
                                    }
                                    {_list.map((invoice, idx) => {
                                        if(!navigation||idx===unacceptedIdx||idx===unacceptedIdx-1||(unacceptedIdx===-1&&idx===_list.length-1))
                                            return(
                                                <Placemark
                                                    key={invoice._id}
                                                    options={{
                                                        draggable: false,
                                                        iconColor: invoice.confirmationForwarder?'#ffb300':'#ff0000'
                                                    }}
                                                    onClick={async () => {
                                                        let _elemenet = await getOrder(invoice._id)
                                                        if(_elemenet) {
                                                            if(geo) {
                                                                setMiniDialog('Заказ', <OpenOrderRoute idx={idx}
                                                                                                       _list={_list}
                                                                                                       _setList_={_setList_}
                                                                                                       route={false}
                                                                                                       _elemenet={_elemenet}
                                                                                                       geoMy={geo}
                                                                                                       geoOrder={invoice.address[1].split(', ')}
                                                                />);
                                                            }
                                                            else {
                                                                setMiniDialog('Заказ', <Order idx={idx} list={_list}
                                                                                              setList={_setList_}
                                                                                              route={false}
                                                                                              element={_elemenet}/>);
                                                            }
                                                            showMiniDialog(true)
                                                        }
                                                    }}
                                                    properties={{iconCaption: `${idx+1}) ${invoice.address[2] ? `${invoice.address[2]}, ` : ''}${invoice.address[0]}`}}
                                                    geometry={invoice.address[1].split(', ')}/>
                                            )
                                    }
                                    )}
                                </Map>
                            </div>
                        }
                    </div>
                    <center>
                        <Button variant='contained' color='secondary' onClick={() => {showFullDialog(false);}} className={classes.button}>
                            Закрыть
                        </Button>
                    </center>
                    <Fab color={navigation?'primary':'secondary'} className={classes.fabNavigation} onClick={() =>setNavigation(!navigation)}>
                        <Navigation/>
                    </Fab>
                    <Fab color={follow?'primary':'secondary'} className={classes.fabGeo} onClick={() =>setFollow(!follow)}>
                        <GpsFixed/>
                    </Fab>
                </div>
            </YMaps>
        );
    }
)

function mapStateToProps () {
    return {}
}

function mapDispatchToProps(dispatch) {
    return {
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch)
    }
}

Geo.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(Geo));
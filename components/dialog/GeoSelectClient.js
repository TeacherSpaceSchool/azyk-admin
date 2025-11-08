import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import classifyPoint from 'robust-point-in-polygon'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import { Map, YMaps, Placemark, Polygon, ObjectManager } from 'react-yandex-maps';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Confirmation from './Confirmation'
import Fab from '@material-ui/core/Fab';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import {rowReverseDialog} from '../../src/lib';


const GeoSelectClient =  React.memo(
    (props) =>{
        const {showFullDialog, setMiniDialog, showMiniDialog} = props.mini_dialogActions;
        const {classes, clients, selectClient} = props;
        const {isMobileApp} = props.app;
        let [yellowData, setYellowData] = useState([]);
        let [show, setShow] = useState(false);
        let [geo1, setGeo1] = useState([42.86745, 74.592635]);
        let dragend1 = (e) => {
            let geo = e.get('target').geometry.getCoordinates()
            setGeo1(geo)
        }
        let [geo2, setGeo2] = useState([42.869979, 74.592945]);
        let dragend2 = (e) => {
            let geo = e.get('target').geometry.getCoordinates()
            setGeo2(geo)
        }
        let [geo3, setGeo3] = useState([42.869837, 74.595019]);
        let dragend3 = (e) => {
            let geo = e.get('target').geometry.getCoordinates()
            setGeo3(geo)
        }
        let [geo4, setGeo4] = useState([42.867486, 74.594767]);
        let dragend4 = (e) => {
            let geo = e.get('target').geometry.getCoordinates()
            setGeo4(geo)
        }
        let dragend5 = (e) => {
            let geo = e.get('target').geometry.getCoordinates()
            setGeo1(geo[0][0])
            setGeo2(geo[0][1])
            setGeo3(geo[0][2])
            setGeo4(geo[0][3])
        }
        let [load, setLoad] = useState(true);
        useEffect(() => {
                let _yellowData = []
                let data
                for(let i=0; i<clients.length; i++) {
                    if(clients[i].address[0]&&clients[i].address[0][1]&&clients[i].address[0][1].length) {
                        data = {
                            type: 'Feature',
                            id: clients[i]._id,
                            geometry: {
                                type: 'Point',
                                coordinates: clients[i].address[0][1].split(', ')
                            },
                            properties: {
                                iconColor: 'yellow',
                                iconCaption: `${clients[i].address[0][2] ? `${clients[i].address[0][2]}, ` : ''}${clients[i].address[0][0]}`
                            }
                        }
                        _yellowData.push(data)
                    }
                }
                setYellowData(_yellowData)
        }, [])
        return (
            <YMaps>
                <div className={classes.column}>
                    <div style={{height: window.innerHeight-128, width: window.innerWidth-48, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        {
                            load?<CircularProgress/>:null
                        }
                        <div style={{display: load?'none':'block'}}>
                            <Map onLoad={() => {setLoad(false)}} height={window.innerHeight-128} width={window.innerWidth-48}
                                 defaultState={{ center: [42.8700000, 74.5900000], zoom: 15 }}
                            >
                                {
                                    show?
                                        <ObjectManager
                                            options={{
                                                clusterize: true,
                                                gridSize: 32,
                                            }}
                                            objects={{
                                                openBalloonOnClick: true,
                                                preset: 'islands#yellowDotIcon',
                                            }}
                                            clusters={{
                                                preset: 'islands#yellowClusterIcons',
                                            }}
                                            features={yellowData}
                                        />
                                        :
                                        null
                                }
                                <Polygon
                                    geometry={[[
                                        geo1,
                                        geo2,
                                        geo3,
                                        geo4,
                                    ]]}
                                    options={{
                                        draggable: true,
                                        fillColor: '#ffff0022',
                                        strokeColor: '#000000',
                                        strokeWidth: 3,
                                    }}
                                    onDragEnd={dragend5}
                                />
                                <Placemark
                                    onDragEnd={dragend1}
                                    options={{draggable: true, iconColor: 'indigo'}}
                                    geometry={geo1} />
                                <Placemark
                                    onDragEnd={dragend2}
                                    options={{draggable: true, iconColor: 'indigo'}}
                                    geometry={geo2} />
                                <Placemark
                                    onDragEnd={dragend3}
                                    options={{draggable: true, iconColor: 'indigo'}}
                                    geometry={geo3} />
                                <Placemark
                                    onDragEnd={dragend4}
                                    options={{draggable: true, iconColor: 'indigo'}}
                                    geometry={geo4} />
                            </Map>
                        </div>
                    </div>
                    <div style={rowReverseDialog(isMobileApp)}>
                        <Button variant='contained' color='primary' onClick={async () => {
                            const action = () => {
                                showFullDialog(false);
                                for(let i=0; i<clients.length; i++) {
                                    if(clients[i].address[0]&&clients[i].address[0][1]&&clients[i].address[0][1].length) {
                                        if(classifyPoint([geo1, geo2, geo3, geo4], clients[i].address[0][1].split(', '))===-1) {
                                            selectClient(i)
                                        }
                                    }
                                }
                            }
                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                            showMiniDialog(true)
                        }} className={classes.button}>
                            Принять
                        </Button>
                        <Button variant='contained' color='secondary' onClick={() => {showFullDialog(false);}} className={classes.button}>
                            Закрыть
                        </Button>
                    </div>
                </div>
                <Fab color={show?'primary':'secondary'} className={classes.fabGeo} onClick={() =>setShow(!show)}>
                    {show?<Visibility/>:<VisibilityOff/>}
                </Fab>
            </YMaps>
        );
    }
)

function mapStateToProps (state) {
    return {
        app: state.app
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch)
    }
}

GeoSelectClient.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(GeoSelectClient));
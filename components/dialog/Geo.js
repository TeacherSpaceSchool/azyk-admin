import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import { Map, YMaps, Placemark } from 'react-yandex-maps';
import * as snackbarActions from '../../redux/actions/snackbar'
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Confirmation from './Confirmation'
import Fab from '@material-ui/core/Fab';
import GpsFixed from '@material-ui/icons/GpsFixed';

const Geo =  React.memo(
    (props) =>{
        const {showSnackBar} = props.snackbarActions;
        const {showFullDialog, setMiniDialog, showMiniDialog} = props.mini_dialogActions;
        const {classes, geo, name, idx, setAddressGeo, change} = props;
        let [newGeo, setNewGeo] = useState(geo?geo:'42.8700000, 74.5900000');
        let getGeo = () => {
            if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    setNewGeo(position.coords.latitude+', '+position.coords.longitude)
                });
            } else {
                showSnackBar('Геолокация не поддерживается')
            }
        }
        let dragend = (e) => {
            let geo = e.get('target').geometry.getCoordinates()
            setNewGeo(geo[0]+', '+geo[1])
        }
        let [load, setLoad] = useState(true);
        return (
            <YMaps>
                <div className={classes.column}>
                    <div style={{height: window.innerHeight-128, width: window.innerWidth-48, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        {
                            load?<CircularProgress/>:null
                        }
                        <div style={{display: load?'none':'block'}}>
                            <Map onLoad={() => {setLoad(false)}} height={window.innerHeight-128} width={window.innerWidth-48}
                                 state={{ center: newGeo.split(', '), zoom: 15 }}
                            >
                                <Placemark
                                    onDragEnd={dragend}
                                    options={{draggable: true, iconColor: '#ffb300'}}
                                    properties={{iconCaption: name}}
                                    geometry={newGeo.split(', ')} />
                            </Map>
                        </div>
                    </div>
                    <center>
                        {
                            change?
                                <Button variant='contained' color='primary' onClick={() => {
                                    const action = async () => {
                                        await setAddressGeo(newGeo, idx)
                                        showFullDialog(false);
                                    }
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                }} className={classes.button}>
                                    Принять
                                </Button>
                                :null
                        }
                        <Button variant='contained' color='secondary' onClick={() => {showFullDialog(false);}} className={classes.button}>
                            Закрыть
                        </Button>
                    </center>
                </div>
                {
                    change?
                        <Fab color='primary' className={classes.fabGeo} onClick={getGeo}>
                            <GpsFixed/>
                        </Fab>
                        :null}
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
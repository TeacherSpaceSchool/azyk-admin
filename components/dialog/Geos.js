import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import { Map, YMaps, Placemark } from 'react-yandex-maps';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import {rowReverseDialog} from '../../src/lib';

const Geos =  React.memo(
    (props) =>{
        const {showFullDialog} = props.mini_dialogActions;
        const {classes, geos} = props;
        const {isMobileApp} = props.app;
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
                                 state={{ center: geos[0].geo.split(', '), zoom: 12 }}
                            >
                                {
                                    geos.map((geo, idx) =>
                                        <Placemark
                                            key={`${geo.name}${geo.geo}${idx}`}
                                            options={{iconColor: '#ffb300'}}
                                            properties={{iconCaption: geo.name}}
                                            geometry={geo.geo.split(', ')} />
                                    )
                                }
                            </Map>
                        </div>
                    </div>
                    <div style={rowReverseDialog(isMobileApp)}>
                        <Button variant='contained' color='secondary' onClick={() => {showFullDialog(false);}} className={classes.button}>
                            Закрыть
                        </Button>
                    </div>
                </div>
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

Geos.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(Geos));
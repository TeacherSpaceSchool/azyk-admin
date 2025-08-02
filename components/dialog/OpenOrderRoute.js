import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import Order from './Order';
import Button from '@material-ui/core/Button';

const OpenRoute =  React.memo(
    (props) =>{
        const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
        const {classes, idx, _list, route, _elemenet, _setList_, geoMy, geoOrder} = props;
        const {isMobileApp} = props.app;
        return (
            <div className={classes.column}>
                <center>
                    <Button variant='contained' color='primary' onClick={() => {
                        setMiniDialog('Заказ', <Order idx={idx} list={_list} route={route}
                                                      element={_elemenet} setList={_setList_}/>);
                    }} className={classes.button}>
                        Открыть заказ
                    </Button>
                </center>
                <center>
                    <a href={`${isMobileApp?'dgis':'https'}://2gis.ru/routeSearch/rsType/car/from/${geoMy[1]},${geoMy[0]}/to/${geoOrder[1]},${geoOrder[0]}`} target='_blank'>
                        <Button variant='contained' color='primary' onClick={() => {showMiniDialog(false);}} className={classes.button}>
                            Построить маршрут
                        </Button>
                    </a>
                </center>
                <center>
                    <Button variant='contained' color='secondary' onClick={() => {showMiniDialog(false);}} className={classes.button}>
                        Закрыть
                    </Button>
                </center>
            </div>
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

OpenRoute.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(OpenRoute));
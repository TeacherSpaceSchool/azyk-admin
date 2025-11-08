import React  from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import Order from './Order';
import Button from '@material-ui/core/Button';
import {rowReverseDialog} from '../../src/lib';

const Geo =  React.memo(
    (props) =>{
        const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
        const {classes, invoice, getInvoices, route, geo} = props;
        const {isMobileApp} = props.app;
        return (
            <div className={classes.column}>
                <center>
                    <Button variant='contained' color='primary' onClick={() => {setMiniDialog('Заказ', <Order getInvoices={getInvoices} route={route} element={invoice}/>);}} className={classes.button}>
                        Просмотреть заказ
                    </Button>
                </center>
                <center>
                    <a href={
                        isMobileApp?
                            `dgis://2gis.ru/routeSearch/rsType/car/to/${geo[1]},${geo[0]}`
                            :
                            `https://2gis.kg/bishkek/geo/${geo[1]},${geo[0]}/center/${geo[1]},${geo[0]}/zoom/12`
                    } target='_blank'>
                        <Button variant='contained' color='primary' onClick={() => {showMiniDialog(false);}} className={classes.button}>
                            Построить маршрут
                        </Button>
                    </a>
                </center>
                <div style={rowReverseDialog(isMobileApp)}>
                    <Button variant='contained' color='secondary' onClick={() => {showMiniDialog(false);}} className={classes.button}>
                        Закрыть
                    </Button>
                </div>
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

Geo.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(Geo));
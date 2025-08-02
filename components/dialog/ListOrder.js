import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import Order from './Order';
import Button from '@material-ui/core/Button';
import {getOrder} from '../../src/gql/order'

const ListOrder =  React.memo(
    (props) =>{
        const {showFullDialog, setMiniDialog, showMiniDialog} = props.mini_dialogActions;
        const {classes, invoices, setList} = props;
        let [_list, _setList] = useState(invoices);
        let _setList_ = (list) => {
            setList([...list])
            _setList([...list])
        }

        return (
            <div className={classes.column}>
                {
                    _list.map((element, idx)=>
                        <div key={element._id} className={classes.row}>
                            {idx+1})&nbsp;
                            <div style={{color: element.confirmationForwarder?'#ffb300':'#ff0000', cursor: 'pointer'}} className={classes.value}
                                 onClick={async () => {
                                     let _elemenet = await getOrder(element._id)
                                     if(_elemenet) {
                                         setMiniDialog('Заказ', <Order idx={idx} route={false} element={_elemenet} setList={_setList_}/>);
                                         showMiniDialog(true)
                                     }
                                 }}>
                                {` ${element.address[2] ? `${element.address[2]}, ` : ''}${element.address[0]}`}
                            </div>
                            <br/>
                        </div>
                    )
                }
                <br/>
                <br/>
                <center>
                    <Button variant='contained' color='secondary' onClick={() => {showFullDialog(false);}} className={classes.button}>
                        Закрыть
                    </Button>
                </center>
            </div>
        );
    }
)

function mapStateToProps () {
    return {}
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch)
    }
}

ListOrder.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(ListOrder));
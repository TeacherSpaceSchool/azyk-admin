import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import {checkFloat, checkInt, inputInt, rowReverseDialog} from '../../src/lib'
import {setSettedSummaryAds} from '../../src/gql/logistic';

const SetSettedSummaryAds =  React.memo(
    (props) =>{
        const {classes, idx, list, setList} = props;
        const {isMobileApp, organization, date} = props.app;
        const {showMiniDialog} = props.mini_dialogActions;
        let [count, setCount] = useState('');
        const width = isMobileApp? (window.innerWidth-112) : 500
        let handleCount =  (event) => {
            setCount(inputInt(event.target.value))
        };
        const action = async () => {
            await setSettedSummaryAds({forwarder: list[idx][5], item: list[idx][6], count: checkInt(count), organization, dateDelivery: date});
            setList(list => {
                count = checkInt(count)
                list[idx][3] = checkFloat(count/(checkFloat(list[idx][2])/checkFloat(list[idx][3])))
                list[idx][4] = checkFloat(checkFloat(list[idx][4])/checkFloat(list[idx][2])*count)
                list[idx][2] = count
                return [...list]
            })
            showMiniDialog(false);
        }
        return (
            <div className={classes.main}>
                <TextField
                    style={{width: width}}
                    autoFocus
                    value={count}
                    className={classes.input}
                    onChange={handleCount}
                    onKeyPress={event => {
                        if(event.key === 'Enter') action()
                    }}
                />
                <br/>
                <br/>
                <div style={rowReverseDialog(isMobileApp)}>
                    <Button variant='contained' color='primary' onClick={action} className={classes.button}>
                        Сохранить
                    </Button>
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

SetSettedSummaryAds.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(SetSettedSummaryAds));
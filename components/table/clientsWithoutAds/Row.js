import React from 'react';
import {connect} from 'react-redux';
import {getClientTitle} from '../../../src/lib';
import {bindActionCreators} from 'redux';
import * as snackbarActions from '../../../redux/actions/snackbar';
import CheckCircle from '@material-ui/icons/CheckCircle';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';

const Tables =  React.memo(({element, columns, user, clientsWithoutAds, handleClientWithoutAds}) =>{
    const {profile} = user;
    return <div className='tableRow tablePointer' onClick={() => handleClientWithoutAds(element._id)}>
        <div className='tableCell' style={columns[0].style} >
            {
                clientsWithoutAds.includes(element._id) ?
                    <CheckCircle style={{color: '#ffb300', fontSize: 18.59}}/>
                    :
                    <CheckCircleOutline style={{color: '#00000040', fontSize: 18.59}}/>
            }
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[1].style}>
            {getClientTitle(element)}{['admin', 'суперагент'].includes(profile.role)&&element.city?` (${element.city})`:''}
        </div>
    </div>
})

function mapStateToProps (state) {
    return {
        user: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        snackbarActions: bindActionCreators(snackbarActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tables)


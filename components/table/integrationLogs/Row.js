import React from 'react';
import {pdDDMMYYHHMM} from '../../../src/lib';
import TextViewer from '../../dialog/TextViewer';
import * as mini_dialogActions from '../../../redux/actions/mini_dialog';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

const Tables =  React.memo(({element, columns, mini_dialogActions}) =>{
    const {showFullDialog, setFullDialog} = mini_dialogActions;
    return <div onClick={async () => {
        setFullDialog(element.title, <TextViewer text={element.xml}/>)
        showFullDialog(true)
    }} className='tableRow tablePointer'>
        <div className='tableCell' style={columns[0].style}>
            {pdDDMMYYHHMM(element.createdAt)}<br/>
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[1].style}>
            {element.path}
        </div>
    </div>
})

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
    }
}

export default connect(null, mapDispatchToProps)(Tables)


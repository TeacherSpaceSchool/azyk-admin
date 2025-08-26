import React from 'react';
import {pdDDMMYY} from '../../../src/lib';
import {connect} from 'react-redux';

const Tables =  React.memo(({element, columns, user}) =>{
    const {profile} = user
    return <div className='tableRow tablePointer' onClick={() => window.open(element.video)}>
        <div className='tableCell' style={columns[0].style}>
            {pdDDMMYY(element.createdAt)}<br/>
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[1].style}>
            {element.title}
        </div>
        {profile.role==='admin'?<>
            <div className='tableBorder'/>
            <div className='tableCell' style={columns[2].style}>
                {element.typex}
            </div>
        </>:null}
    </div>
})

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user
    }
}

export default connect(mapStateToProps)(Tables)


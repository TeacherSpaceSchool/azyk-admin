import React from 'react';
import {pdDDMMYY} from '../../../src/lib';

const Tables =  React.memo(({element, columns}) =>{
    return <div className='tableRow'>
        <div className='tableCell' style={columns[0].style}>
            {pdDDMMYY(element.createdAt)}<br/>
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[1].style}>
            {element.district.name}<br/>
            {element.guid}
        </div>
    </div>
})

export default Tables


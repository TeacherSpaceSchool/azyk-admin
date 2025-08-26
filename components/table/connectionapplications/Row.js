import React from 'react';
import {pdDDMMYY} from '../../../src/lib';

const Tables =  React.memo(({element, columns}) =>{
    return <div className='tableRow'>
        <div className='tableCell' style={columns[0].style}>
            {pdDDMMYY(element.createdAt)}<br/>
            <span style={{color: element.taken?'green':'orange'}}>{element.taken?'принят':'обработка'}</span>
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[1].style}>
            {element.phone}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[2].style}>
            {element.name}<br/>
            {element.address}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[3].style}>
            {element.whereKnow}
        </div>
    </div>
})

export default Tables


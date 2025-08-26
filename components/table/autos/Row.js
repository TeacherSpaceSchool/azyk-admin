import React from 'react';
import {pdDDMMYY} from '../../../src/lib';

const Tables =  React.memo(({element, columns}) =>{
    return <div className='tableRow'>
        <div className='tableCell' style={columns[0].style}>
            {pdDDMMYY(element.createdAt)}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[1].style}>
            {element.number}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[2].style}>
            {element.tonnage}<br/>
            {element.employment&&element.employment.name}
        </div>
    </div>
})

export default Tables


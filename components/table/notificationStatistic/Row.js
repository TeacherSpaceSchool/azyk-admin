import React from 'react';
import {pdDDMMYYHHMM} from '../../../src/lib';

const Tables =  React.memo(({element, columns}) =>{
    return <div className='tableRow'>
        <div className='tableCell' style={columns[0].style}>
            {pdDDMMYYHHMM(element.createdAt)}<br/>
            {element.delivered}|{element.click}|{element.failed}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[1].style}>
            {element.title}<br/>
            {element.text}
        </div>
    </div>
})

export default Tables


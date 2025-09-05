import React from 'react';
import {pdDDMMHHMM} from '../../../src/lib';

const Tables =  React.memo(({element, columns}) =>{
    const statusColor = {
        'create': 'orange',
        'del': 'blue',
        'update': 'blue',
        'check': 'green',
        'error': 'red'
    }
    return <div className='tableRow'>
        <div className='tableCell' style={columns[0].style}>
            {pdDDMMHHMM(element.createdAt)}<br/>
            <span style={{color: statusColor[element.status]}}>{element.status}</span>
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[1].style}>
            {element.guid}<br/>
            {element.number}
        </div>
    </div>
})

export default Tables


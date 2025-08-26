import React from 'react';
import {pdDDMMYYHHMM} from '../../../src/lib';

const Tables =  React.memo(({element, columns}) =>{
    return <div className='tableRow tablePointer'>
        <div className='tableCell' style={columns[0].style}>
            {pdDDMMYYHHMM(element.createdAt)}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[1].style}>
            {element.path}<br/>
            {element.err}
        </div>
    </div>
})

export default Tables


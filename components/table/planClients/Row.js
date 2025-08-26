import React from 'react';
import {formatAmount, getClientTitle, pdDDMMYY} from '../../../src/lib';

const Tables =  React.memo(({element, columns}) =>{
    return <div className='tableRow'>
        <div className='tableCell' style={columns[0].style}>
            {pdDDMMYY(element.createdAt)}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[1].style}>
            {formatAmount(element.month)}
            <span style={{marginBottom: 0, color: element.current<element.month?'orange':'green'}}>
                {formatAmount(element.current)}
            </span>
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[2].style}>
            {getClientTitle(element.client)}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[3].style}>
            {formatAmount(element.visit)}
        </div>
    </div>
})

export default Tables


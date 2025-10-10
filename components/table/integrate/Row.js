import React from 'react';
import {pdDDMMYY} from '../../../src/lib';

const Tables =  React.memo(({element, columns}) =>{
    const type = element.agent? 'агент' : element.item? 'товар' : element.client? 'клиент' : 'экспедитор'
    return <div className='tableRow'>
        <div className='tableCell' style={columns[0].style}>
            {pdDDMMYY(element.createdAt)}<br/>
            {type}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[1].style}>
            {element.guid}<br/>
            {element.item&&element.item.name||element.agent&&element.agent.name||element.client&&element.client.name||
                element.forwarder&&element.forwarder.name}
        </div>
    </div>
})

export default Tables


import React from 'react';
import {getClientTitle, pdDDMMYY} from '../../../src/lib';

const Tables =  React.memo(({element, columns}) => {
    const statusColor = {
        'обработка': 'orange',
        'принят': 'blue',
        'выполнен': 'green',
        'отмена': 'red'
    }
    return <div className='tableRow'>
        <div className='tableCell' style={columns[0].style}>
            {element.number}<br/>
            <span style={{color: statusColor[element.status]}}>{element.status}</span>
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[1].style}>
            {pdDDMMYY(element.createdAt)}<br/>
            {element.dateRepair?pdDDMMYY(element.dateRepair):null}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[2].style}>
            {element.equipment}<br/>
            {element.client?getClientTitle(element.client):null}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[3].style}>
            {element.agent?element.agent.name:null}<br/>
            {element.repairMan?element.repairMan.name: null}<br/>
        </div>
    </div>
})

export default Tables


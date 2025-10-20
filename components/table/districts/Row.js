import React from 'react';
import {pdDDMMYY} from '../../../src/lib';
import Link from 'next/link';

const Tables =  React.memo(({element, columns}) =>{
    return <Link href='/district/[id]' as={`/district/${element._id}`}>
        <div className='tableRow tablePointer'>
            <div className='tableCell' style={columns[0].style}>
                {pdDDMMYY(element.createdAt)}<br/>
            </div>
            <div className='tableBorder'/>
            <div className='tableCell' style={columns[1].style}>
                {element.client.length}
            </div>
            <div className='tableBorder'/>
            <div className='tableCell' style={columns[2].style}>
                {element.name}<br/>
                {element.agent&&element.agent.name}
            </div>
            <div className='tableBorder'/>
            <div className='tableCell' style={columns[3].style}>
                {element.manager&&element.manager.name}<br/>
                {element.forwarder&&element.forwarder.name}
            </div>
        </div>
    </Link>
})

export default Tables


import React from 'react';
import {pdDDMMYY} from '../../../src/lib';
import Link from 'next/link';

const Tables =  React.memo(({element, columns}) =>{
    return <Link href='/agentroute/[id]' as={`/agentroute/${element?element._id:'new'}`}>
        <div className='tableRow tablePointer'>
            <div className='tableCell' style={columns[0].style}>
                {pdDDMMYY(element.createdAt)}
            </div>
            <div className='tableBorder'/>
            <div className='tableCell' style={columns[1].style}>
                {element.district.name}<br/>
                {element.district.agent.name}
            </div>
        </div>
    </Link>
})

export default Tables


import React from 'react';
import {getClientTitle, pdDDMMHHMM, pdDDMMYY} from '../../../src/lib';
import Link from 'next/link';

const Tables =  React.memo(({element, columns}) =>{
    return <Link href='/fhoclient/[id]' as={`/fhoclient/${element._id}`}>
        <div className='tableRow tablePointer'>
            <div className='tableCell' style={columns[0].style}>
                {pdDDMMYY(element.createdAt)}
            </div>
            <div className='tableBorder'/>
            <div className='tableCell' style={{...columns[1].style, ...!element.images.length?{color: 'red'}:{}}}>
                {element.images.length}
            </div>
            <div className='tableBorder'/>
            <div className='tableCell' style={columns[2].style}>
                {getClientTitle(element.client)}
            </div>
            <div className='tableBorder'/>
            <div className='tableCell' style={columns[3].style}>
                {element.history[0]?`${pdDDMMHHMM(element.history[0].date)} ${element.history[0].editor}`:''}
            </div>
        </div>
    </Link>
})

export default Tables


import React from 'react';
import {pdDDMMYY} from '../../../src/lib';
import Link from 'next/link';

const Tables =  React.memo(({element, columns}) =>{
    return <Link href='/employment/[id]' as={`/employment/${element._id}`}>
        <div className='tableRow tablePointer'>
            <div className='tableCell' style={columns[0].style}>
                {pdDDMMYY(element.createdAt)}<br/>
                <span style={{color: element.user.status==='active'?'green':'red'}}>
                    {element.user.status==='active'?'Активный':'Неактивный'}
                </span>
            </div>
            <div className='tableBorder'/>
            <div className='tableCell' style={columns[1].style}>
                {element.user.role}
            </div>
            <div className='tableBorder'/>
            <div className='tableCell' style={columns[2].style}>
                {element.name}
            </div>
        </div>
    </Link>
})

export default Tables


import React from 'react';
import {pdDDMMYY} from '../../../src/lib';
import Link from 'next/link';

const Tables =  React.memo(({element, path, columns}) =>{
    return <Link href={`/${path}/[id]`} as={`/${path}/${element._id}`}>
        <div className='tableRow tablePointer'>
            <div className='tableCell' style={columns[0].style}>
                {element.createdAt?<>{pdDDMMYY(element.createdAt)}<br/></>:null}
                {element.status?<span style={{color: element.status==='active'?'green':'red'}}>
                    {element.status==='active'?'Активный':'Неактивный'}
                </span>:null}
            </div>
            <div className='tableBorder'/>
            <div className='tableCell' style={columns[1].style}>
                {element.name}<br/>
                {element.miniInfo}
            </div>
        </div>
    </Link>
})

export default Tables


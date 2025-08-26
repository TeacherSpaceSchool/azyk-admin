import React, {useMemo} from 'react';
import {getClientTitle, pdDDMMYYHHMM} from '../../../src/lib';
import Link from 'next/link';

const Tables =  React.memo(({element, columns}) =>{
    let differenceDate = useMemo(() => (new Date() - new Date(element.date))/(1000 * 60 * 60 * 24), []);
    return <Link href='/merchandising/[id]' as={`/merchandising/${element._id}`}>
        <div className='tableRow tablePointer'>
            <div className='tableCell' style={columns[0].style}>
                <span style={{color: differenceDate<7?'green':differenceDate<31?'orange':'red'}}>{pdDDMMYYHHMM(element.date)}</span>
                <span style={{color: element.check?'green':'orange'}}>{element.check?'принят':'обработка'}</span>
            </div>
            <div className='tableBorder'/>
            <div className='tableCell' style={columns[1].style}>
                {element.type}
            </div>
            <div className='tableBorder'/>
            <div className='tableCell' style={columns[2].style}>
                {getClientTitle(element.client)}
            </div>
        </div>
    </Link>
})

export default Tables


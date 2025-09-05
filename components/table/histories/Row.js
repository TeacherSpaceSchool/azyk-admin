import React from 'react';
import {pdDDMMYYHHMM} from '../../../src/lib';
import {useRouter} from 'next/router';

const historyTypes = {
    0: 'create',
    1: 'set',
    2: 'delete'
}

const Tables =  React.memo(({element, columns}) =>{
    const router = useRouter();
    return <div className='tableRow'>
        <div className='tableCell' style={columns[0].style}>
            {pdDDMMYYHHMM(element.createdAt)}<br/>
            {historyTypes[element.type]}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[1].style}>
            {element.model}<br/>
            {element.object?<>{element.object}<br/></>:null}
            {element.name}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[2].style}>
            {element.data}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={{...columns[3].style, ...element.employment||element.client?{color: '#ffb300', cursor: 'pointer'}:{}}} onClick={() => {
            if(element.employment||element.client)
                router.push(`/${element.employment?'employments':'clients'}/${(element.employment||element.client)._id}`)
        }}>
            {element.user.role} {element.employment?element.employment.name:element.client?element.client.name:''}
        </div>
    </div>
})

export default Tables


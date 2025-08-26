import React from 'react';
import {connect} from 'react-redux';
import {pdDDMMYY} from '../../../src/lib';
import Link from 'next/link';

const Tables =  React.memo(({element, columns, user}) =>{
    const {profile} = user
    return <Link href={`/${profile.role==='client'?'catalog':'item'}/[id]`} as={`/${profile.role==='client'?'catalog':'item'}/${profile.role==='client'?element.organization:element._id}`}>
        <div className='tableRow tablePointer'>
            <div className='tableCell' style={columns[0].style}>
                {pdDDMMYY(element.createdAt)}<br/>
                <span style={{color: element.status==='active'?'green':'red'}}>
                    {element.status==='active'?'Активный':'Неактивный'}
                </span>
            </div>
            <div className='tableBorder'/>
            <div className='tableCell' style={columns[1].style}>
                {element.price}
            </div>
            <div className='tableBorder'/>
            <div className='tableCell' style={columns[2].style}>
                {element.name}
            </div>
        </div>
    </Link>
})

function mapStateToProps (state) {
    return {
        user: state.user,
    }
}

export default connect(mapStateToProps)(Tables)


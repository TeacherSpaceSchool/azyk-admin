import React from 'react';
import {connect} from 'react-redux';
import {getClientTitle, pdDDMMYYHHMM} from '../../../src/lib';
import Link from 'next/link';
import Button from '@material-ui/core/Button';

const Tables =  React.memo(({element, columns, user, buy}) =>{
    const {profile} = user;
    return <Link href='/client/[id]' as={`/client/${element._id}`}>
        <div className='tableRow tablePointer'>
            <div className='tableCell' style={columns[0].style}>
                {pdDDMMYYHHMM(element.createdAt)}<br/>
                <span style={{color: element.user.status==='active'?'green':'red'}}>
                    {element.user.status==='active'?'Активный':'Неактивный'}
                </span>
            </div>
            <div className='tableBorder'/>
            <div className='tableCell' style={{...columns[1].style, ...!element.address[0][1]?{color: 'red'}:{}}}>
                {element.name!==element.address[0][2]?<>{element.name}<br/></>:null}
                {getClientTitle(element)}{['admin', 'суперагент'].includes(profile.role)&&element.city?` (${element.city})`:''}
            </div>
            {['агент', 'суперагент'].includes(profile.role)&&buy?<>
                <div className='tableBorder'/>
                <div className='tableCell' style={columns[2].style}>
                    <Link href={{pathname: '/catalog', query: { client: element._id }}}>
                        <Button size='small' color='primary'>
                            Купить
                        </Button>
                    </Link>
                </div>
            </>:null}
        </div>
    </Link>
})

function mapStateToProps (state) {
    return {
        user: state.user,
    }
}

export default connect(mapStateToProps)(Tables)


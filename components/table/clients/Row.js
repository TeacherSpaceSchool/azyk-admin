import React from 'react';
import {connect} from 'react-redux';
import {getClientTitle, getGeoDistance, pdDDMMYY, unawaited} from '../../../src/lib';
import Link from 'next/link';
import Button from '@material-ui/core/Button';
import {addAgentHistoryGeo} from '../../../src/gql/agentHistoryGeo';
import Router from 'next/router';
import {bindActionCreators} from 'redux';
import * as snackbarActions from '../../../redux/actions/snackbar';

const Tables =  React.memo(({element, columns, user, buy, snackbarActions}) =>{
    const {profile} = user;
    const {showSnackBar} = snackbarActions;
    return <Link href='/client/[id]' as={`/client/${element._id}`}>
        <div className='tableRow tablePointer'>
            <div className='tableCell' style={columns[0].style}>
                {pdDDMMYY(element.createdAt)}<br/>
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
                    {/*<Button onClick={async () => {
                        if(navigator.geolocation&&element.address[0][1].includes(', ')) {
                            navigator.geolocation.getCurrentPosition(async(position) => {
                                let distance = getGeoDistance(position.coords.latitude, position.coords.longitude, ...(element.address[0][1].split(', ')))
                                if(distance<1000) {
                                    unawaited(() => addAgentHistoryGeo({client: element._id, geo: `${position.coords.latitude}, ${position.coords.longitude}`}))
                                    //window.open(`/catalog?client=${element._id}`, '_blank');
                                    Router.push(`/catalog?client=${element._id}`)
                                }
                                else
                                    showSnackBar('Вы слишком далеко')
                            });
                        } else {
                            showSnackBar('Геолокация не поддерживается')
                        }
                    }} size='small' color='primary'>
                        Посетил
                    </Button>*/}
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

function mapDispatchToProps(dispatch) {
    return {
        snackbarActions: bindActionCreators(snackbarActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tables)


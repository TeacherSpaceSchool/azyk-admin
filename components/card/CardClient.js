import React, { useState } from 'react';
import Card from '@material-ui/core/Card';
import cardOrganizationStyle from '../../src/styleMUI/client/cardClient'
import { connect } from 'react-redux'
import Link from 'next/link';
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import { onoffClient, deleteClient } from '../../src/gql/client'
import {getClientTitle, pdDDMMYYHHMM, unawaited} from '../../src/lib'
import NotificationsActive from '@material-ui/icons/NotificationsActive';
import NotificationsOff from '@material-ui/icons/NotificationsOff';
import Confirmation from '../../components/dialog/Confirmation'
import * as snackbarActions from '../../redux/actions/snackbar'
import { addAgentHistoryGeo } from '../../src/gql/agentHistoryGeo'
import {getGeoDistance} from '../../src/lib'
import Router from 'next/router'
import {viewModes} from '../../src/enum';

const CardOrganization = React.memo((props) => {
    const classes = cardOrganizationStyle();
    const {element, setList, idx, buy, style} = props;
    const {isMobileApp, viewMode} = props.app;
    const {profile} = props.user;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    let [status, setStatus] = useState(element.user?element.user.status:'');
    const {showSnackBar} = props.snackbarActions;
    return (
        <Card className={isMobileApp?classes.cardM:classes.cardD} style={{...style||{}, ...viewMode === viewModes.card ? {} : {margin: 1}}}>
                    <div className={classes.line} style={{margin: viewMode===viewModes.card?10:5, ...buy||setList?{marginBottom: 0}:{}}}>
                        {
                            viewMode===viewModes.card&&profile.role==='admin'?
                                element.notification?
                                    <NotificationsActive color='primary' className={classes.notification}/>
                                    :
                                    <NotificationsOff color='secondary' className={classes.notification}/>
                                :
                                null
                        }
                        {viewMode===viewModes.card?<Link href='/client/[id]' as={`/client/${element._id}`}>
                            <a>
                                <img style={{cursor: 'pointer'}}
                                    className={classes.media}
                                    src={element.image?element.image:'/static/add.png'}
                                    alt={element.name}
                                    loading='lazy'
                                />
                            </a>
                        </Link>:null}
                        <Link href='/client/[id]' as={`/client/${element._id}`}>
                            <div style={{cursor: 'pointer', width: viewMode===viewModes.card?'calc(100% - 70px)':'100%'}}>
                                {element.name!==element.address[0][2]?<div className={classes.row}>
                                    <div className={classes.nameField} style={
                                        !(profile.role==='admin'&&viewMode===viewModes.card)?{marginBottom: 5}:{}
                                    }>
                                        Имя:&nbsp;
                                    </div>
                                    <div className={classes.value} style={
                                        !(profile.role==='admin'&&viewMode===viewModes.card)?{marginBottom: 5}:{}
                                    }>
                                        {element.name}
                                    </div>
                                </div>:null}
                                <div className={classes.row}>
                                    {profile.role==='admin'&&viewMode===viewModes.card||element.name!==element.address[0][2]?<div className={classes.nameField} style={
                                        !(profile.role==='admin'&&viewMode===viewModes.card)?{marginBottom: 0}:{}
                                    }>
                                        Адрес:&nbsp;
                                    </div>:null}
                                    <div style={{
                                        ...!(profile.role==='admin'&&viewMode===viewModes.card)?{marginBottom: 0, width: '100%'}:{},
                                        color: element.address[0][1]?'rgba(0, 0, 0, 0.87)':'red'
                                    }} className={classes.value}>
                                        {getClientTitle({address: element.address})}{['admin', 'суперагент'].includes(profile.role)&&element.city?` (${element.city})`:''}
                                    </div>
                                </div>
                                {viewMode===viewModes.card&&profile.role==='admin'?
                                    <>
                                        <div className={classes.row}>
                                            <div className={classes.nameField}>
                                                Регистрация:&nbsp;
                                            </div>
                                            <div className={classes.value}>
                                                {pdDDMMYYHHMM(new Date(element.createdAt))}
                                            </div>
                                        </div>
                                        {element.lastActive?<div className={classes.row}>
                                            <div className={classes.nameField}>
                                                Активность:&nbsp;
                                            </div>
                                            <div className={classes.value}>
                                                {pdDDMMYYHHMM(new Date(element.lastActive))}
                                            </div>
                                        </div>:null}
                                    </>
                                    :
                                    null
                                }
                            </div>
                        </Link>
                    </div>
            {buy||setList?
                <div style={{marginLeft: 5, marginRight: 5, marginBottom: 5, ...isMobileApp?{display: 'flex', flexDirection: 'row-reverse'}:{}}}>
                {
                    ['агент', 'суперагент'].includes(profile.role)&&buy ?
                        <>
                            <Link href={{pathname: '/catalog', query: { client: element._id }}}>
                                <Button /*onClick={async () => {
                                window.open(`/catalog?client=${element._id}`, '_blank');
                            }}*/ size='small' color='primary'>
                                    Купить
                                </Button>
                            </Link>
                            <Button onClick={async () => {
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
                            </Button>
                        </>
                        :
                        null
                }
                {
                    setList&&element.del!=='deleted'&&element.user&&['admin', 'суперагент', 'агент', 'суперорганизация', 'организация'].includes(profile.role) ?
                        <Button onClick={async () => {
                            const action = async () => {
                                await onoffClient(element._id)
                                setStatus(status === 'active' ? 'deactive' : 'active')
                            }
                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                            showMiniDialog(true)
                        }} size='small' color={status==='active'?'primary':'secondary'}>
                            {status==='active'?'Активный':'Неактивный'}
                        </Button>
                        :
                        null
                }
                {
                    element.del!=='deleted'&&profile.role==='admin'&&setList ?
                        <Button onClick={async () => {
                            const action = async () => {
                                await deleteClient(element._id)
                                setList(list => {
                                    list.splice(idx, 1)
                                    return [...list]
                                })
                            }
                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                            showMiniDialog(true)
                        }} size='small' color='secondary'>
                            Удалить
                        </Button>
                        :
                        null
                }
            </div>:null}
            </Card>
    );
})

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardOrganization)
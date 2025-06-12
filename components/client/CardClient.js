import React, { useState } from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import cardOrganizationStyle from '../../src/styleMUI/client/cardClient'
import { connect } from 'react-redux'
import Link from 'next/link';
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import { onoffClient, deleteClient, restoreClient } from '../../src/gql/client'
import { pdDDMMYYHHMM } from '../../src/lib'
import CardActions from '@material-ui/core/CardActions';
import NotificationsActive from '@material-ui/icons/NotificationsActive';
import NotificationsOff from '@material-ui/icons/NotificationsOff';
import Confirmation from '../../components/dialog/Confirmation'
import * as snackbarActions from '../../redux/actions/snackbar'
import { addAgentHistoryGeo } from '../../src/gql/agentHistoryGeo'
import {getGeoDistance} from '../../src/lib'
import Router, {useRouter} from 'next/router'

const CardOrganization = React.memo((props) => {
    const classes = cardOrganizationStyle();
    const router = useRouter();
    const { element, setList, idx, list, buy } = props;
    const { isMobileApp } = props.app;
    const { profile } = props.user;
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    let [status, setStatus] = useState(element.user?element.user.status:'');
    const { showSnackBar } = props.snackbarActions;
    return (
        <Card className={isMobileApp?classes.cardM:classes.cardD}>
               <CardActionArea>
                    <CardContent className={classes.line}>
                        {
                            profile.role==='admin'?
                                element.notification?
                                    <NotificationsActive color='primary' className={classes.notification}/>
                                    :
                                    <NotificationsOff color='secondary' className={classes.notification}/>
                                :
                                null
                        }
                        <Link href='/client/[id]' as={`/client/${element._id}`}>
                            <a>
                                <img
                                    className={classes.media}
                                    src={element.image?element.image:'/static/add.png'}
                                    alt={element.name}
                                />
                            </a>
                        </Link>
                        <Link href='/client/[id]' as={`/client/${element._id}`}>
                        <div style={{width: 'calc(100% - 70px)'}}>
                            <div className={classes.row}>
                                <div className={classes.nameField}>
                                    Имя:&nbsp;
                                </div>
                                <div className={classes.value}>
                                    {element.name}
                                </div>
                            </div>
                            <div className={classes.row}>
                                <div className={classes.nameField}>
                                    Категория:&nbsp;
                                </div>
                                <div className={classes.value}>
                                    {element.category}
                                </div>
                            </div>
                            {element.phone?
                                <div className={classes.row}>
                                    <div className={classes.nameField}>
                                        Телефон:&nbsp;
                                    </div>
                                    <div>
                                        {element.phone.map((phone, idx)=>
                                            idx<4?
                                                <div key={`phone${idx}`} className={classes.value}>
                                                    {phone}
                                                </div>
                                                :
                                                idx===4?
                                                    '...'
                                                    :
                                                    null
                                        )}
                                    </div>
                                </div>
                                :
                                null
                            }
                            <div className={classes.row}>
                                <div className={classes.nameField}>
                                    Город:&nbsp;
                                </div>
                                <div className={classes.value}>
                                    {element.city}
                                </div>
                            </div>
                            <div className={classes.row}>
                                <div className={classes.nameField}>
                                    Адрес:&nbsp;
                                </div>
                                <div>
                                    {element.address.map((addres, idx)=>
                                        idx<4?
                                            <div style={{color: addres[1]?'rgba(0, 0, 0, 0.87)':'red'}} key={`addres${idx}`} className={classes.value}>
                                                {`${addres[2]?`${addres[2]}, `:''}${addres[0]}`}
                                            </div>
                                            :
                                            idx===4?
                                                '...'
                                                :
                                                null
                                    )}
                                </div>
                            </div>
                            {profile.role==='admin'?
                                <div className={classes.row}>
                                    <div className={classes.nameField}>
                                        Регистрация:&nbsp;
                                    </div>
                                    <div className={classes.value}>
                                        {pdDDMMYYHHMM(new Date(element.createdAt))}
                                    </div>
                                </div>
                                :
                                null
                            }
                            {profile.role==='admin'&&element.updatedAt?
                                <div className={classes.row}>
                                    <div className={classes.nameField}>
                                        Изменен:&nbsp;
                                    </div>
                                    <div className={classes.value}>
                                        {pdDDMMYYHHMM(new Date(element.updatedAt))}
                                    </div>
                                </div>
                                :
                                null
                            }
                            {
                                profile.role==='admin'&&element.lastActive?
                                    <div className={classes.row}>
                                        <div className={classes.nameField}>
                                            Активность:&nbsp;
                                        </div>
                                        <div className={classes.value}>
                                            {pdDDMMYYHHMM(new Date(element.lastActive))}
                                        </div>
                                    </div>
                                    :
                                    null
                            }
                            {
                                profile.role==='admin'&&element.device?
                                    <div className={classes.row}>
                                        <div className={classes.value}>
                                            {element.device}
                                        </div>
                                    </div>
                                    :
                                    null
                            }
                        </div>
                        </Link>
                    </CardContent>
            </CardActionArea>
            <CardActions style={isMobileApp?{flexDirection: 'row-reverse'}:{}}>
                {
                    ['агент', 'суперагент'].includes(profile.role)&&buy ?
                        <>
                        <Link href={{pathname: '/catalog', query: { client: element._id }}}>
                            <Button /*onClick={async()=>{
                                window.open(`/catalog?client=${element._id}`, '_blank');
                            }}*/ size='small' color='primary'>
                                Купить
                            </Button>
                        </Link>
                        <Button onClick={async()=>{
                            const action = () => {
                                if (navigator.geolocation&&element.address[0][1].includes(', ')) {
                                    navigator.geolocation.getCurrentPosition(async(position)=>{
                                        let distance = getGeoDistance(position.coords.latitude, position.coords.longitude, ...(element.address[0][1].split(', ')))
                                        if(distance<1000){
                                            await addAgentHistoryGeo({client: element._id, geo: `${position.coords.latitude}, ${position.coords.longitude}`})
                                            //window.open(`/catalog?client=${element._id}`, '_blank');
                                            Router.push(`/catalog?client=${element._id}`)
                                        }
                                        else
                                            showSnackBar('Вы слишком далеко')
                                    });
                                } else {
                                    showSnackBar('Геолокация не поддерживается')
                                }
                            }
                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                            showMiniDialog(true)
                        }} size='small' color='primary'>
                            Посетил
                        </Button>
                        </>
                        :
                        null
                }
                {
                    list&&element.del!=='deleted'&&element.user&&['admin', 'суперагент', 'агент', 'суперорганизация', 'организация'].includes(profile.role) ?
                        <Button onClick={async()=>{
                            const action = async () => {
                                await onoffClient([element._id])
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
                    element.del!=='deleted'&&profile.role==='admin'&&list ?
                        <Button onClick={async()=>{
                            const action = async() => {
                                await deleteClient([element._id])
                                let _list = [...list]
                                _list.splice(idx, 1)
                                setList(_list)
                            }
                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                            showMiniDialog(true)
                        }} size='small' color='secondary'>
                            Удалить
                        </Button>
                        :
                        null
                }
                {
                    profile.role==='admin'&&list&&element.del==='deleted' ?
                        <Button onClick={async()=>{
                            const action = async() => {
                                await restoreClient([element._id])
                                let _list = [...list]
                                _list.splice(idx, 1)
                                setList(_list)
                            }
                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                            showMiniDialog(true)
                        }} size='small' color='primary'>
                            Восстановить
                        </Button>
                        :
                        null
                }
            </CardActions>
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
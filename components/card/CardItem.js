import React, {useState} from 'react';
import Card from '@material-ui/core/Card';
import cardItemStyle from '../../src/styleMUI/item/cardItem'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import Link from 'next/link';
import { onoffItem, deleteItem } from '../../src/gql/items'
import Button from '@material-ui/core/Button';
import Confirmation from '../dialog/Confirmation'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { setItem } from '../../src/gql/items'
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import {checkFloat, inputFloat, checkInt, inputInt, formatAmount} from '../../src/lib'

const CardItem = React.memo((props) => {
    const classes = cardItemStyle();
    const {element, setList, idx, short} = props;
    const {isMobileApp} = props.app;
    const {profile} = props.user;
    let [status, setStatus] = useState(element?element.status:'');
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    let [hit, setHit] = useState(element.hit);
    let [latest, setLatest] = useState(element.latest);
    let [apiece, setApiece] = useState(element.apiece);
    let [price, setPrice] = useState(element.price);
    let [priotiry, setPriotiry] = useState(element.priotiry);
    return (
        <Card className={classes.card} style={{margin: short?2.5:10}}>
            <div className={classes.column} style={{margin: short?5:'16px 16px 24px 16px'}}>
                <div className={classes.chipList}>{
                    setList?element.del!=='deleted'&&profile.role==='admin'?
                        <>
                            <FormControlLabel
                                style={{zoom: 0.75, background: 'rgba(229, 229, 229, 0.3)'}}
                                labelPlacement = 'bottom'
                                control={
                                    <Switch
                                        checked={hit}
                                        onChange={async () => {
                                            await setItem({_id: element._id, hit: !hit})
                                            setHit(!hit)
                                        }}
                                        color='primary'
                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                    />
                                }
                                label='Популярное'
                            />
                            <FormControlLabel
                                style={{zoom: 0.75, background: 'rgba(229, 229, 229, 0.3)'}}
                                labelPlacement = 'bottom'
                                control={
                                    <Switch
                                        checked={latest}
                                        onChange={async () => {
                                            await setItem({_id: element._id, latest: !latest})
                                            setLatest(!latest)
                                        }}
                                        color='primary'
                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                    />
                                }
                                label='Новинка'
                            />
                            <FormControlLabel
                                style={{zoom: 0.75, background: 'rgba(229, 229, 229, 0.3)'}}
                                labelPlacement = 'bottom'
                                control={
                                    <Switch
                                        checked={apiece}
                                        onChange={async () => {
                                            await setItem({_id: element._id, apiece: !apiece})
                                            setApiece(!apiece)
                                        }}
                                        color='primary'
                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                    />
                                }
                                label='Поштучно'
                            />
                        </>
                        :
                        <>
                            {
                                element.latest?
                                    <div className={classes.chip} style={{color: 'white',background: 'green'}}>
                                        Новинка
                                    </div>
                                    :null
                            }
                            {
                                element.hit?
                                    <div className={classes.chip} style={{color: 'black',background: 'yellow'}}>
                                        Хит
                                    </div>
                                    :null
                            }
                        </>
                        :null
                }
                </div>
                {!short?<Link href={`/${profile.role==='client'?'catalog':'item'}/[id]`} as={`/${profile.role==='client'?'catalog':'item'}/${profile.role==='client'?element.organization:element._id}`}>
                    <a>
                        <img
                            className={classes.media}
                            src={element.image}
                            alt={element.name}
                            loading='lazy'
                        />
                    </a>
                </Link>:null}
                <Link href={`/${profile.role==='client'?'catalog':'item'}/[id]`} as={`/${profile.role==='client'?'catalog':'item'}/${profile.role==='client'?element.organization:element._id}`}>
                    <a className={classes.name} style={!setList?{height: 'auto', marginBottom: element.subBrand?5:0}:{}}>
                        {element.name}
                    </a>
                </Link>
                {
                    element.subBrand?<div>
                        {element.subBrand.name}
                    </div>:null
                }
                {setList?['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                    <>
                        <FormControl className={classes.input}>
                                    <InputLabel htmlFor={`adornment-price${element._id}`}>Цена</InputLabel>
                                    <Input
                                        id={`adornment-price${element._id}`}
                                        type={ isMobileApp?'number':'text'}
                                        value={price}
                                        onChange={(event) => {setPrice(inputFloat(event.target.value))}}
                                        endAdornment={
                                            price!=element.price?
                                                <InputAdornment position='end'>
                                                    <Button variant='text' size='small' color='primary' onClick={async () => {
                                                        price = checkFloat(price)
                                                        if(price>0) {
                                                            await setItem({_id: element._id, price})
                                                        }
                                                        setList(list => {
                                                            list[idx].price = price
                                                            return [...list]
                                                        })
                                                    }}>
                                                        Сохранить
                                                    </Button>
                                                </InputAdornment>
                                                :
                                                null
                                        }
                                    />
                                </FormControl>
                        <div style={{height: 10}}/>
                        <FormControl className={classes.input}>
                                    <InputLabel htmlFor={`adornment-priotiry${element._id}`}>Приоритет</InputLabel>
                                    <Input
                                        id={`adornment-priotiry${element._id}`}
                                        type={ isMobileApp?'number':'text'}
                                        value={priotiry}
                                        onChange={(event) => {setPriotiry(inputInt(event.target.value))}}
                                        endAdornment={
                                            priotiry!=element.priotiry?
                                                <InputAdornment position='end'>
                                                    <Button variant='text' size='small' color='primary' onClick={async () => {
                                                        priotiry = checkInt(priotiry)
                                                        await setItem({_id: element._id, priotiry})
                                                        setList(list => {
                                                            list[idx].priotiry = priotiry
                                                            list = list.sort((a, b) =>  b.priotiry - a.priotiry);
                                                            return [...list]
                                                        })
                                                    }}>
                                                        Сохранить
                                                    </Button>
                                                </InputAdornment>
                                                :
                                                null
                                        }
                                    />
                                </FormControl>
                        <div style={{height: 10}}/>
                    </>
                    :
                    <Link href={`/${profile.role==='client'?'catalog':'item'}/[id]`} as={`/${profile.role==='client'?'catalog':'item'}/${profile.role==='client'?element.organization:element._id}`}>
                        <div className={classes.row}>
                            <div className={classes.price}>
                                {formatAmount(element.price)} сом
                            </div>
                        </div>
                    </Link>
                    :null
                }
                {setList&&['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                    element.del!=='deleted'?
                        <div style={{display: 'flex', width: '100%', justifyContent: 'space-between', ...isMobileApp?{flexDirection: 'row-reverse'}:{}}}>
                            <Button onClick={async () => {
                                const action = async () => {
                                    await onoffItem(element._id)
                                    setStatus(status==='active'?'deactive':'active')
                                }
                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                showMiniDialog(true)
                            }} size='small' color={status==='active'?'primary':'secondary'}>
                                {status==='active'?'Отключить':'Включить'}
                            </Button>
                            <Button onClick={async () => {
                                const action = async () => {
                                    await deleteItem(element._id)
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
                        </div>
                        :
                        null
                    :
                    null
                }
            </div>
        </Card>
    );
})

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardItem)
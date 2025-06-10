import React, {useState} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cardItemStyle from '../../src/styleMUI/item/cardItem'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import Link from 'next/link';
import { onoffItem, deleteItem, restoreItem } from '../../src/gql/items'
import Button from '@material-ui/core/Button';
import Confirmation from '../dialog/Confirmation'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { setItem } from '../../src/gql/items'
import Done from '@material-ui/icons/Done';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import { checkFloat, inputFloat, checkInt, inputInt } from '../../src/lib'

const CardItem = React.memo((props) => {
    const classes = cardItemStyle();
    const { element, setList, idx } = props;
    let { list } = props;
    const { isMobileApp } = props.app;
    const { profile } = props.user;
    let [status, setStatus] = useState(element!==undefined?element.status:'');
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    let [hit, setHit] = useState(element.hit);
    let [latest, setLatest] = useState(element.latest);
    let [apiece, setApiece] = useState(element.apiece);
    let [price, setPrice] = useState(element.price);
    let [priotiry, setPriotiry] = useState(element.priotiry);
    return (
        <Card className={classes.card}>
            <CardContent className={classes.column}>
                <div className={classes.chipList}>{
                    element.del!=='deleted'&&profile.role==='admin'?
                        <>
                            <FormControlLabel
                                style={{zoom: 0.75, background: 'rgba(229, 229, 229, 0.3)'}}
                                labelPlacement = 'bottom'
                                control={
                                    <Switch
                                        checked={hit}
                                        onChange={async ()=>{
                                            let _hit = !hit
                                            await setItem({_id: element._id, hit: _hit})
                                            setHit(_hit)
                                        }}
                                        color="primary"
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
                                        onChange={async()=>{
                                            let _latest = !latest
                                            await setItem({_id: element._id, latest: _latest})
                                            setLatest(_latest)
                                        }}
                                        color="primary"
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
                                        onChange={async ()=>{
                                            let _apiece = !apiece
                                            await setItem({_id: element._id, apiece: _apiece})
                                            setApiece(_apiece)
                                        }}
                                        color="primary"
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
                }
                </div>
                <Link href={`/${profile.role==='client'?'catalog':'item'}/[id]`} as={`/${profile.role==='client'?'catalog':'item'}/${profile.role==='client'?element.organization._id:element._id}`}>
                    <a>
                        <img
                            className={classes.media}
                            src={element.image}
                            alt={element.name}
                        />
                    </a>
                </Link>
                <Link href={`/${profile.role==='client'?'catalog':'item'}/[id]`} as={`/${profile.role==='client'?'catalog':'item'}/${profile.role==='client'?element.organization._id:element._id}`}>
                    <a className={classes.name}>
                        {element.name}
                    </a>
                </Link>
                {'admin' === profile.role || (['суперорганизация', 'организация'].includes(profile.role) && profile.organization === element.organization._id) ?
                    <>
                    <div className={classes.row}>
                        <FormControl className={classes.input}>
                            <InputLabel htmlFor={`adornment-price${element._id}`}>Цена</InputLabel>
                            <Input
                                id={`adornment-price${element._id}`}
                                type={ isMobileApp?'number':'text'}
                                value={price}
                                onChange={(event)=>{setPrice(inputFloat(event.target.value))}}
                                endAdornment={
                                    price!=element.price?
                                        <InputAdornment position='end'>
                                            <IconButton aria-label='Задать цену' onClick={async ()=>{
                                                price = checkFloat(price)
                                                if(price>0) {
                                                    await setItem({_id: element._id, price})
                                                    list[idx].price = price
                                                    setList([...list])
                                                }
                                            }}>
                                                <Done />
                                            </IconButton>
                                        </InputAdornment>
                                        :
                                        null
                                }
                            />
                        </FormControl>
                        &nbsp;&nbsp;
                        <FormControl className={classes.input}>
                            <InputLabel htmlFor={`adornment-priotiry${element._id}`}>Приоритет</InputLabel>
                            <Input
                                id={`adornment-priotiry${element._id}`}
                                type={ isMobileApp?'number':'text'}
                                value={priotiry}
                                onChange={(event)=>{setPriotiry(inputInt(event.target.value))}}
                                endAdornment={
                                    priotiry!=element.priotiry?
                                        <InputAdornment position='end'>
                                            <IconButton aria-label='Задать цену' onClick={async ()=>{
                                                priotiry = checkInt(priotiry)
                                                await setItem({_id: element._id, priotiry})
                                                list[idx].priotiry = priotiry
                                                list = list.sort(function(a, b) {
                                                    return b.priotiry - a.priotiry
                                                });
                                                setList([...list])
                                            }}>
                                                <Done />
                                            </IconButton>
                                        </InputAdornment>
                                        :
                                        null
                                }
                            />
                        </FormControl>
                    </div>
                    <br/>
                    </>
                    :
                    <Link href={`/${profile.role==='client'?'catalog':'item'}/[id]`} as={`/${profile.role==='client'?'catalog':'item'}/${profile.role==='client'?element.organization._id:element._id}`}>
                        <div className={classes.row}>
                            <div className={classes.price}>
                                {`${element.price} сом`}
                            </div>
                        </div>
                    </Link>

                }
                                        {'admin'===profile.role||(['суперорганизация', 'организация'].includes(profile.role)&&profile.organization===element.organization._id)?
                                            element.del!=='deleted'?
                                            <>
                                            <Button onClick={async()=>{
                                                const action = async() => {
                                                    await onoffItem([element._id])
                                                    setStatus(status==='active'?'deactive':'active')
                                                }
                                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                showMiniDialog(true)
                                            }} size='small' color={status==='active'?'primary':'secondary'}>
                                                {status==='active'?'Отключить':'Включить'}
                                            </Button>
                                            {
                                                'admin'===profile.role?
                                                    <Button onClick={async()=>{
                                                        const action = async() => {
                                                            await deleteItem([element._id])
                                                            let _list = [...list]
                                                            _list.splice(idx, 1)
                                                            setList(_list)
                                                        }
                                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                        showMiniDialog(true)
                                                    }} size='small' color='secondary'>
                                                        Удалить
                                                    </Button>:null
                                            }
                                            </>
                                                :
                                                element.del==='deleted'&&profile.role==='admin'?
                                                    <Button onClick={async()=>{
                                                        const action = async() => {
                                                            await restoreItem([element._id])
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
                                            :
                                                null
                                        }
            </CardContent>
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
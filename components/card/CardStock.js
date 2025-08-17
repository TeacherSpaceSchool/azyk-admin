import React, {useEffect, useState} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cardStyle from '../../src/styleMUI/subbrand/cardSubbrand'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import TextField from '@material-ui/core/TextField';
import Confirmation from '../dialog/Confirmation';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {checkFloat, inputFloat} from '../../src/lib'
import {addStock, deleteStock, getItemsForStocks, setStock} from '../../src/gql/stock';
import {useRouter} from 'next/router';

const defaultWarehouse = {name: 'Основной'}

const CardStock = React.memo((props) => {
    const classes = cardStyle();
    const router = useRouter();
    const {element, setList, organization, idx, warehouses} = props;
    const {isMobileApp} = props.app;
    const {profile} = props.user;
    //addCard
    let [count, setCount] = useState(element?element.count:'');
    let [warehouse, setWarehouse] = useState(element?element.warehouse:warehouses[0]);
    let handleWarehouse =  (warehouse) => {
        if(!warehouse) warehouse = warehouses[0]
        setWarehouse(warehouse)
    }
    let [item, setItem] = useState(element?element.item:null);
    let [items, setItems] = useState([]);
    useEffect(() => {(async () => {
        setItems(await getItemsForStocks({organization: router.query.id, warehouse: warehouse && warehouse._id}))
    })()}, [warehouse])
    let handleItem =  (item) => setItem(item)
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    return (
        <div>
            <Card className={isMobileApp?classes.cardM:classes.cardD}>
                    <CardContent>
                        {
                            element?
                                <TextField
                                    label='Склад'
                                    value={warehouse?warehouse.name:'Основной'}
                                    className={classes.input}
                                    inputProps={{readOnly: true}}
                                />
                                :
                                <Autocomplete
                                    className={classes.input}
                                    options={warehouses}
                                    getOptionLabel={option => option.name}
                                    value={warehouse}
                                    onChange={(event, newValue) => handleWarehouse(newValue)}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => <TextField {...params} label='Выберите склад' fullWidth />}
                                />

                        }
                        {
                            element?
                                <TextField
                                    label='Товар'
                                    value={item.name}
                                    className={classes.input}
                                    inputProps={{readOnly: true}}
                                />
                                :
                                <Autocomplete
                                    className={classes.input}
                                    options={items}
                                    getOptionLabel={option => option.name}
                                    value={item}
                                    onChange={(event, newValue) => handleItem(newValue)}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => <TextField error={!item} {...params} label='Выберите товар' fullWidth />}
                                />

                        }
                        <TextField
                            label='Количество'
                            value={count}
                            className={classes.input}
                            onChange={ event => setCount(inputFloat(event.target.value)) }
                            inputProps={{readOnly: !['admin', 'суперорганизация', 'организация'].includes(profile.role)}}
                        />
                    </CardContent>
                {['admin', 'суперорганизация', 'организация'].includes(profile.role)?<CardActions>
                    {
                        element?
                            <>
                                <Button onClick={async () => {
                                    const action = async () => await setStock({_id: element._id, count: checkFloat(count)})
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                }} size='small' color='primary'>
                                    Сохранить
                                </Button>
                                <Button size='small' color='secondary' onClick={() => {
                                    const action = async () => {
                                        await deleteStock(element._id)
                                        setList(list => {
                                            list.splice(idx, 1)
                                            return [...list]
                                        })
                                    }
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                }}>
                                    Удалить
                                </Button>
                            </>
                            :
                            <Button onClick={async () => {
                                if(organization&&item) {
                                    const action = async () => {
                                        let element = {
                                            count: checkFloat(count),
                                            organization,
                                            item: item._id,
                                            warehouse: warehouse?warehouse._id:warehouse
                                        }
                                        setWarehouse(null)
                                        setItem(null)
                                        let res = await addStock(element)
                                        if(res) setList(list => [res, ...list])
                                    }
                                    setCount('')
                                    setItem(null)
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                }
                            }} size='small' color='primary'>
                                Добавить
                            </Button>}
                </CardActions>:null}
            </Card>
        </div>
    );
})

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardStock)
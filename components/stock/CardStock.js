import React, {useState} from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
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
import { checkFloat, inputFloat } from '../../src/lib'
import {addStock, deleteStock, setStock} from '../../src/gql/stock';

const CardStock = React.memo((props) => {
    const classes = cardStyle();
    const { element, setList, organization, items, idx, list, warehouses } = props;
    const { isMobileApp } = props.app;
    //addCard
    let [count, setCount] = useState(element?element.count:'');
    let [warehouse, setWarehouse] = useState(element?element.warehouse:undefined);
    let handleWarehouse =  (warehouse) => {
        setWarehouse(warehouse)
    };
    let [item, setItem] = useState(element?element.item:undefined);
    let handleItem =  (item) => {
        setItem(item)
    };
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    return (
        <div>
            <Card className={isMobileApp?classes.cardM:classes.cardD}>
                <CardActionArea>
                    <CardContent>
                        {
                            element?
                                <TextField
                                    label='Склад'
                                    value={warehouse?warehouse.name:'Основной'}
                                    className={classes.input}
                                    inputProps={{
                                        'aria-label': 'description',
                                        readOnly: true,
                                    }}
                                />
                                :
                                <Autocomplete
                                    className={classes.input}
                                    options={warehouses}
                                    getOptionLabel={option => option.name}
                                    value={warehouse}
                                    onChange={(event, newValue) => {
                                        handleWarehouse(newValue)
                                    }}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField {...params} label='Выберите склад' fullWidth />
                                    )}
                                />

                        }
                        <br/>
                        <br/>
                        {
                            element?
                                <TextField
                                    label='Товар'
                                    value={item.name}
                                    className={classes.input}
                                    inputProps={{
                                        'aria-label': 'description',
                                        readOnly: true,
                                    }}
                                />
                                :
                                <Autocomplete
                                    className={classes.input}
                                    options={items}
                                    getOptionLabel={option => option.name}
                                    value={item}
                                    onChange={(event, newValue) => {
                                        handleItem(newValue)
                                    }}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField {...params} label='Выберите товар' fullWidth />
                                    )}
                                />

                        }
                        <br/>
                        <br/>
                        <TextField
                            label='Количество'
                            value={count}
                            className={classes.input}
                            onChange={ event => setCount(inputFloat(event.target.value)) }
                            inputProps={{
                                'aria-label': 'description',
                            }}
                        />
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    {
                        element!==undefined?
                            <>
                                <Button onClick={async()=>{
                                    if(count) {
                                        const action = async () => {
                                            await setStock({_id: element._id, count: checkFloat(count)})
                                        }
                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                        showMiniDialog(true)
                                    }
                                }} size='small' color='primary'>
                                    Сохранить
                                </Button>
                                <Button size='small' color='secondary' onClick={()=>{
                                    const action = async() => {
                                        await deleteStock(element._id)
                                        let _list = [...list]
                                        _list.splice(idx, 1)
                                        setList(_list)
                                    }
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                }}>
                                    Удалить
                                </Button>
                            </>
                            :
                            <Button onClick={async()=> {
                                if(count&&item) {
                                    const action = async () => {
                                        let element = {
                                            count: checkFloat(count),
                                            organization,
                                            item: item._id,
                                            warehouse: warehouse?warehouse._id:warehouse
                                        }
                                        let res = await addStock(element)
                                        if (res&&res.addStock)
                                            setList([res.addStock, ...list])
                                    }
                                    setCount('')
                                    setItem(undefined)
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                }
                            }} size='small' color='primary'>
                                Добавить
                            </Button>}
                </CardActions>
            </Card>
        </div>
    );
})

function mapStateToProps (state) {
    return {
        app: state.app
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardStock)
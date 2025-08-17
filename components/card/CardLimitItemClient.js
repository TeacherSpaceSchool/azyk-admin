import React, {useState} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cardStyle from '../../src/styleMUI/subbrand/cardSubbrand'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import { addLimitItemClient, setLimitItemClient, deleteLimitItemClient} from '../../src/gql/limitItemClient'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import TextField from '@material-ui/core/TextField';
import Confirmation from '../dialog/Confirmation';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {checkInt, inputInt} from '../../src/lib'

const CardLimitItemClient = React.memo((props) => {
    const classes = cardStyle();
    const {element, setList, organization, items, client, idx, setItems} = props;
    const {isMobileApp} = props.app;
    //addCard
    let [limit, setLimit] = useState(element?element.limit:'');
    let [item, setItem] = useState(element?element.item:null);
    let handleItem =  (item) => setItem(item);
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    return (
        <div>
            <Card className={isMobileApp?classes.cardM:classes.cardD}>
                    <CardContent>
                        {element ?
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
                                renderInput={params => <TextField {...params} label='Выберите товар' fullWidth/>}
                            />
                        }
                        <TextField
                            label='Лимит'
                            value={limit}
                            className={classes.input}
                            onChange={ event => setLimit(inputInt(event.target.value)) }
                        />
                    </CardContent>
                <CardActions>
                    {
                        element?
                            <>
                            <Button onClick={async () => {
                                if(limit) {
                                    const action = async () => await setLimitItemClient({_id: element._id, limit: checkInt(limit)})
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                }
                            }} size='small' color='primary'>
                                Сохранить
                            </Button>
                            <Button size='small' color='secondary' onClick={() => {
                                const action = async () => {
                                    await deleteLimitItemClient(element._id)
                                    setList(list => {
                                        list.splice(idx, 1)
                                        return [...list]
                                    })
                                    setItems(items => [item, ...items])
                                }
                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                showMiniDialog(true)
                            }}>
                                Удалить
                            </Button>
                            </>
                            :
                            <Button onClick={async () => {
                                if(limit&&item) {
                                    const action = async () => {
                                        let element = {
                                            limit: checkInt(limit),
                                            organization: organization._id,
                                            client: client._id,
                                            item: item._id
                                        }
                                        let res = await addLimitItemClient(element)
                                        if(res) {
                                            setList(list => [res, ...list])
                                            setItems(items => items.filter(item1 => item1._id !== item._id))
                                        }
                                    }
                                    setLimit('')
                                    setItem(null)
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

export default connect(mapStateToProps, mapDispatchToProps)(CardLimitItemClient)
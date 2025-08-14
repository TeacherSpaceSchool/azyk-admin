import React, {useState}  from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import cardAutoStyle from '../../src/styleMUI/auto/cardAuto'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import Confirmation from '../../components/dialog/Confirmation'
import {setAuto, deleteAuto, addAuto} from '../../src/gql/auto'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import {inputInt} from '../../src/lib'
import * as snackbarActions from '../../redux/actions/snackbar'
import {checkInt} from '../../redux/constants/other';

const CardAuto = React.memo((props) => {
    const classes = cardAutoStyle();
    const {element, setList, organization, employments, idx} = props;
    const {showSnackBar} = props.snackbarActions;
    const {isMobileApp} = props.app;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    let [number, setNumber] = useState(element&&element.number?element.number:'');
    let [tonnage, setTonnage] = useState(element&&element.tonnage?element.tonnage:'');
    let [employment, setEmployment] = useState(element&&element.employment?element.employment:null);
    return (
           <Card className={isMobileApp?classes.cardM:classes.cardD}>
                    <CardContent>
                        <TextField
                            error={!number}
                            label='Номер'
                            value={number}
                            className={classes.input}
                            onChange={(event) => setNumber(event.target.value)}
                        />
                        <br/>
                        <TextField
                            label='Грузоподъемность'
                            value={tonnage}
                            className={classes.input}
                            onChange={(event) => {setTonnage(inputInt(event.target.value))}}
                        />
                        <br/>
                        <Autocomplete
                            className={classes.input}
                            options={employments}
                            value={employment}
                            getOptionLabel={option => option.name}
                            onChange={(event, newValue) => setEmployment(newValue)}
                            noOptionsText='Ничего не найдено'
                            renderInput={params => <TextField {...params} label='Выберите экспедитора' fullWidth />}
                        />
                    </CardContent>
               <CardActions>
                    {
                        !element ?
                            <Button onClick={async () => {
                                if(number) {
                                    const action = async () => {
                                        let auto = {
                                            tonnage: checkInt(tonnage),
                                            number,
                                            organization,
                                            ...employment?{employment: employment._id}:{}
                                        }
                                        const res = await addAuto(auto)
                                        if(res) {
                                            setList(list => [res, ...list])
                                            setTonnage('')
                                            setEmployment(null)
                                            setNumber('')
                                        }
                                    }
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                } else {
                                    showSnackBar('Заполните все поля')
                                }
                            }} size='small' color='primary'>
                                Добавить
                            </Button>
                            :
                            <>
                            <Button onClick={async () => {
                                let editElement = {_id: element._id}
                                if(tonnage&&tonnage!=element.tonnage) editElement.tonnage = checkInt(tonnage)
                                if(number&&number!==element.number) editElement.number = number
                                if((employment&&employment._id)!==(element.employment&&element.employment._id)) editElement.employment = employment&&employment._id
                                const action = async () => await setAuto(editElement)
                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                showMiniDialog(true)
                            }} size='small' color='primary'>
                                Сохранить
                            </Button>
                            <Button onClick={
                                async () => {
                                    const action = async () => {
                                        await deleteAuto(element._id)
                                        setList(list => {
                                            list.splice(idx, 1)
                                            return [...list]
                                        })

                                    }
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                }
                            } size='small' color='secondary'>
                                Удалить
                            </Button>
                            </>
                    }
               </CardActions>
            </Card>
    );
})

function mapStateToProps (state) {
    return {
        app: state.app,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardAuto)
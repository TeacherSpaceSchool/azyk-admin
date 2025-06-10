import React, {useState}  from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
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
import { checkFloat } from '../../src/lib'
import * as snackbarActions from '../../redux/actions/snackbar'

const CardAuto = React.memo((props) => {
    const classes = cardAutoStyle();
    const { element, setList, organization, list, employments, idx } = props;
    const { showSnackBar } = props.snackbarActions;
    const { isMobileApp } = props.app;
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    let [number, setNumber] = useState(element&&element.number?element.number:'');
    let [tonnage, setTonnage] = useState(element&&element.tonnage?element.tonnage:0);
    let [employment, setEmployment] = useState(element&&element.employment?element.employment:undefined);
    return (
           <Card className={isMobileApp?classes.cardM:classes.cardD}>
                <CardActionArea>
                    <CardContent>
                        <TextField
                            label='Номер'
                            value={number}
                            className={classes.input}
                            onChange={(event)=>{setNumber(event.target.value)}}
                            inputProps={{
                                'aria-label': 'description',
                            }}
                        />
                        <br/>
                        <TextField
                            label='Грузоподъемность'
                            value={tonnage}
                            className={classes.input}
                            onChange={(event)=>{setTonnage(event.target.value)}}
                            inputProps={{
                                'aria-label': 'description',
                            }}
                        />
                        <br/>
                        <Autocomplete
                            className={classes.input}
                            options={employments}
                            value={employment}
                            getOptionLabel={option => option.name}
                            onChange={(event, newValue) => {
                                setEmployment(newValue)
                            }}
                            noOptionsText='Ничего не найдено'
                            renderInput={params => (
                                <TextField {...params} label='Выберите экспедитора' variant='outlined' fullWidth />
                            )}
                        />
                    </CardContent>
                </CardActionArea>
               <CardActions>
                    {
                        !element ?
                            <Button onClick={async()=>{
                                if (number.length>0) {
                                    const action = async() => {
                                        let auto = {
                                            tonnage: checkFloat(tonnage),
                                            number: number,
                                            organization: organization
                                        }
                                        if(employment)
                                            auto.employment = employment._id;
                                        setList([(await addAuto(auto)).addAuto, ...list])
                                        setTonnage(0)
                                        setEmployment({})
                                        setNumber('')
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
                            <Button onClick={async()=>{
                                let editElement = {_id: element._id}
                                if(tonnage.length>0&&tonnage!=element.tonnage)editElement.tonnage = checkFloat(tonnage)
                                if(number.length>0&&number!==element.number)editElement.number = number
                                if(!element.employment||employment&&employment._id!==element.employment._id)editElement.employment = employment._id
                                const action = async() => {
                                    await setAuto(editElement)
                                }
                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                showMiniDialog(true)
                            }} size='small' color='primary'>
                                Сохранить
                            </Button>
                            <Button onClick={
                                async()=>{
                                    const action = async() => {
                                        await deleteAuto([element._id])
                                        list.splice(idx, 1)
                                        setList([...list])

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
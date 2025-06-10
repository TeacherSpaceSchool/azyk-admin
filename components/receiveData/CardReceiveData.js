import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cardErrorStyle from '../../src/styleMUI/error/cardError'
import {pdDDMMYYHHMM} from '../../src/lib'
import { connect } from 'react-redux'
import Confirmation from '../dialog/Confirmation'
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import {deleteReceivedData, addReceivedDataClient} from '../../src/gql/receiveData'

const CardReceiveData = React.memo((props) => {
    const classes = cardErrorStyle();
    const { element, idx, list, setList } = props;
    const { isMobileApp } = props.app;
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    const { showSnackBar } = props.snackbarActions;
    return (
        <Card className={isMobileApp?classes.cardM:classes.cardD}>
            <CardContent>
                <div className={classes.date}>
                    {pdDDMMYYHHMM(element.createdAt)}
                </div>
                <br/>
                <div className={classes.row}>
                    <div className={classes.nameField}>
                        GUID:&nbsp;
                    </div>
                    <div className={classes.value}>
                        {element.guid}
                    </div>
                </div>
                <div className={classes.row}>
                    <div className={classes.nameField}>
                        Имя:&nbsp;
                    </div>
                    <div className={classes.value}>
                        {element.name}
                    </div>
                </div>
                {
                    element.position?
                        <div className={classes.row}>
                            <div className={classes.nameField}>
                                Должность:&nbsp;
                            </div>
                            <div className={classes.value}>
                                {element.position}
                            </div>
                        </div>
                        :null
                }
                {
                    element.addres?
                        <div className={classes.row}>
                            <div className={classes.nameField}>
                                Адрес:&nbsp;
                            </div>
                            <div className={classes.value}>
                                {element.addres}
                            </div>
                        </div>
                        :null
                }
                {
                    element.agent?
                        <div className={classes.row}>
                            <div className={classes.nameField}>
                                Агент:&nbsp;
                            </div>
                            <div className={classes.value}>
                                {element.agent}
                            </div>
                        </div>
                        :null
                }
                {
                    element.phone?
                    <div className={classes.row}>
                        <div className={classes.nameField}>
                            Телефон:&nbsp;
                        </div>
                        <div className={classes.value}>
                            {element.phone}
                        </div>
                    </div>
                        :null
                }
                <div className={classes.row}>
                    <div className={classes.nameField}>
                        Тип:&nbsp;
                    </div>
                    <div className={classes.value}>
                        {element.type}
                    </div>
                </div>
                <div className={classes.row}>
                    <div className={classes.nameField}>
                        Статус:&nbsp;
                    </div>
                    <div className={classes.value}>
                        {element.status}
                    </div>
                </div>
            </CardContent>
            <CardActions>
                <Button onClick={async () => {
                    const action = async () => {
                        let res = (await addReceivedDataClient(element._id)).addReceivedDataClient
                        if(res.data==='OK') {
                            list.splice(idx, 1)
                            setList([...list])
                        }
                        else
                            showSnackBar('Ошибка')
                    }
                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                    showMiniDialog(true)
                }} size='small' color='primary'>
                    {element.status}
                </Button>
                <Button onClick={async()=>{
                    const action = async() => {
                        await deleteReceivedData([element._id])
                        list.splice(idx, 1)
                        setList([...list])
                    }
                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                    showMiniDialog(true)
                }} size='small' color='secondary'>
                    Удалить
                </Button>
            </CardActions>
        </Card>
    );
})

function mapStateToProps (state) {
    return {
        app: state.app
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardReceiveData)
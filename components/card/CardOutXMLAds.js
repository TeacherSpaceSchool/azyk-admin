import React, {useState} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cardPageListStyle from '../../src/styleMUI/blog/cardBlog'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import { deleteOutXMLAdsShoro, addOutXMLAdsShoro, setOutXMLAdsShoro } from '../../src/gql/outxmladsazyk'
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import Confirmation from '../dialog/Confirmation'
import Autocomplete from '@material-ui/lab/Autocomplete';

const CardOutXMLAds = React.memo((props) => {
    const classes = cardPageListStyle();
    const {element, setList, districts, idx, organization, setDistricts} = props;
    const {isMobileApp} = props.app;
    //addCard
    let [guid, setGuid] = useState(element?element.guid:'');
    let handleGuid =  (event) => {
        setGuid(event.target.value)
    };
    let [district, setDistrict] = useState(element?element.district:null)
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {showSnackBar} = props.snackbarActions;
    return (
        <Card className={isMobileApp?classes.cardM:classes.cardD}>
                        <CardContent>
                            {element ?
                                <TextField
                                    style={{width: '100%'}}
                                    label='Район'
                                    value={district?district.name:''}
                                    className={classes.input}
                                    inputProps={{readOnly: true}}
                                />
                                :
                                <Autocomplete
                                    className={classes.input}
                                    options={districts}
                                    getOptionLabel={option => option.name}
                                    value={district}
                                    onChange={(event, newValue) => {
                                        setDistrict(newValue)
                                    }}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField {...params} label='Район' fullWidth/>
                                    )}
                                />
                            }
                            <TextField
                                style={{width: '100%'}}
                                label='GUID'
                                value={guid}
                                className={classes.input}
                                onChange={handleGuid}
                            />
                        </CardContent>
                    <CardActions>
                        {
                            element?
                                <>
                                <Button onClick={() => {
                                    if(guid && guid !== element.guid) {
                                        let editElement = {_id: element._id, guid}
                                        const action = async () => await setOutXMLAdsShoro(editElement)
                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                        showMiniDialog(true)
                                    } else {
                                        showSnackBar('Заполните все поля')
                                    }
                                }} size='small' color='primary'>
                                    Сохранить
                                </Button>
                                <Button onClick={() => {
                                    const action = async () => {
                                        await deleteOutXMLAdsShoro(element._id)
                                        setList(list => {
                                            list.splice(idx, 1);
                                            return [...list]
                                        })
                                        setDistricts(districts => [district, ...districts])
                                    }
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                }} size='small' color='secondary'>
                                    Удалить
                                </Button>
                                </>
                                :
                                <Button onClick={() => {
                                    if(district && guid) {
                                        const action = async () => {
                                            const res = await addOutXMLAdsShoro({organization, guid, district: district._id})
                                            setList(list => [res, ...list])
                                            setDistricts(districts => districts.filter(district1 => district1._id !== district._id))
                                            setDistrict(null)
                                            setGuid('')
                                        }
                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                        showMiniDialog(true)
                                    } else {
                                        showSnackBar('Заполните все поля')
                                    }
                                }
                                } size='small' color='primary'>
                                    Добавить
                                </Button>
                        }
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

export default connect(mapStateToProps, mapDispatchToProps)(CardOutXMLAds)
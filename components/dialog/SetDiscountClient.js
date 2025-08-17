import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import * as appActions from '../../redux/actions/app'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getClients } from '../../src/gql/client'
import Confirmation from './Confirmation'
import { saveDiscountClients } from '../../src/gql/discountClient'
import { checkInt } from '../../src/lib'

const SetDiscountClient =  React.memo(
    (props) =>{
        const {classes, organization, discountClients, setDiscountClients} = props;
        const {isMobileApp} = props.app;
        const {showSnackBar} = props.snackbarActions;
        const {showMiniDialog, setMiniDialog} = props.mini_dialogActions;
        const searchTimeOut = useRef(null);
        const [open, setOpen] = useState(false);
        const [inputValue, setInputValue] = React.useState('');
        const [loading, setLoading] = useState(true);
        const [clients, setClients] = useState([]);
        useEffect(() => {
            (async () => {
                if(inputValue.length < 3) {
                    setClients([]);
                    if(open)
                        setOpen(false)
                    if(loading)
                        setLoading(false)
                }
                else {
                    if(!loading)
                        setLoading(true)
                    if(searchTimeOut.current)
                        clearTimeout(searchTimeOut.current)
                    searchTimeOut.current = setTimeout(async () => {
                        setClients(await getClients({search: inputValue, sort: '-name', filter: 'all'}))
                        if(!open)
                            setOpen(true)
                        setLoading(false)
                    }, 500)
                }
            })()
        }, [inputValue]);
        const handleChange = event => {
            setInputValue(event.target.value);
        };
        let [client, setClient] = useState([]);
        let handleClient =  (client) => {
            setClient(client)
            setOpen(false)
        };
        const width = isMobileApp? (window.innerWidth-112) : 500
        let [discount, setDiscount] = useState(0);
        return (
            <div className={classes.main}>
                <Autocomplete
                    onClose={()=>setOpen(false)}
                    open={open}
                    disableOpenOnFocus
                    className={classes.input}
                    options={clients}
                    getOptionLabel={option => `${option.address&&option.address[0]?` (${option.address[0][2]?`${option.address[0][2]}, `:''}${option.address[0][0]})`:''}`}
                    onChange={(event, newValue) => {
                        handleClient(newValue)
                    }}
                    noOptionsText='Ничего не найдено'
                    style={{width: width}}
                    renderInput={params => (
                        <TextField {...params} label='Выберите клиента' fullWidth
                                   onChange={handleChange}
                                   InputProps={{
                                       ...params.InputProps,
                                       endAdornment: (
                                           <React.Fragment>
                                               {loading ? <CircularProgress color='inherit' size={20} /> : null}
                                               {params.InputProps.endAdornment}
                                           </React.Fragment>
                                       ),
                                   }}
                        />
                    )}
                />
                <br/>
                <TextField
                    type={ isMobileApp?'number':'text'}
                    style={{width: width}}
                    label='Скидка'
                    value={discount}
                    className={classes.input}
                    onChange={(event) => {
                        setDiscount(checkInt(event.target.value))}
                    }
                />
                <br/>
                <div>
                    <Button variant="contained" color='primary' onClick={async () => {
                        if(client&&client._id) {
                            const action = async () => {
                                await saveDiscountClients({clients:[client._id], organization:organization._id, discount})
                                discountClients[client._id] = {
                                    client: client._id,
                                    discount: discount,
                                    organization: organization._id
                                }
                                setDiscountClients({...discountClients})
                            }
                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                            showMiniDialog(true)
                        }
                        else {
                            showSnackBar('Заполните все поля');
                        }
                        close()
                    }} className={classes.button}>
                        Сохранить
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => {showMiniDialog(false);}} className={classes.button}>
                        Закрыть
                    </Button>
                </div>
            </div>
        );
    }
)

function mapStateToProps (state) {
    return {
        app: state.app
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
    }
}

SetDiscountClient.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(SetDiscountClient));
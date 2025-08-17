import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import TextField from '@material-ui/core/TextField';
import { getOrdersForRouting } from '../../src/gql/order'
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import Checkbox from '@material-ui/core/Checkbox';
import CardOrder from '../../components/card/CardOrder';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Fab from '@material-ui/core/Fab';
import Menu from '@material-ui/core/Menu';
import SettingsIcon from '@material-ui/icons/Settings';
import routeStyle from '../../src/styleMUI/route/route'

const AddOrder =  React.memo(
    (props) =>{
        const classes = routeStyle();
        const {districts, produsers, mainSelectedOrders, setMainSelectedOrders, mainOrders, setMainOrders} = props;
        const {showFullDialog} = props.mini_dialogActions;
        let [screen, setScreen] = useState('setting');
        let [dateStart, setDateStart] = useState(null);
        let [dateEnd, setDateEnd] = useState(null);
        let [selectProdusers, setSelectProdusers] = useState([]);
        let handleSelectProdusers = (async (event) => {
            setSelectProdusers(event.target.value)
        })
        let [selectDistricts, setSelectDistricts] = useState([]);
        let handleSelectDistricts = (async (event) => {
            setSelectDistricts(event.target.value)
        })
        let [orders, setOrders] = React.useState([]);
        const [pagination, setPagination] = useState(100);
        const containerRef = useBottomScrollListener(async () => {
            if(pagination<orders.length) {
                setPagination(pagination => pagination+100)
            }
        });
        let [selectedOrders, setSelectedOrders] = useState([]);
        useEffect(() => {
            (async () => {
                if(selectProdusers.length&&selectDistricts.length&&dateStart) {
                    let clients = []
                    for(let i=0;i<selectDistricts.length;i++) {
                        clients = [...clients, ...selectDistricts[i].client.map(element=>element._id)]
                    }
                    orders = await getOrdersForRouting({produsers: selectProdusers.map(element=>element._id), clients: clients, dateStart: dateStart, dateEnd: dateEnd})
                    orders = orders.filter(order=>mainOrders.findIndex(element1=>element1._id===order._id)===-1)
                    setOrders(orders)
                }
            })()
        }, [selectProdusers, selectDistricts, dateStart])
        const {isMobileApp} = props.app;
        let [anchorEl, setAnchorEl] = useState(null);
        let open = event => {
            setAnchorEl(event.currentTarget);
        };
        let close = () => {
            setAnchorEl(null);
        };
        return (
            <div ref={containerRef} className={classes.column}>
                <div style={{ justifyContent: 'center' }} className={classes.row}>
                    <div style={{background: screen==='setting'?'#ffb300':'#ffffff'}} onClick={() => {setPagination(100);setScreen('setting')}} className={classes.selectType}>
                        Настройки
                    </div>
                    <div style={{background: screen==='invoices'?'#ffb300':'#ffffff'}} onClick={() => {setPagination(100);setScreen('invoices')}} className={classes.selectType}>
                        Заказы {orders.length}
                    </div>
                </div>
                {
                    screen==='setting'?
                        <>
                        <FormControl className={classes.input}>
                            <InputLabel>Производители</InputLabel>
                            <Select
                                multiple
                                value={selectProdusers}
                                onChange={handleSelectProdusers}
                                input={<Input />}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 226,
                                            width: 250,
                                        },
                                    }
                                }}
                            >
                                {produsers.map((produser) => (
                                    <MenuItem key={produser.name} value={produser}>
                                        {produser.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl className={classes.input}>
                            <InputLabel>Районы</InputLabel>
                            <Select
                                multiple
                                value={selectDistricts}
                                onChange={handleSelectDistricts}
                                input={<Input />}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 226,
                                            width: 250,
                                        },
                                    }
                                }}
                            >
                                {districts.map((district) => (
                                    <MenuItem key={district.name} value={district}>
                                        {district.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            className={classes.input}
                            label='Начало'
                            type='date'
                            InputLabelProps={{shrink: true}}
                            format='MM/dd/yy'
                            value={dateStart}
                            onChange={ event => setDateStart(event.target.value) }
                        />
                        <TextField
                            className={classes.input}
                            label='Конец'
                            type='date'
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={dateEnd}
                            format='MM/dd/yy'
                            onChange={ event => setDateEnd(event.target.value) }
                        />
                        </>
                        :
                        <div className={classes.listInvoices}>
                            {orders?orders.map((element, idx) => {
                                if(idx<pagination)
                                    return(
                                        <div key={element._id} style={isMobileApp ? {alignItems: 'baseline'} : {}}
                                             className={isMobileApp ? classes.column1 : classes.row1}>
                                            <Checkbox checked={selectedOrders.findIndex(element1=>element1._id===element._id)!==-1}
                                                      onChange={() => {
                                                          if(selectedOrders.findIndex(element1=>element1._id===element._id)===-1) {
                                                              selectedOrders.push(element)
                                                          } else {
                                                              selectedOrders.splice(selectedOrders.findIndex(element1=>element1._id===element._id), 1)
                                                          }
                                                          setSelectedOrders([...selectedOrders])
                                                      }}
                                            />
                                            <CardOrder element={element}/>
                                        </div>
                                    )}
                            ):null}
                        </div>
                }
                <Fab onClick={open} color='primary' className={classes.fab}>
                    <SettingsIcon />
                </Fab>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={close}
                    className={classes.menu}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                >
                    <MenuItem onClick={async () => {
                        setSelectedOrders([...orders])
                        close()
                    }}>Выбрать все</MenuItem>
                    <MenuItem onClick={async () => {
                        setSelectedOrders([])
                        close()
                    }}>Отменить выбор</MenuItem>
                    <MenuItem onClick={async () => {
                        selectedOrders = selectedOrders.filter(element=>mainOrders.findIndex(element1=>element1._id===element._id)===-1)
                        setMainOrders([...selectedOrders, ...mainOrders])
                        setMainSelectedOrders([...selectedOrders, ...mainSelectedOrders])
                        showFullDialog(false)
                    }}>Сохранить</MenuItem>
                </Menu>
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
    }
}

AddOrder.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddOrder);
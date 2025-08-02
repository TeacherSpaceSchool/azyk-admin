import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import initialApp from '../../../src/initialApp'
import CardClient from '../../../components/card/CardClient'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import { getDistricts, getDistrict } from '../../../src/gql/district'
import { getDeliveryDates, saveDeliveryDates } from '../../../src/gql/deliveryDate'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import Checkbox from '@material-ui/core/Checkbox';
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';
import Menu from '@material-ui/core/Menu';
import * as snackbarActions from '../../../redux/actions/snackbar'
import dynamic from 'next/dynamic'
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {getOrganizations} from '../../../src/gql/organization';

const Confirmation = dynamic(() => import('../../../components/dialog/Confirmation'))
const SetDeliveryDate = dynamic(() => import('../../../components/dialog/SetDeliveryDate'))
const GeoSelectClient = dynamic(() => import('../../../components/dialog/GeoSelectClient'))

const LogistiOorder = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    let {isMobileApp, search, city} = props.app;
    const {profile} = props.user;
    const {setMiniDialog, showMiniDialog, setFullDialog, showFullDialog} = props.mini_dialogActions;
    const {showLoad} = props.appActions;
    const {showSnackBar} = props.snackbarActions;
    const priorities = [1, 0]
    let [priority, setPriority] = useState(0);
    let handlePriority =  (event) => {
        setPriority(event.target.value)
    };
    const initialRender = useRef(true);
    let [organizations, setOrganizations] = useState(data.organizations);
    const [pagination, setPagination] = useState(100);
    let [districts, setDistricts] = useState([]);
    let [allClients, setAllClients] = useState([]);
    let [deliveryDates, setDeliveryDates] = useState([]);
    let [filtredClients, setFiltredClients] = useState([]);
    let [selectedClients, setSelectedClients] = useState([]);
    let [district, setDistrict] = useState(null);
    let [organization, setOrganization] = useState(profile.organization?{_id: profile.organization}:null);
    let [days, setDays] = useState([true, true, true, true, true, true, false]);
    const selectClient = (i) => {
        selectedClients.push(allClients[i]._id)
        setSelectedClients([...selectedClients])
    }
    useEffect(() => {
        if(profile.organization) {
            organization = data.organizations.find(organization => organization._id === profile.organization)
            if(organization)
                setOrganization(organization)
        }
    }, [])
    useEffect(() => {
        if(!initialRender.current) {
            (async () => {
                showLoad(true)
                setDistrict(null)
                setAllClients([])
                setSelectedClients([])
                if(organization) {
                    setDistricts(await getDistricts({
                        search: '',
                        sort: '-name',
                        organization: organization._id
                    }))
                }
                showLoad(false)
            })()
        }
    }, [organization])
    useEffect(() => {
        if(!initialRender.current) {
            (async () => {
                setSelectedClients([])
                setAllClients([])
                if(district && organization) {
                    showLoad(true)
                    district = await getDistrict(district._id)
                    setAllClients(district.client)
                    const deliveryDatesData = await getDeliveryDates({clients: district.client.map(element => element._id), organization: organization._id})
                    deliveryDates = {}
                    for (let i = 0; i < deliveryDatesData.length; i++) {
                        deliveryDates[deliveryDatesData[i].client] = deliveryDatesData[i]
                    }
                    setDeliveryDates({...deliveryDates})
                    showLoad(false)
                }
            })()
        }
    }, [district])
    const checkPagination = useCallback(() => {
        if(pagination<filtredClients.length)
            setPagination(pagination => pagination+100)
    }, [pagination, filtredClients])
    useEffect(() => {
        if(!initialRender.current) {
            let filtredClient = [...allClients]
            if(search)
                filtredClient = filtredClient.filter(element =>
                    ((element.phone.filter(phone => phone.toLowerCase().includes(search.toLowerCase()))).length) ||
                    (element.name.toLowerCase()).includes(search.toLowerCase()) ||
                    ((element.address.filter(addres => addres[0] && addres[0].toLowerCase().includes(search.toLowerCase()))).length) ||
                    ((element.address.filter(addres => addres[2] && addres[2].toLowerCase().includes(search.toLowerCase()))).length)
                )
            setFiltredClients([...filtredClient])
        }
    }, [search, allClients])

    let [anchorEl, setAnchorEl] = useState(null);
    let open = event => {
        setAnchorEl(event.currentTarget);
    };
    let close = () => {
        setAnchorEl(null);
    };
    useEffect(() => {
        (async () => {
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                showLoad(true)
                setOrganizations([{name: 'AZYK.STORE', _id: 'super'}, ...await getOrganizations({search: '', filter: '', city})])
                showLoad(false)
            }
        })()
    }, [city])
    const inputClass = !isMobileApp&&profile.role==='admin'?classes.inputThird:classes.inputHalf
    return (
        <App cityShow pageName='Дни доставки' checkPagination={checkPagination} searchShow>
            <Head>
                <title>Дни доставки</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        {
                            profile.role==='admin'?
                                <Autocomplete
                                    className={inputClass}
                                    options={organizations}
                                    getOptionLabel={option => option.name}
                                    value={organization}
                                    onChange={(event, newValue) => {
                                        setOrganization(newValue)
                                    }}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField {...params} label='Организация' fullWidth />
                                    )}
                                />
                                :
                                null
                        }
                        <Autocomplete
                            className={inputClass}
                            options={districts}
                            getOptionLabel={option => option.name}
                            value={district}
                            onChange={(event, newValue) => {
                                setDistrict(newValue)
                            }}
                            noOptionsText='Ничего не найдено'
                            renderInput={params => (
                                <TextField {...params} label='Район' fullWidth />
                            )}
                        />
                        <FormControl className={inputClass}>
                            <InputLabel>Приоритет</InputLabel>
                            <Select
                                value={priority}
                                onChange={handlePriority}
                            >
                                {priorities.map((element)=>
                                    <MenuItem key={element} value={element}>{element}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </div>
                    <div className={classes.row}>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[0] = !days[0];setDays([...days])}} size='small' color={days[0]?'primary':''}>
                            ПН
                        </Button>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[1] = !days[1];setDays([...days])}} size='small' color={days[1]?'primary':''}>
                            ВТ
                        </Button>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[2] = !days[2];setDays([...days])}} size='small' color={days[2]?'primary':''}>
                            СР
                        </Button>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[3] = !days[3];setDays([...days])}} size='small' color={days[3]?'primary':''}>
                            ЧТ
                        </Button>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[4] = !days[4];setDays([...days])}} size='small' color={days[4]?'primary':''}>
                            ПТ
                        </Button>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[5] = !days[5];setDays([...days])}} size='small' color={days[5]?'primary':''}>
                            СБ
                        </Button>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[6] = !days[6];setDays([...days])}} size='small' color={days[6]?'primary':''}>
                            ВС
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <div className={classes.listInvoices}>
                {filtredClients?filtredClients.map((element, idx)=> {
                    if(idx<pagination) {
                        let searchedDeliveryDates = deliveryDates[element._id] ? deliveryDates[element._id] : { days: [true, true, true, true, true, true, false], priority: 0};
                        let deliveryDate = searchedDeliveryDates.days;
                        let priority = searchedDeliveryDates.priority;
                        return (
                            <div key={element._id} className={classes.row1} style={{justifyContent: 'center'}}>
                                <div style={{alignItems: 'center'}} className={isMobileApp?classes.row1:classes.column}>
                                    <Checkbox checked={selectedClients.includes(element._id)}
                                        onChange={() => {
                                            if(!selectedClients.includes(element._id)) {
                                                selectedClients.push(element._id)
                                            } else {
                                                selectedClients.splice(selectedClients.indexOf(element._id), 1)
                                            }
                                            setSelectedClients([...selectedClients])
                                        }}
                                    />
                                    <div className={classes.dateStatistic} style={{background: deliveryDate[0]?'#ffb300':'white'}}/>
                                    <div className={classes.dateStatistic} style={{background: deliveryDate[1]?'#ffb300':'white'}}/>
                                    <div className={classes.dateStatistic} style={{background: deliveryDate[2]?'#ffb300':'white'}}/>
                                    <div className={classes.dateStatistic} style={{background: deliveryDate[3]?'#ffb300':'white'}}/>
                                    <div className={classes.dateStatistic} style={{background: deliveryDate[4]?'#ffb300':'white'}}/>
                                    <div className={classes.dateStatistic} style={{background: deliveryDate[5]?'#ffb300':'white'}}/>
                                    <div className={classes.dateStatistic} style={{background: deliveryDate[6]?'#ffb300':'white'}}/>
                                    <b>
                                        {priority}
                                    </b>
                                </div>
                                <CardClient idx={idx} element={element}/>
                            </div>
                        )
                    }
                    else return null
                }):null}
            </div>
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
                {
                    allClients.length?
                        <MenuItem onClick={() => {
                            setFullDialog('Редактировать район', <GeoSelectClient clients={allClients} selectClient={selectClient}/>);
                            showFullDialog(true)
                            close()
                        }}>По карте</MenuItem>
                        :
                        null
                }
                {
                    organization&&organization._id?
                        <MenuItem onClick={() => {
                            setMiniDialog('По клиенту', <SetDeliveryDate deliveryDates={deliveryDates} setDeliveryDates={setDeliveryDates} organization={organization}/>);
                            showMiniDialog(true)
                            close()
                        }}>По клиенту</MenuItem>
                        :
                        null
                }
                <MenuItem onClick={() => {
                    if(selectedClients.length) {
                        const action = async () => {
                            if(selectedClients.length) {
                                await saveDeliveryDates({clients: selectedClients, organization: organization._id, days, priority})
                                for (let i = 0; i < selectedClients.length; i++) {
                                    deliveryDates[selectedClients[i]] = {
                                        client: selectedClients[i],
                                        days: [...days],
                                        priority,
                                        organization: organization._id
                                    }
                                }
                                setDeliveryDates({...deliveryDates})
                            }
                        }
                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                        showMiniDialog(true)
                    }
                    else {
                        showSnackBar('Заполните все поля');
                    }
                    close()
                }}>Сохранить</MenuItem>
                <MenuItem onClick={() => {
                    setSelectedClients(filtredClients.map(client=>client._id))
                    close()
                }}>Выбрать все</MenuItem>
                <MenuItem onClick={() => {
                    setSelectedClients([])
                    close()
                }}>Отменить выбор</MenuItem>
            </Menu>
            <div className='count'>
                {`Клиентов: ${selectedClients.length}`}
            </div>
        </App>
    )
})

LogistiOorder.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    ctx.store.getState().app.filter = 'Заказы'
    if(!['admin', 'суперорганизация', 'организация', 'агент', 'менеджер'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            organizations: [
                {name: 'AZYK.STORE', _id: 'super'}, 
                ...await getOrganizations({city: ctx.store.getState().app.city, search: '', filter: ''}, getClientGqlSsr(ctx.req))
            ]
        }
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LogistiOorder);
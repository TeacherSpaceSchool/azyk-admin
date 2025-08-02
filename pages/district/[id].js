import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import { getOrganizations } from '../../src/gql/organization'
import { getDistrict, setDistrict, deleteDistrict, addDistrict } from '../../src/gql/district'
import { getAgents, getEcspeditors, getManagers } from '../../src/gql/employment'
import { getClientsWithoutDistrict } from '../../src/gql/client'
import districtStyle from '../../src/styleMUI/district/district'
import { useRouter } from 'next/router'
import Card from '@material-ui/core/Card';
import CardClient from '../../components/card/CardClient';
import CardContent from '@material-ui/core/CardContent';
import Checkbox from '@material-ui/core/Checkbox';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Router from 'next/router'
import dynamic from 'next/dynamic'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import {getWarehouses} from '../../src/gql/warehouse';

const Confirmation = dynamic(() => import('../../components/dialog/Confirmation'))
const GeoRouteAgent = dynamic(() => import('../../components/dialog/GeoRouteAgent'))

const District = React.memo((props) => {
    const {profile} = props.user;
    const {setMiniDialog, showMiniDialog, setFullDialog, showFullDialog} = props.mini_dialogActions;
    const {showSnackBar} = props.snackbarActions;
    const classes = districtStyle();
    const {data} = props;
    const router = useRouter()
    const {search, isMobileApp, city} = props.app;
    const initialRender = useRef(true);
    useEffect(() => {(async () => {
        if(initialRender.current)
            initialRender.current = false;
        else if(router.query.id==='new')
            setOrganizations(await getOrganizations({search: '', filter: '', city}))
    })()}, [city])
    //selectType
    let [selectType, setSelectType] = useState('Выбранные');
    //name
    let [name, setName] = useState(data.district?data.district.name:'');
    let handleName =  (event) => setName(event.target.value);
    //manager
    let [managers, setManagers] = useState([]);
    let [manager, setManager] = useState(data.district?data.district.manager:null);
    let handleManager =  (event) => setManager({_id: event.target.value});
    //agent
    let [agents, setAgents] = useState([]);
    let [agent, setAgent] = useState(data.district?data.district.agent:null);
    let handleAgent = (event) => setAgent({_id: event.target.value});
    //warehouse
    let [warehouses, setWarehouses] = useState([]);
    let [warehouse, setWarehouse] = useState(data.district?data.district.warehouse:null);
    let handleWarehouse = (event) => setWarehouse({_id: event.target.value});
    //ecspeditor
    let [ecspeditors, setEcspeditors] = useState([]);
    let [ecspeditor, setEcspeditor] = useState(data.district?data.district.ecspeditor:null);
    let handleEcspeditor =  (event) => setEcspeditor({_id: event.target.value});
    //organization
    let [organizations, setOrganizations] = useState(data.organizations);
    let [organization, setOrganization] = useState(router.query.id==='new'||!data.district?null:data.district.organization||{name: 'AZYK.STORE', _id: 'super'});
    let handleOrganization =  (event) => setOrganization({_id: event.target.value});
    useEffect(() => {
        if(router.query.id==='new'&&profile.organization) {
            setOrganization(organizations.find(organization=>organization._id===profile.organization))
        }
    }, [profile])
    useEffect(() => {(async () => {
            if(router.query.id === 'new') {
                setAgent(null)
                setWarehouse(null)
                setManager(null)
                setEcspeditor(null)
            }
            let agents = [], managers = [], ecspeditors = [], clientsWithoutDistrict = [], warehouses = []
            if(organization) {
                // eslint-disable-next-line no-undef
                const [agentsData, managersData, ecspeditorsData, clientsWithoutDistrictData, warehousesData] = await Promise.all([
                    getAgents(organization._id),
                    getManagers(organization._id),
                    getEcspeditors(organization._id),
                    getClientsWithoutDistrict({
                        ...data.district?{district: data.district._id}:{}, organization: organization._id,
                        city: organization&&organization.cities&&organization.cities[0]?organization.cities[0]:city
                    }),
                    getWarehouses({search: '', organization: organization._id})
                ])
                agents = agentsData; managers = managersData; ecspeditors = ecspeditorsData; clientsWithoutDistrict = clientsWithoutDistrictData;
                warehouses = warehousesData
            }
            setAgents(agents)
            setManagers(managers)
            setEcspeditors(ecspeditors)
            setUnselectedClient(clientsWithoutDistrict)
            setWarehouses(warehouses)
    })()}, [organization])
    //клиенты района
    let [client, setClient] = useState(data.district?data.district.client:[]);
    let [allClient, setAllClient] = useState([]);
    let [filtredClient, setFiltredClient] = useState([]);
    let [unselectedClient, setUnselectedClient] = useState([]);
    const selectClient = (i) => {
        client.push(unselectedClient[i])
        unselectedClient.splice(i, 1)
        setClient([...client])
        setUnselectedClient([...unselectedClient])
    }
    //pagination
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<allClient.length)
            setPagination(pagination => pagination+100)
    }, [pagination, allClient])
    useEffect(() => {
        setPagination(100)
        let allClient= []
        if(selectType === 'Все')
            allClient=[...client, ...unselectedClient]
        else if(selectType === 'Свободные')
            allClient=[...unselectedClient]
        else if(selectType === 'Выбранные')
            allClient=[...client]
        let filtredClient = [...allClient]
        if(search)
            filtredClient = filtredClient.filter(element=>
                ((element.phone.filter(phone => phone.toLowerCase().includes(search.toLowerCase()))).length) ||
                (element.name.toLowerCase()).includes(search.toLowerCase())||
                ((element.address.filter(addres=>addres[0]&&addres[0].toLowerCase().includes(search.toLowerCase()))).length)||
                ((element.address.filter(addres=>addres[2]&&addres[2].toLowerCase().includes(search.toLowerCase()))).length)
            )
        setFiltredClient([...filtredClient])
        setAllClient(allClient)
    }, [selectType, unselectedClient, client])
    useEffect(() => {
        if(allClient.length) {
            let filtredClient = [...allClient]
            if(search)
                filtredClient = filtredClient.filter(element=>
                    (element.name.toLowerCase()).includes(search.toLowerCase())||
                    ((element.address.filter(addres=>addres[0]&&addres[0].toLowerCase().includes(search.toLowerCase()))).length)||
                    ((element.address.filter(addres=>addres[2]&&addres[2].toLowerCase().includes(search.toLowerCase()))).length)
                )
            setFiltredClient([...filtredClient])
        }
    }, [search])
    //render
    return (
        <App cityShow cities={router.query.id!=='new'&&data.district&&data.district.organization?data.district.organization.cities:null} searchShow checkPagination={checkPagination} pageName={router.query.id==='new'?'Добавить':data.district?data.district.name:'Ничего не найдено'}>
            <Head>
                <title>{router.query.id==='new'?'Добавить':data.district?data.district.name:'Ничего не найдено'}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={isMobileApp?classes.pageM:classes.pageD}>
                {router.query.id==='new'||data.district?
                    <CardContent className={classes.column}>
                        <TextField
                            label='Название'
                            error={!name}
                            value={name}
                            className={isMobileApp?classes.inputM:classes.inputDF}
                            onChange={handleName}
                            inputProps={{readOnly: ['менеджер', 'агент', 'суперагент'].includes(profile.role),}}
                        />
                        {!profile.organization?
                            router.query.id==='new'?<FormControl  inputProps={{readOnly: router.query.id!=='new'}} error={!organization} className={isMobileApp?classes.inputM:classes.inputDF}>
                                <InputLabel>Организация</InputLabel>
                                <Select value={organization&&organization._id} onChange={handleOrganization}>
                                    {organizations.map((element)=>
                                        <MenuItem key={element._id} value={element._id}>{element.name}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>:<TextField
                                style={{width: '100%'}}
                                label='Организация'
                                value={organization.name}
                                className={classes.input}
                                inputProps={{readOnly: true}}
                            />:null}
                        {['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                            <FormControl className={isMobileApp ? classes.inputM : classes.inputDF}>
                                <InputLabel>Менеджер</InputLabel>
                                <Select value={manager&&manager._id} onChange={handleManager}>
                                    {managers.map((element) =>
                                        <MenuItem key={element._id} value={element._id}>{element.name}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            :
                            <TextField
                                label='Менеджер'
                                value={manager&&manager.name}
                                className={isMobileApp?classes.inputM:classes.inputDF}
                                inputProps={{readOnly: true}}
                            />
                        }
                        {['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                            <FormControl className={isMobileApp?classes.inputM:classes.inputDF}>
                                <InputLabel>Агент</InputLabel>
                                <Select value={agent&&agent._id} onChange={handleAgent}>
                                    {agents.map((element)=>
                                        <MenuItem key={element._id} value={element._id}>{element.name}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            :
                            <TextField
                                label='Агент'
                                value={agent&&agent.name}
                                className={isMobileApp?classes.inputM:classes.inputDF}
                                inputProps={{readOnly: true}}
                            />
                        }
                        {['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                            <FormControl className={isMobileApp?classes.inputM:classes.inputDF}>
                                <InputLabel>Экспедитор</InputLabel>
                                <Select value={ecspeditor&&ecspeditor._id} onChange={handleEcspeditor}>
                                    {ecspeditors.map((element)=>
                                        <MenuItem key={element._id} value={element._id}>{element.name}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            :
                            <TextField
                                label='Экспедитор'
                                value={ecspeditor&&ecspeditor.name}
                                className={isMobileApp?classes.inputM:classes.inputDF}
                                inputProps={{readOnly: true}}
                            />
                        }
                        {['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                            <FormControl className={isMobileApp?classes.inputM:classes.inputDF}>
                                <InputLabel>Склад</InputLabel>
                                <Select value={warehouse&&warehouse._id} onChange={handleWarehouse}>
                                    {warehouses.map((element)=>
                                        <MenuItem key={element._id} value={element._id}>{element.name}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            :
                            <TextField
                                label='Склад'
                                value={warehouse?warehouse.name:'Основной'}
                                className={isMobileApp?classes.inputM:classes.inputDF}
                                inputProps={{readOnly: true}}
                            />
                        }
                        <br/>
                        {['admin', 'суперорганизация', 'агент', 'организация', 'менеджер'].includes(profile.role)?
                            <div style={{ justifyContent: 'center' }} className={classes.row}>
                                <div style={{background: selectType==='Все'?'#ffb300':'#ffffff'}} onClick={() => setSelectType('Все')} className={classes.selectType}>
                                    Все
                                </div>
                                <div style={{background: selectType==='Свободные'?'#ffb300':'#ffffff'}} onClick={() => setSelectType('Свободные')} className={classes.selectType}>
                                    {`Своб. ${unselectedClient.length}`}
                                </div>
                                <div style={{background: selectType==='Выбранные'?'#ffb300':'#ffffff'}} onClick={() => setSelectType('Выбранные')} className={classes.selectType}>
                                    {`Выбр. ${client.length}`}
                                </div>
                            </div>
                            :
                            null
                        }
                        <br/>
                        <div className={classes.listInvoices}>
                            {filtredClient?filtredClient.map((element, idx)=> {
                                if(idx<pagination)
                                    return (
                                        <div key={element._id} style={isMobileApp ? {alignItems: 'baseline'} : {}}
                                             className={isMobileApp ? classes.column : classes.row}>
                                            {['admin', 'суперорганизация', 'агент', 'организация', 'менеджер'].includes(profile.role)?
                                                <Checkbox checked={client.includes(element)}
                                                          onChange={() => {
                                                              if(!client.includes(element)) {
                                                                  client.push(element)
                                                                  unselectedClient.splice(unselectedClient.indexOf(element), 1)
                                                              } else {
                                                                  client.splice(client.indexOf(element), 1)
                                                                  unselectedClient.push(element)
                                                              }
                                                              setClient([...client])
                                                          }}
                                                />
                                                :
                                                null
                                            }
                                            <CardClient buy={client.includes(element)} list={filtredClient} element={element}/>
                                        </div>
                                    )
                                else return null
                            }):null}
                        </div>
                        <div className={isMobileApp?classes.bottomRouteM:classes.bottomRouteD}>
                            <Button onClick={() => {
                                setFullDialog('Маршрут', <GeoRouteAgent clients={client} unselectedClient={unselectedClient} selectClient={selectClient}/>)
                                showFullDialog(true)
                            }} size='small' color='primary'>
                                Карта
                            </Button>
                            {
                                ['admin', 'суперорганизация', 'агент', 'организация', 'менеджер'].includes(profile.role)?
                                    router.query.id==='new'?
                                        <Button onClick={() => {
                                            if(name&&organization) {
                                                const action = async () => {
                                                    client = client.map(element=>element._id)
                                                    const res = await addDistrict({
                                                        organization: organization._id,
                                                        client,
                                                        name,
                                                        agent: agent&&agent._id,
                                                        warehouse: warehouse&&warehouse._id,
                                                        manager: manager&&manager._id,
                                                        ecspeditor: ecspeditor&&ecspeditor._id,
                                                    })
                                                    if(res)
                                                        Router.push(`/district/${res}`)
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
                                            <Button onClick={() => {
                                                const action = async () => {
                                                    let editElement = {_id: data.district._id, client: client.map(element=>element._id)}
                                                    if(agent) agent = agent._id
                                                    if(!data.district.agent||agent!==data.district.agent._id)editElement.agent = agent;
                                                    if(warehouse) warehouse = warehouse._id
                                                    if(!data.district.warehouse||warehouse!==data.district.warehouse._id)editElement.warehouse = warehouse;
                                                    if(manager) manager = manager._id
                                                    if(!data.district.manager||manager!==data.district.manager._id)editElement.manager = manager;
                                                    if(ecspeditor) ecspeditor = ecspeditor._id
                                                    if(!data.district.ecspeditor||ecspeditor!==data.district.ecspeditor._id)editElement.ecspeditor = ecspeditor;
                                                    if(name!==data.district.name)editElement.name = name;
                                                    await setDistrict(editElement)
                                                }
                                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                showMiniDialog(true)
                                            }} size='small' color='primary'>
                                                Сохранить
                                            </Button>
                                            {['суперорганизация', 'организация', 'admin'].includes(profile.role)?
                                                <>
                                                    <Button onClick={() => {
                                                        const action = async () => {
                                                            await deleteDistrict(data.district._id)
                                                            Router.push(`/districts/${data.district.organization?data.district.organization._id:'super'}`)
                                                        }
                                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                        showMiniDialog(true)
                                                    }} size='small' color='secondary'>
                                                        Удалить
                                                    </Button>
                                                </>
                                                :
                                                null
                                            }
                                        </>
                                    :
                                    null
                            }
                        </div>
                    </CardContent>
                    :
                    <CardContent className={classes.column}>
                        Ничего не найдено
                    </CardContent>
                }
            </Card>
        </App>
    )
})

District.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['суперорганизация', 'организация', 'admin', 'агент', 'суперагент', 'менеджер'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
                Router.push('/contact')
    // eslint-disable-next-line no-undef
    const [district, organizations] = await Promise.all([
        ctx.query.id!=='new'?getDistrict(ctx.query.id, getClientGqlSsr(ctx.req)):null,
        ctx.query.id==='new'?getOrganizations({search: '', filter: ''}, getClientGqlSsr(ctx.req)):null
    ])
    return {
        data: {
            district,
            ...organizations?{organizations: [{name: 'AZYK.STORE', _id: 'super'}, ...organizations]}:{}
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
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(District);
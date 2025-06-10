import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import { getOrganizations } from '../../src/gql/organization'
import { getDistrict, setDistrict, deleteDistrict, addDistrict } from '../../src/gql/district'
import { getAgents, getEcspeditors, getManagers } from '../../src/gql/employment'
import { getClientsWithoutDistrict } from '../../src/gql/client'
import districtStyle from '../../src/styleMUI/district/district'
import { useRouter } from 'next/router'
import Card from '@material-ui/core/Card';
import CardClient from '../../components/client/CardClient';
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
    const { profile } = props.user;
    const classes = districtStyle();
    const { data } = props;
    const router = useRouter()
    const {search, isMobileApp, city } = props.app;
    let [pagination, setPagination] = useState(100);
    const checkPagination = ()=>{
        if(pagination<allClient.length){
            setPagination(pagination+100)
        }
    }

    let [name, setName] = useState(data.district?data.district.name:'');
    let handleName =  (event) => {
        setName(event.target.value)
    };
    let [manager, setManager] = useState(data.district&&data.district.manager?data.district.manager:{});
    let handleManager =  (event) => {
        setManager({_id: event.target.value, name: event.target.name})
    };
    let [agent, setAgent] = useState(data.district&&data.district.agent?data.district.agent:{});
    let handleAgent =  (event) => {
        setAgent({_id: event.target.value, name: event.target.name})
    };
    let [warehouse, setWarehouse] = useState(data.district&&data.district.warehouse?data.district.warehouse:{});
    let handleWarehouse =  (event) => {
        setWarehouse({_id: event.target.value, name: event.target.name})
    };
    let [ecspeditor, setEcspeditor] = useState(data.district&&data.district.ecspeditor?data.district.ecspeditor:{});
    let handleEcspeditor =  (event) => {
        setEcspeditor({_id: event.target.value, name: event.target.name})
    };
    let [organization, setOrganization] = useState(router.query.id==='new'||!data.district?{}:data.district.organization?{_id: data.district.organization._id, name: data.district.organization.name}:{name: 'AZYK.STORE', _id: 'super'});
    let handleOrganization =  (event) => {
        setOrganization({_id: event.target.value, name: event.target.name})
    };
    let [client, setClient] = useState(data.district?data.district.client:[]);
    let [allClient, setAllClient] = useState([]);
    let [filtredClient, setFiltredClient] = useState([]);
    let [unselectedClient, setUnselectedClient] = useState([]);
    let [agents, setAgents] = useState([]);
    let [warehouses, setWarehouses] = useState([]);
    let [ecspeditors, setEcspeditors] = useState([]);
    let [managers, setManagers] = useState([]);
    let [selectType, setSelectType] = useState(['admin', 'суперорганизация', 'организация', 'менеджер'].includes(profile.role)?'Все':'Выбраные');
    const { setMiniDialog, showMiniDialog, setFullDialog, showFullDialog } = props.mini_dialogActions;
    const { showSnackBar } = props.snackbarActions;
    const selectClient = (i)=>{
        client.push(unselectedClient[i])
        unselectedClient.splice(i, 1)
        setClient([...client])
        setUnselectedClient([...unselectedClient])
    }
    const initialRender = useRef(true);
    let [organizations, setOrganizations] = useState(data.organizations);
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            } else {
                if(router.query.id==='new') {
                    setOrganizations((await getOrganizations({search: '', filter: '', city: city})).organizations)
                    setOrganization({})
                    setUnselectedClient([])
                }
                else{
                    if(city)
                        setUnselectedClient((await getClientsWithoutDistrict({
                            ...router.query.id!=='new'?{district: data.district._id}:{},
                            organization: organization._id, city})).clientsWithoutDistrict)
                    else
                        setUnselectedClient([])
                }
            }
        })()
    },[city])
    useEffect(()=>{
        (async()=>{
            if(router.query.id==='new'&&profile.organization){
                let organzation = organizations.filter(organization=>organization._id===profile.organization)
                setOrganization(organzation[0])
            }
        })()
    },[profile])
    useEffect(()=>{
        (async()=>{
            if(data.district) {
                if (router.query.id === 'new') {
                    setAgent({})
                    setWarehouse({})
                    setManager({})
                    setEcspeditor({})
                }
                if(organization._id) {
                    setAgents((await getAgents({_id: organization._id})).agents)
                    setManagers((await getManagers({_id: organization._id})).managers)
                    setEcspeditors((await getEcspeditors({_id: organization._id})).ecspeditors)
                    setUnselectedClient((await getClientsWithoutDistrict({
                        organization: organization._id,
                        ...router.query.id!=='new'?{district: data.district._id}:{},
                        city: city?city:data.district.organization&&data.district.organization.cities[0]
                    })).clientsWithoutDistrict)
                    setWarehouses((await getWarehouses({search: '', organization: organization._id})))

                }
            }
        })()
    },[organization])
    useEffect(()=>{
        (async()=>{
            if(data.district) {
                setPagination(100)
                let allClient= []
                if (selectType == 'Все')
                    allClient=[...client, ...unselectedClient]
                else if (selectType == 'Свободные')
                    allClient=[...unselectedClient]
                else if (selectType == 'Выбраные')
                    allClient=[...client]
                let filtredClient = [...allClient]
                if(search.length>0)
                    filtredClient = filtredClient.filter(element=>
                        ((element.phone.filter(phone => phone.toLowerCase().includes(search.toLowerCase()))).length > 0) ||
                        (element.name.toLowerCase()).includes(search.toLowerCase())||
                        ((element.address.filter(addres=>addres[0]&&addres[0].toLowerCase().includes(search.toLowerCase()))).length>0)||
                        ((element.address.filter(addres=>addres[2]&&addres[2].toLowerCase().includes(search.toLowerCase()))).length>0)
                    )
                setFiltredClient([...filtredClient])
                setAllClient(allClient)
            }
        })()
    },[selectType, unselectedClient, client])
    useEffect(()=>{
        (async()=>{
            if(data.district&&allClient.length>0) {
                let filtredClient = [...allClient]
                if(search.length>0)
                    filtredClient = filtredClient.filter(element=>
                        (element.name.toLowerCase()).includes(search.toLowerCase())||
                        ((element.address.filter(addres=>addres[0]&&addres[0].toLowerCase().includes(search.toLowerCase()))).length>0)||
                        ((element.address.filter(addres=>addres[2]&&addres[2].toLowerCase().includes(search.toLowerCase()))).length>0)
                    )
                setFiltredClient([...filtredClient])
            }
        })()
    },[search])
    return (
        <App cityShow cities={router.query.id!=='new'&&data.district&&data.district.organization?data.district.organization.cities:null} searchShow={true} checkPagination={checkPagination} pageName={data.district?router.query.id==='new'?'Добавить':data.district.name:'Ничего не найдено'}>
            <Head>
                <title>{data.district?router.query.id==='new'?'Добавить':data.district.name:'Ничего не найдено'}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={isMobileApp?classes.pageM:classes.pageD}>
                {data.district?
                    <>
                    <CardContent className={classes.column}>
                        {data.district?
                            <>
                            <TextField
                                label='Название'
                                value={name}
                                className={isMobileApp?classes.inputM:classes.inputDF}
                                onChange={handleName}
                                inputProps={{
                                    'aria-label': 'description',
                                    readOnly: ['менеджер', 'агент', 'суперагент'].includes(profile.role),
                                }}
                            />
                            {(router.query.id==='new')&&profile.role==='admin'?
                                <FormControl className={isMobileApp?classes.inputM:classes.inputDF}>
                                    <InputLabel>Организация</InputLabel>
                                    <Select value={organization._id}onChange={handleOrganization}>
                                        {organizations.map((element)=>
                                            <MenuItem key={element._id} value={element._id} ola={element.name}>{element.name}</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                                :
                                <TextField
                                    label='Организация'
                                    value={organization.name}
                                    className={isMobileApp?classes.inputM:classes.inputDF}
                                    inputProps={{
                                        'aria-label': 'description',
                                        readOnly: true
                                    }}
                                />
                            }
                            {['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                                <FormControl className={isMobileApp ? classes.inputM : classes.inputDF}>
                                    <InputLabel>Менеджер</InputLabel>
                                    <Select value={manager._id} onChange={handleManager}>
                                        {managers.map((element) =>
                                            <MenuItem key={element._id} value={element._id}
                                                      ola={element.name}>{element.name}</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                                :
                                <TextField
                                    label='Менеджер'
                                    value={manager.name}
                                    className={isMobileApp?classes.inputM:classes.inputDF}
                                    inputProps={{
                                        'aria-label': 'description',
                                        readOnly: true
                                    }}
                                />
                            }
                            {['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                                <FormControl className={isMobileApp?classes.inputM:classes.inputDF}>
                                    <InputLabel>Агент</InputLabel>
                                    <Select value={agent._id} onChange={handleAgent}>
                                        {agents.map((element)=>
                                            <MenuItem key={element._id} value={element._id} ola={element.name}>{element.name}</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                                :
                                <TextField
                                    label='Агент'
                                    value={agent.name}
                                    className={isMobileApp?classes.inputM:classes.inputDF}
                                    inputProps={{
                                        'aria-label': 'description',
                                        readOnly: true
                                    }}
                                />
                            }
                            {['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                                <FormControl className={isMobileApp?classes.inputM:classes.inputDF}>
                                    <InputLabel>Экспедитор</InputLabel>
                                    <Select value={ecspeditor._id} onChange={handleEcspeditor}>
                                        {ecspeditors.map((element)=>
                                            <MenuItem key={element._id} value={element._id} ola={element.name}>{element.name}</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                                :
                                <TextField
                                    label='Экспедитор'
                                    value={ecspeditor.name}
                                    className={isMobileApp?classes.inputM:classes.inputDF}
                                    inputProps={{
                                        'aria-label': 'description',
                                        readOnly: true
                                    }}
                                />
                            }
                            {['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                                    <FormControl className={isMobileApp?classes.inputM:classes.inputDF}>
                                        <InputLabel>Склад</InputLabel>
                                        <Select value={warehouse._id} onChange={handleWarehouse}>
                                            {warehouses.map((element)=>
                                                <MenuItem key={element._id} value={element._id} ola={element.name}>{element.name}</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                    :
                                    <TextField
                                        label='Склад'
                                        value={warehouse?warehouse.name:'Основной'}
                                        className={isMobileApp?classes.inputM:classes.inputDF}
                                        inputProps={{
                                            'aria-label': 'description',
                                            readOnly: true
                                        }}
                                    />
                                }
                            <br/>
                            {['admin', 'суперорганизация', 'агент', 'организация', 'менеджер'].includes(profile.role)?
                                <div style={{ justifyContent: 'center' }} className={classes.row}>
                                    <div style={{background: selectType==='Все'?'#ffb300':'#ffffff'}} onClick={()=>{setSelectType('Все')}} className={classes.selectType}>
                                        Все
                                    </div>
                                    <div style={{background: selectType==='Свободные'?'#ffb300':'#ffffff'}} onClick={()=>{setSelectType('Свободные')}} className={classes.selectType}>
                                        {`Своб. ${unselectedClient.length}`}
                                    </div>
                                    <div style={{background: selectType==='Выбраные'?'#ffb300':'#ffffff'}} onClick={()=>{setSelectType('Выбраные')}} className={classes.selectType}>
                                        {`Выбр. ${client.length}`}
                                    </div>
                                </div>
                                :
                                null
                            }
                            <br/>
                            <div className={classes.listInvoices}>
                                {filtredClient?filtredClient.map((element, idx)=> {
                                    if (idx <= pagination)
                                        return (
                                            <div key={element._id} style={isMobileApp ? {alignItems: 'baseline'} : {}}
                                                     className={isMobileApp ? classes.column : classes.row}>
                                                {['admin', 'суперорганизация', 'агент', 'организация', 'менеджер'].includes(profile.role)?
                                                    <Checkbox checked={client.includes(element)}
                                                              onChange={() => {
                                                                  if (!client.includes(element)) {
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
                                <Button onClick={async()=>{
                                    setFullDialog('Маршрут', <GeoRouteAgent clients={client} unselectedClient={unselectedClient} selectClient={selectClient}/>)
                                    showFullDialog(true)
                                }} size='small' color='primary'>
                                    Карта
                                </Button>
                                {
                                    ['admin', 'суперорганизация', 'агент', 'организация', 'менеджер'].includes(profile.role)?
                                        router.query.id==='new'?
                                            <Button onClick={async()=>{
                                                if (name.length>0) {
                                                    const action = async() => {
                                                        client = client.map(element=>element._id)
                                                        await addDistrict({
                                                            organization: organization._id,
                                                            client: client,
                                                            name: name,
                                                            agent: agent._id,
                                                            warehouse: warehouse._id,
                                                            manager: manager._id,
                                                            ecspeditor: ecspeditor._id,
                                                        })
                                                        Router.push(`/districts/${organization._id}`)
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
                                                const action = async() => {
                                                    let editElement = {_id: data.district._id, client: client.map(element=>element._id)}
                                                    if(!data.district.agent||agent._id!==data.district.agent._id)editElement.agent = agent._id;
                                                    if(!data.district.warehouse||warehouse._id!==data.district.warehouse._id)editElement.warehouse = warehouse._id;
                                                    if(!data.district.manager||manager._id!==data.district.manager._id)editElement.manager = manager._id;
                                                    if(!data.district.ecspeditor||ecspeditor._id!==data.district.ecspeditor._id)editElement.ecspeditor = ecspeditor._id;
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
                                                <Button onClick={async()=>{
                                                    const action = async() => {
                                                        await deleteDistrict([data.district._id])
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
                            </>
                            :'Ничего не найдено'}
                        <br/>
                    </CardContent>
                    </>
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
    return {
        data: {
            ...ctx.query.id!=='new'?await getDistrict({_id: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined): {district: {organization: {}, client: [], name: '', agent: {}, ecspeditor: {}}},
            organizations: [{name: 'AZYK.STORE', _id: 'super'}, ...(await getOrganizations({search: '', filter: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined)).organizations],
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
import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import { getOrganizations } from '../../src/gql/organization'
import { getAgentRoute, setAgentRoute, deleteAgentRoute, addAgentRoute, getDistrictsWithoutAgentRoutes } from '../../src/gql/agentRoute'
import agentRouteStyle from '../../src/styleMUI/agentRoute/agentRoute'
import { useRouter } from 'next/router'
import Card from '@material-ui/core/Card';
import CardClient from '../../components/card/CardClient';
import CardContent from '@material-ui/core/CardContent';
import Checkbox from '@material-ui/core/Checkbox';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
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
import VerticalAlignBottom from '@material-ui/icons/VerticalAlignBottom';
import VerticalAlignTop from '@material-ui/icons/VerticalAlignTop';
import GeoRouteAgent from '../../components/dialog/GeoRouteAgent'
import {getDistrict} from '../../src/gql/district';

const Confirmation = dynamic(() => import('../../components/dialog/Confirmation'))

const AgentRoute = React.memo((props) => {
    const classes = agentRouteStyle();
    const router = useRouter()
    //props
    const {profile} = props.user;
    const {data} = props;
    const {search, isMobileApp, city} = props.app;
    //pagination
    const [pagination, setPagination] = useState(100);
    const initialRender = useRef(true);
    let [organizations, setOrganizations] = useState(data.organizations);
    let [districts, setDistricts] = useState([]);
    let [district, setDistrict] = useState(data.agentRoute?data.agentRoute.district:null)
    let handleDistrict = async (event) => {
        district = await getDistrict(event.target.value)
        setDistrict(district)
        setClients([[],[],[],[],[],[],[]])
    };
    let [organization, setOrganization] = useState(router.query.id==='new'||!data.agentRoute?null:data.agentRoute.organization?data.agentRoute.organization:{name: 'AZYK.STORE', _id: 'super'});
    let handleOrganization = (event) => {
        setOrganization({_id: event.target.value})
        setClients([[],[],[],[],[],[],[]])
    };
    let [clients, setClients] = useState(data.agentRoute?data.agentRoute.clients:[[],[],[],[],[],[],[]]);
    let [allClient, setAllClient] = useState([]);
    const isEdit = ['суперорганизация', 'организация', 'admin', 'менеджер'].includes(profile.role)
    let [selectType, setSelectType] = useState(isEdit?'Все':'Выбранные');
    let [filtredClient, setFiltredClient] = useState([]);
    const checkPagination = useCallback(() => {
        if(pagination<filtredClient.length)
            setPagination(pagination => pagination+100)
    }, [pagination, filtredClient])
    let [dayWeek, setDayWeek] = useState(() => (new Date().getDay() + 6) % 7);
    const {setMiniDialog, showMiniDialog, showFullDialog, setFullDialog} = props.mini_dialogActions;
    const {showSnackBar} = props.snackbarActions;
    useEffect(() => {
        if(router.query.id==='new'&&profile.organization)
            setOrganization(organizations.find(organization=>organization._id===profile.organization))
    }, [profile])
    useEffect(() => {(async () => {
        if(!initialRender.current&&router.query.id==='new'&&organization) {
            setDistricts(await getDistrictsWithoutAgentRoutes({organization: organization._id}))
            setDistrict(null)
        }
    })()}, [organization])
    useEffect(() => {
        if(district) {
            setPagination(100)
            let allClient= []
            if(selectType == 'Все')
                allClient=[...district.client]
            else if(selectType == 'Свободные')
                allClient=district.client.filter(client=>!clients[dayWeek].includes(client._id))
            else if(selectType == 'Выбранные')
                allClient = clients[dayWeek].map(client=>district.client.find(client1=>client1._id===client))
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
        }
    }, [selectType, clients, district, dayWeek])
    useEffect(() => {
        if(district&&allClient.length) {
            let filtredClient = [...allClient]
            if(search)
                filtredClient = filtredClient.filter(element => element&&((element.name.toLowerCase()).includes(search.toLowerCase()) ||
                        ((element.address.filter(addres => addres[0] && addres[0].toLowerCase().includes(search.toLowerCase()))).length) ||
                        ((element.address.filter(addres => addres[2] && addres[2].toLowerCase().includes(search.toLowerCase()))).length))
                )
            setFiltredClient([...filtredClient])
        }
    }, [search, district])
    useEffect(() => {(async () => {
        if(initialRender.current)
            initialRender.current = false;
        else {
            setOrganizations(await getOrganizations({search: '', filter: '', city}))
            setOrganization(null)
        }
    })()}, [city])
    return (
        <App cityShow={router.query.id==='new'} searchShow checkPagination={checkPagination} pageName={router.query.id==='new'?'Добавить':data.agentRoute?data.agentRoute.district.name:'Ничего не найдено'}>
            <Head>
                <title>{router.query.id==='new'?'Добавить':data.agentRoute?data.agentRoute.district.name:'Ничего не найдено'}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={isMobileApp?classes.pageM:classes.pageD}>
                <CardContent className={classes.column}>
                    {router.query.id==='new'||data.agentRoute?
                        <>
                        {router.query.id==='new'&&profile.role==='admin'?
                            <FormControl error={!organization} className={isMobileApp?classes.inputM:classes.inputDF}>
                                <InputLabel>Организация</InputLabel>
                                <Select value={organization&&organization._id} onChange={handleOrganization}>
                                    {organizations.map((element) =>
                                        <MenuItem key={element._id} value={element._id}>{element.name}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            :
                            null
                        }
                        {router.query.id==='new'?
                            <FormControl error={!district} className={isMobileApp?classes.inputM:classes.inputDF}>
                                <InputLabel>Район</InputLabel>
                                <Select value={district&&district._id} onChange={handleDistrict}>
                                    {districts.map((element) =>
                                        <MenuItem key={element._id} value={element._id}>{element.name}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            :
                            <TextField
                                label='Район'
                                value={district&&district.name}
                                className={isMobileApp?classes.inputM:classes.inputDF}
                                inputProps={{readOnly: true}}
                            />
                        }
                        <br/>
                            {isEdit?<>
                                <div style={{ justifyContent: 'center' }} className={classes.row}>
                                    <div style={{background: selectType==='Все'?'#ffb300':'#ffffff'}} onClick={() => setSelectType('Все')} className={classes.selectType}>
                                        Все
                                    </div>
                                    <div style={{background: selectType==='Свободные'?'#ffb300':'#ffffff'}} onClick={() => setSelectType('Свободные')} className={classes.selectType}>
                                        Своб
                                    </div>
                                    <div style={{background: selectType==='Выбранные'?'#ffb300':'#ffffff'}} onClick={() => setSelectType('Выбранные')} className={classes.selectType}>
                                        Выбр
                                    </div>
                                </div>
                                <br/>
                            </>:null}
                            <div style={{ justifyContent: 'center' }} className={classes.row}>
                                <div style={{background: dayWeek===0?'#ffb300':'#ffffff'}} onClick={() => {setDayWeek(0)}} className={classes.selectType}>
                                    {`ПН ${clients[0].length}`}
                                </div>
                                <div style={{background: dayWeek===1?'#ffb300':'#ffffff'}} onClick={() => {setDayWeek(1)}} className={classes.selectType}>
                                    {`ВТ ${clients[1].length}`}
                                </div>
                                <div style={{background: dayWeek===2?'#ffb300':'#ffffff'}} onClick={() => {setDayWeek(2)}} className={classes.selectType}>
                                    {`СР ${clients[2].length}`}
                                </div>
                                <div style={{background: dayWeek===3?'#ffb300':'#ffffff'}} onClick={() => {setDayWeek(3)}} className={classes.selectType}>
                                    {`ЧТ ${clients[3].length}`}
                                </div>
                                <div style={{background: dayWeek===4?'#ffb300':'#ffffff'}} onClick={() => {setDayWeek(4)}} className={classes.selectType}>
                                    {`ПТ ${clients[4].length}`}
                                </div>
                                <div style={{background: dayWeek===5?'#ffb300':'#ffffff'}} onClick={() => {setDayWeek(5)}} className={classes.selectType}>
                                    {`СБ ${clients[5].length}`}
                                </div>
                                <div style={{background: dayWeek===6?'#ffb300':'#ffffff'}} onClick={() => {setDayWeek(6)}} className={classes.selectType}>
                                    {`ВС ${clients[6].length}`}
                                </div>
                            </div>
                            <br/>
                            <div className={classes.listInvoices}>
                                {filtredClient?filtredClient.map((element, idx) => {
                                    if(idx<pagination && element) {
                                        let selected = clients[dayWeek].includes(element._id)
                                        return (
                                            <div key={element._id} style={isMobileApp ? {alignItems: 'baseline'} : {}}
                                                 className={isMobileApp ? classes.column : classes.row}>
                                                <div className={isMobileApp ? classes.row : classes.column}>
                                                    {isEdit?<Checkbox checked={selected}
                                                              onChange={() => {
                                                                  if(!selected) {
                                                                      clients[dayWeek].push(element._id)
                                                                  } else {
                                                                      clients[dayWeek].splice(clients[dayWeek].indexOf(element._id), 1)
                                                                  }
                                                                  setClients([...clients])
                                                              }}
                                                    />:null}
                                                    {
                                                        selectType==='Выбранные'?
                                                            <>
                                                            {
                                                                filtredClient[idx-1]?
                                                                    <Tooltip title='Вверх'>
                                                                        <IconButton
                                                                            onClick={() => {
                                                                                clients[dayWeek][idx] = filtredClient[idx - 1]._id
                                                                                clients[dayWeek][idx - 1] = filtredClient[idx]._id
                                                                                setClients([...clients])
                                                                            }}
                                                                            color='inherit'
                                                                        >
                                                                            <VerticalAlignTop />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    :null
                                                            }
                                                            {
                                                                filtredClient[idx+1]?
                                                                    <Tooltip title='Вниз'>
                                                                        <IconButton
                                                                            onClick={() => {
                                                                                clients[dayWeek][idx] = filtredClient[idx + 1]._id
                                                                                clients[dayWeek][idx + 1] = filtredClient[idx]._id
                                                                                setClients([...clients])
                                                                            }}
                                                                            color='inherit'
                                                                        >
                                                                            <VerticalAlignBottom />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    :null
                                                            }
                                                            </>
                                                            :
                                                            null
                                                    }
                                                </div>
                                                <CardClient element={element} buy/>
                                            </div>
                                        )
                                    }
                                    else return null
                                }):null}
                            </div>
                        <div className={isMobileApp?classes.bottomRouteM:classes.bottomRouteD}>
                            <Button onClick={() => {
                                let map = district.client.filter(client => clients[dayWeek].includes(client._id))
                                setFullDialog('Маршрут', <GeoRouteAgent clients={map}/>)
                                showFullDialog(true)
                            }} size='small' color='primary'>
                                Карта
                            </Button>
                            {
                                router.query.id==='new'?
                                    <Button onClick={() => {
                                        if(district&&organization) {
                                            const action = async () => {
                                                const res = await addAgentRoute({
                                                    organization: organization._id,
                                                    clients: clients,
                                                    district: district._id,
                                                })
                                                if(res)
                                                    Router.push(`/agentroute/${res}`)
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
                                        const action = async () => await setAgentRoute({_id: data.agentRoute._id, clients})
                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                        showMiniDialog(true)
                                    }} size='small' color='primary'>
                                        Сохранить
                                    </Button>
                                    {isEdit?
                                        <>
                                        <Button onClick={() => {
                                            const action = async () => {
                                                await deleteAgentRoute(data.agentRoute._id)
                                                Router.push(`/agentroutes/${data.agentRoute.organization._id}`)
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
                            }
                        </div>
                            </>
                        :'Ничего не найдено'}
                </CardContent>
            </Card>
        </App>
    )
})

AgentRoute.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['суперорганизация', 'организация', 'admin', 'менеджер', 'суперагент', 'агент'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
                Router.push('/contact')
    // eslint-disable-next-line no-undef
    const [agentRoute, organizations] = await Promise.all([
        ctx.query.id!=='new'?getAgentRoute(ctx.query.id, getClientGqlSsr(ctx.req)):null,
        ctx.query.id==='new'?getOrganizations({search: '', filter: ''}, getClientGqlSsr(ctx.req)):null
    ])
    return {
        data: {
            agentRoute,
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

export default connect(mapStateToProps, mapDispatchToProps)(AgentRoute);
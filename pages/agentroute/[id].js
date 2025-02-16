import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import { getOrganizations } from '../../src/gql/organization'
import { getAgentRoute, setAgentRoute, deleteAgentRoute, addAgentRoute, getDistrictsWithoutAgentRoutes } from '../../src/gql/agentRoute'
import agentRouteStyle from '../../src/styleMUI/agentRoute/agentRoute'
import { useRouter } from 'next/router'
import Card from '@material-ui/core/Card';
import CardClient from '../../components/client/CardClient';
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
import { urlMain } from '../../redux/constants/other'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import CardClientPlaceholder from '../../components/client/CardClientPlaceholder'
import LazyLoad from 'react-lazyload';
import VerticalAlignBottom from '@material-ui/icons/VerticalAlignBottom';
import VerticalAlignTop from '@material-ui/icons/VerticalAlignTop';
import GeoRouteAgent from '../../components/dialog/GeoRouteAgent'
import { forceCheck } from 'react-lazyload';
const height = 140

const Confirmation = dynamic(() => import('../../components/dialog/Confirmation'))

const AgentRoute = React.memo((props) => {
    const { profile } = props.user;
    const classes = agentRouteStyle();
    const { data } = props;
    const router = useRouter()
    const {search, isMobileApp, city } = props.app;
    let [pagination, setPagination] = useState(100);
    const initialRender = useRef(true);
    let [organizations, setOrganizations] = useState(data.organizations);
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            } else {
                setOrganizations((await getOrganizations({search: '', filter: '', city: city})).organizations)
                setOrganization({})
            }
        })()
    },[city])
    const checkPagination = ()=>{
        if(pagination<filtredClient.length){
            setPagination(pagination+100)
        }
    }
    let [districts, setDistricts] = useState([]);
    let [district, setDistrict] = useState(data.agentRoute&&data.agentRoute.district?data.agentRoute.district:{})
    let handleDistrict =  (event) => {
        let district = (districts.filter(district=>district._id===event.target.value))[0]
        setDistrict(district)
        setClients([[],[],[],[],[],[],[]])
    };
    let [organization, setOrganization] = useState(router.query.id==='new'||!data.agentRoute?{}:data.agentRoute.organization?{_id: data.agentRoute.organization._id, name: data.agentRoute.organization.name}:{name: 'AZYK.STORE', _id: 'super'});
    let handleOrganization =  (event) => {
        setOrganization({_id: event.target.value, name: event.target.name})
        setClients([[],[],[],[],[],[],[]])
    };
    let [clients, setClients] = useState(data.agentRoute?data.agentRoute.clients:[[],[],[],[],[],[],[]]);
    let [allClient, setAllClient] = useState([]);
    let [selectType, setSelectType] = useState(['агент', 'суперагент'].includes(profile.role)?'Выбраные':'Все');
    let [filtredClient, setFiltredClient] = useState([]);
    let [dayWeek, setDayWeek] = useState(0);
    const { setMiniDialog, showMiniDialog, showFullDialog, setFullDialog } = props.mini_dialogActions;
    const { showSnackBar } = props.snackbarActions;
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
            if(router.query.id==='new'&&data.agentRoute&&organization._id) {
                setDistricts((await getDistrictsWithoutAgentRoutes({organization: organization._id})).districtsWithoutAgentRoutes)
                setDistrict({})
            }
        })()
    },[organization])
    useEffect(()=>{
        (async()=>{
            if(data.agentRoute&&district.client) {
                setPagination(100)
                let allClient= []
                if (selectType == 'Все')
                    allClient=[...district.client]
                else if (selectType == 'Свободные')
                    allClient=district.client.filter(client=>!clients[dayWeek].includes(client._id))
                else if (selectType == 'Выбраные')
                    allClient = clients[dayWeek].map(client=>district.client.find(client1=>client1._id===client))
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
    },[selectType, clients, district, dayWeek])
    useEffect(()=>{
        (async()=>{
            if(data.agentRoute&&district.client&&allClient.length>0) {
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
    },[search, district])
    useEffect(()=>{
        (async()=>{
            forceCheck()
        })()
    },[filtredClient])
    return (
        <App cityShow={router.query.id==='new'} searchShow={true} checkPagination={checkPagination} pageName={data.agentRoute?router.query.id==='new'?'Добавить':data.agentRoute.name:'Ничего не найдено'}>
            <Head>
                <title>{data.agentRoute?router.query.id==='new'?'Добавить':data.agentRoute.district.name:'Ничего не найдено'}</title>
                <meta name='description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:title' content={data.agentRoute?router.query.id==='new'?'Добавить':data.agentRoute.district.name:'Ничего не найдено'} />
                <meta property='og:description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:type' content='website' />
                <meta property='og:image' content={`${urlMain}/static/512x512.png`} />
                <meta property="og:url" content={`${urlMain}/agentroute/${router.query.id}`} />
                <link rel='canonical' href={`${urlMain}/agentroute/${router.query.id}`}/>
            </Head>
            <Card className={isMobileApp?classes.pageM:classes.pageD}>
                <CardContent className={classes.column}>
                    {data.agentRoute?
                        <>
                        {router.query.id==='new'&&profile.role==='admin'?
                            <FormControl className={isMobileApp?classes.inputM:classes.inputDF}>
                                <InputLabel>Организация</InputLabel>
                                <Select value={organization._id}onChange={handleOrganization}>
                                    {organizations.map((element)=>
                                        <MenuItem key={element._id} value={element._id} ola={element.name}>{element.name}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            :
                            null
                        }
                        {router.query.id==='new'?
                            <FormControl className={isMobileApp?classes.inputM:classes.inputDF}>
                                <InputLabel>Район</InputLabel>
                                <Select value={district._id} onChange={handleDistrict}>
                                    {districts.map((element)=>
                                        <MenuItem key={element._id} value={element._id} ola={element.name}>{element.name}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            :
                            <TextField
                                label='Район'
                                value={district.name}
                                className={isMobileApp?classes.inputM:classes.inputDF}
                                inputProps={{
                                    'aria-label': 'description',
                                    readOnly: true
                                }}
                            />
                        }
                        <br/>
                        <div style={{ justifyContent: 'center' }} className={classes.row}>
                            <div style={{background: selectType==='Все'?'#ffb300':'#ffffff'}} onClick={()=>{setSelectType('Все')}} className={classes.selectType}>
                                Все
                            </div>
                            <div style={{background: selectType==='Свободные'?'#ffb300':'#ffffff'}} onClick={()=>{setSelectType('Свободные')}} className={classes.selectType}>
                                Своб
                            </div>
                            <div style={{background: selectType==='Выбраные'?'#ffb300':'#ffffff'}} onClick={()=>{setSelectType('Выбраные')}} className={classes.selectType}>
                                Выбр
                            </div>
                        </div>
                        <br/>
                            <div style={{ justifyContent: 'center' }} className={classes.row}>
                                <div style={{background: dayWeek===0?'#ffb300':'#ffffff'}} onClick={()=>{setDayWeek(0)}} className={classes.selectType}>
                                    {`ПН ${clients[0].length}`}
                                </div>
                                <div style={{background: dayWeek===1?'#ffb300':'#ffffff'}} onClick={()=>{setDayWeek(1)}} className={classes.selectType}>
                                    {`ВТ ${clients[1].length}`}
                                </div>
                                <div style={{background: dayWeek===2?'#ffb300':'#ffffff'}} onClick={()=>{setDayWeek(2)}} className={classes.selectType}>
                                    {`СР ${clients[2].length}`}
                                </div>
                                <div style={{background: dayWeek===3?'#ffb300':'#ffffff'}} onClick={()=>{setDayWeek(3)}} className={classes.selectType}>
                                    {`ЧТ ${clients[3].length}`}
                                </div>
                                <div style={{background: dayWeek===4?'#ffb300':'#ffffff'}} onClick={()=>{setDayWeek(4)}} className={classes.selectType}>
                                    {`ПТ ${clients[4].length}`}
                                </div>
                                <div style={{background: dayWeek===5?'#ffb300':'#ffffff'}} onClick={()=>{setDayWeek(5)}} className={classes.selectType}>
                                    {`СБ ${clients[5].length}`}
                                </div>
                                <div style={{background: dayWeek===6?'#ffb300':'#ffffff'}} onClick={()=>{setDayWeek(6)}} className={classes.selectType}>
                                    {`ВС ${clients[6].length}`}
                                </div>
                            </div>
                            <br/>
                            <div className={classes.listInvoices}>
                                {filtredClient?filtredClient.map((element, idx)=> {
                                    if (idx <= pagination && element) {
                                        let selected = clients[dayWeek].includes(element._id)
                                        return (
                                            <div key={element._id} style={isMobileApp ? {alignItems: 'baseline'} : {}}
                                                 className={isMobileApp ? classes.column : classes.row}>
                                                <div className={isMobileApp ? classes.row : classes.column}>
                                                    <Checkbox checked={selected}
                                                              onChange={() => {
                                                                  if (!selected) {
                                                                      clients[dayWeek].push(element._id)
                                                                  } else {
                                                                      clients[dayWeek].splice(clients[dayWeek].indexOf(element._id), 1)
                                                                  }
                                                                  setClients([...clients])
                                                              }}
                                                    />
                                                    {
                                                        selectType==='Выбраные'?
                                                            <>
                                                            {
                                                                filtredClient[idx-1]?
                                                                    <Tooltip title='Вверх'>
                                                                        <IconButton
                                                                            onClick={()=>{
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
                                                                            onClick={()=>{
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
                                                <LazyLoad scrollContainer={'.App-body'} key={element._id}
                                                          height={height} offset={[height, 0]} debounce={0}
                                                          once={true}
                                                          placeholder={<CardClientPlaceholder height={height}/>}>
                                                    <div>
                                                        <CardClient element={element} buy/>
                                                    </div>
                                                </LazyLoad>
                                            </div>
                                        )
                                    }
                                    else return null
                                }):null}
                            </div>
                        <div className={isMobileApp?classes.bottomRouteM:classes.bottomRouteD}>
                            <Button onClick={async()=>{
                                let map = district.client.filter(client => clients[dayWeek].includes(client._id))
                                setFullDialog('Маршрут', <GeoRouteAgent clients={map}/>)
                                showFullDialog(true)
                            }} size='small' color='primary'>
                                Карта
                            </Button>
                            {
                                router.query.id==='new'?
                                    <Button onClick={async()=>{
                                        if (district._id&&organization._id) {
                                            const action = async() => {
                                                await addAgentRoute({
                                                    organization: organization._id,
                                                    clients: clients,
                                                    district: district._id,
                                                })
                                                Router.push(`/agentroutes/${organization._id}`)
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
                                            let editElement = {_id: data.agentRoute._id, clients: clients}
                                            await setAgentRoute(editElement)
                                        }
                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                        showMiniDialog(true)
                                    }} size='small' color='primary'>
                                        Сохранить
                                    </Button>
                                    {['суперорганизация', 'организация', 'менеджер', 'admin'].includes(profile.role)?
                                        <>
                                        <Button onClick={async()=>{
                                            const action = async() => {
                                                await deleteAgentRoute([data.agentRoute._id], data.agentRoute.organization._id)
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
    if(!['суперорганизация', 'организация', 'admin', 'менеджер', 'суперагент', 'агент', 'суперагент'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
                Router.push('/contact')
    return {
        data: {
            ...ctx.query.id!=='new'?await getAgentRoute({_id: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined): {agentRoute: {organization: {}, clients: [[],[],[],[],[],[],[]], district: {}}},
            organizations: [{name: 'AZYK.STORE', _id: 'super'}, ...(await getOrganizations({search: '', filter: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined)).organizations]
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
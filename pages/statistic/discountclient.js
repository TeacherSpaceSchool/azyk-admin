import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import { urlMain } from '../../redux/constants/other'
import initialApp from '../../src/initialApp'
import CardClient from '../../components/client/CardClient'
import CardClientPlaceholder from '../../components/client/CardClientPlaceholder'
import { getClientGqlSsr } from '../../src/getClientGQL'
import { getActiveOrganization } from '../../src/gql/statistic'
import { getDistricts, getDistrict } from '../../src/gql/district'
import { getDiscountClients, saveDiscountClients } from '../../src/gql/discountClient'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../redux/actions/app'
import Checkbox from '@material-ui/core/Checkbox';
import LazyLoad from 'react-lazyload';
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import * as snackbarActions from '../../redux/actions/snackbar'
import dynamic from 'next/dynamic'
import { checkInt } from '../../src/lib'
import { forceCheck } from 'react-lazyload';

const height = 225
const Confirmation = dynamic(() => import('../../components/dialog/Confirmation'))
const SetDiscountClient = dynamic(() => import('../../components/dialog/SetDiscountClient'))

const DiscountClient = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    let { isMobileApp, search, city } = props.app;
    const { profile } = props.user;
    const { setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const { showLoad } = props.appActions;
    const { showSnackBar } = props.snackbarActions;
    const initialRender = useRef(true);
    let [activeOrganization, setActiveOrganization] = useState(data.activeOrganization);
    let [pagination, setPagination] = useState(100);
    let [districts, setDistricts] = useState([]);
    let [allClients, setAllClients] = useState([]);
    let [discountClients, setDiscountClients] = useState([]);
    let [filtredClients, setFiltredClients] = useState([]);
    let [selectedClients, setSelectedClients] = useState([]);
    let [district, setDistrict] = useState(undefined);
    let [forwarder, setForwarder] = useState(undefined);
    let [organizations, setOrganizations] = useState([]);
    let [organization, setOrganization] = useState(undefined);
    let [discount, setDiscount] = useState(0);
    useEffect(()=>{
        (async ()=>{
            if(profile.organization) {
                for(let i=0;i<data.activeOrganization.length;i++){
                    if(data.activeOrganization[i]._id===profile.organization)
                        setForwarder(data.activeOrganization[i])
                }
            }
        })()
    },[])
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                await showLoad(true)
                setForwarder(undefined)
                setActiveOrganization((await getActiveOrganization(city)).activeOrganization)
                await showLoad(false)
            }
        })()
    },[city])
    useEffect(()=>{
        (async()=>{
            await showLoad(true)
            setOrganization(undefined)
            setDistrict(undefined)
            setAllClients([])
            setSelectedClients([])
            organizations = []
            if(forwarder){
                setDistricts((await getDistricts({search: '', sort: '-name', organization: forwarder._id})).districts)
                organizations = [forwarder]
            }
            setOrganizations(organizations)
            await showLoad(false)
        })()
    },[forwarder, activeOrganization])
    useEffect(()=>{
        (async()=>{
            setSelectedClients([])
            setAllClients([])
            if(district&&organization){
                await showLoad(true)
                let _district = (await getDistrict({_id: district._id})).district
                setAllClients(_district.client)
                discountClients = {}
                let  _discountClients =  (await getDiscountClients({clients: district.client.map(element=>element._id), organization: organization._id})).discountClients
                for(let i=0; i<_discountClients.length; i++) {
                    discountClients[_discountClients[i].client] = _discountClients[i]
                }
                setDiscountClients({...discountClients})
                await showLoad(false)
            }
        })()
    },[district, organization])
    const checkPagination = ()=>{
        if(pagination<filtredClients.length){
            setPagination(pagination+100)
        }
    }
    useEffect(()=>{
        (async()=>{
            if(allClients.length>0) {
                let filtredClient = [...allClients]
                if(search.length>0)
                    filtredClient = filtredClient.filter(element=>
                        ((element.phone.filter(phone => phone.toLowerCase().includes(search.toLowerCase()))).length > 0) ||
                        (element.name.toLowerCase()).includes(search.toLowerCase())||
                        ((element.address.filter(addres=>addres[0]&&addres[0].toLowerCase().includes(search.toLowerCase()))).length>0)||
                        ((element.address.filter(addres=>addres[2]&&addres[2].toLowerCase().includes(search.toLowerCase()))).length>0)
                    )
                setFiltredClients([...filtredClient])
                forceCheck()
            }
        })()
    },[search, allClients])

    let [anchorEl, setAnchorEl] = useState(null);
    let open = event => {
        setAnchorEl(event.currentTarget);
    };
    let close = () => {
        setAnchorEl(null);
    };
    return (
        <App cityShow pageName='Скидки клиента' checkPagination={checkPagination} searchShow={true}>
            <Head>
                <title>Скидки клиента</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        {
                            profile.role==='admin'?
                                <Autocomplete
                                    className={classes.input}
                                    options={activeOrganization}
                                    getOptionLabel={option => option.name}
                                    value={forwarder}
                                    onChange={(event, newValue) => {
                                        setForwarder(newValue)
                                    }}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField {...params} label='Поставщик' fullWidth />
                                    )}/>
                                :
                                null
                        }
                        <Autocomplete
                            className={classes.input}
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
                    </div>
                    <div className={classes.row}>
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
                                <TextField {...params} label='Район' fullWidth />
                            )}
                        />
                        <TextField
                            type={ isMobileApp?'number':'text'}
                            label='Скидка'
                            value={discount}
                            className={classes.input}
                            onChange={(event)=>{
                                setDiscount(checkInt(event.target.value))}
                            }
                            inputProps={{
                                'aria-label': 'description',
                            }}
                        />
                    </div>
                </CardContent>
            </Card>
            <div className={classes.listInvoices}>
                {filtredClients?filtredClients.map((element, idx)=> {
                    if (idx <= pagination) {
                        return (
                            <div key={element._id} className={classes.column1}>
                                <div className={classes.row1} style={{...isMobileApp?{justifyContent: 'center'}:{alignItems: 'baseline'}}}>
                                    <div style={{alignItems: 'center'}} className={isMobileApp?classes.row1:classes.column}>
                                        <Checkbox checked={selectedClients.includes(element._id)}
                                                  onChange={() => {
                                                      if (!selectedClients.includes(element._id)) {
                                                          selectedClients.push(element._id)
                                                      } else {
                                                          selectedClients.splice(selectedClients.indexOf(element._id), 1)
                                                      }
                                                      setSelectedClients([...selectedClients])
                                                  }}
                                        />
                                        <b style={{color: '#ffb300'}}>{discountClients[element._id]?discountClients[element._id].discount:0}%</b>
                                    </div>
                                    <LazyLoad scrollContainer={'.App-body'} key={element._id}
                                              height={height} offset={[height, 0]} debounce={0}
                                              once={true}
                                              placeholder={<CardClientPlaceholder/>}>
                                        <CardClient idx={idx} key={element._id} element={element}/>
                                    </LazyLoad>
                                </div>
                            </div>
                        )
                    }
                    else return null
                }):null}
            </div>
            <Fab onClick={open} color='primary' aria-label='add' className={classes.fab}>
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
                    organization&&organization._id?
                        <MenuItem onClick={async()=>{
                            setMiniDialog('По клиенту', <SetDiscountClient discountClients={discountClients} setDiscountClients={setDiscountClients} organization={organization}/>);
                            showMiniDialog(true)
                            close()
                        }}>По клиенту</MenuItem>
                        :
                        null
                }
                <MenuItem onClick={async()=>{
                    if(selectedClients.length>0){
                        const action = async() => {
                            if(selectedClients.length>0) {
                                await saveDiscountClients(selectedClients, organization._id, discount)
                                for (let i = 0; i < selectedClients.length; i++) {
                                    discountClients[selectedClients[i]] = {
                                        client: selectedClients[i],
                                        discount: discount,
                                        organization: organization._id
                                    }
                                }
                                setDiscountClients({...discountClients})
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
                <MenuItem onClick={async()=>{
                    setSelectedClients(filtredClients.map(client=>client._id))
                    close()
                }}>Выбрать все</MenuItem>
                <MenuItem onClick={async()=>{
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

DiscountClient.getInitialProps = async function(ctx) {
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
            ...(await getActiveOrganization(ctx.store.getState().app.city, ctx.req?await getClientGqlSsr(ctx.req):undefined))
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

export default connect(mapStateToProps, mapDispatchToProps)(DiscountClient);
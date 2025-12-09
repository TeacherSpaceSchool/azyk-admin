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
import { getDiscountClients, saveDiscountClients } from '../../../src/gql/discountClient'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import Checkbox from '@material-ui/core/Checkbox';
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import * as snackbarActions from '../../../redux/actions/snackbar'
import {checkInt, formatAmount} from '../../../src/lib'
import {getOrganizations} from '../../../src/gql/organization';
import Confirmation from '../../../components/dialog/Confirmation'
import SetDiscountClient from '../../../components/dialog/SetDiscountClient'

const DiscountClient = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    let {isMobileApp, search, city} = props.app;
    const {profile} = props.user;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {showLoad} = props.appActions;
    const {showSnackBar} = props.snackbarActions;
    const initialRender = useRef(true);
    const [pagination, setPagination] = useState(100);
    let [districts, setDistricts] = useState([]);
    let [allClients, setAllClients] = useState([]);
    let [discountClients, setDiscountClients] = useState([]);
    let [filteredClients, setFilteredClients] = useState([]);
    let [selectedClients, setSelectedClients] = useState([]);
    let [district, setDistrict] = useState(null);
    let [organizations, setOrganizations] = useState(data.organizations);
    let [organization, setOrganization] = useState(profile.organization?{_id: profile.organization}:null);
    useEffect(() => {
        if(profile.organization) {
            organization = data.organizations.find(organization => organization._id === profile.organization)
            if(organization)
                setOrganization(organization)
        }
    }, [])
    let [discount, setDiscount] = useState(0);
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
                    const discountClientsData = await getDiscountClients({clients: district.client.map(element => element._id), organization: organization._id})
                    discountClients = {}
                    for (let i = 0; i < discountClientsData.length; i++) {
                        discountClients[discountClientsData[i].client] = discountClientsData[i]
                    }
                    setDiscountClients({...discountClients})
                    showLoad(false)
                }
            })()
        }
    }, [district])
    const checkPagination = useCallback(() => {
        if(pagination<filteredClients.length)
            setPagination(pagination => pagination+100)
    }, [pagination, filteredClients])
    useEffect(() => {
        if(!initialRender.current) {
            (async () => {
                if(allClients.length) {
                    let filteredClient = [...allClients]
                    if(search)
                        filteredClient = filteredClient.filter(element =>
                            ((element.phone.filter(phone => phone.toLowerCase().includes(search.toLowerCase()))).length) ||
                            (element.name.toLowerCase()).includes(search.toLowerCase()) ||
                            ((element.address.filter(addres => addres[0] && addres[0].toLowerCase().includes(search.toLowerCase()))).length) ||
                            ((element.address.filter(addres => addres[2] && addres[2].toLowerCase().includes(search.toLowerCase()))).length)
                        )
                    setFilteredClients([...filteredClient])
                }
            })()
        }
    }, [search, allClients])
    useEffect(() => {
        (async () => {
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                showLoad(true)
                setOrganizations(await getOrganizations({search: '', filter: '', city}))
                showLoad(false)
            }
        })()
    }, [city])

    let [anchorEl, setAnchorEl] = useState(null);
    let open = event => {
        setAnchorEl(event.currentTarget);
    };
    let close = () => {
        setAnchorEl(null);
    };
    const inputClass = !isMobileApp&&profile.role==='admin'?classes.inputThird:classes.inputHalf
    return (
        <App cityShow pageName='Скидки клиента' checkPagination={checkPagination} searchShow>
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
                        <TextField
                            type={ isMobileApp?'number':'text'}
                            label='Скидка'
                            value={discount}
                            className={inputClass}
                            onChange={(event) => {
                                setDiscount(checkInt(event.target.value))}
                            }
                        />
                    </div>
                </CardContent>
            </Card>
            <div className={classes.listInvoices}>
                {filteredClients?filteredClients.map((element, idx) => {
                    if(idx<pagination) {
                        return (
                            <div key={element._id} className={classes.column1}>
                                <div className={classes.row1} style={{...isMobileApp?{justifyContent: 'center'}:{alignItems: 'baseline'}}}>
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
                                        <b style={{color: '#ffb300'}}>{discountClients[element._id]?discountClients[element._id].discount:0}%</b>
                                    </div>
                                    <CardClient idx={idx} element={element}/>
                                </div>
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
                    organization&&organization._id?
                        <MenuItem onClick={() => {
                            setMiniDialog('По клиенту', <SetDiscountClient discountClients={discountClients} setDiscountClients={setDiscountClients} organization={organization}/>);
                            showMiniDialog(true)
                            close()
                        }}>По клиенту</MenuItem>
                        :
                        null
                }
                <MenuItem onClick={async () => {
                    if(selectedClients.length) {
                        const action = async () => {
                            if(selectedClients.length) {
                                await saveDiscountClients({clients: selectedClients, organization: organization._id, discount})
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
                <MenuItem onClick={() => {
                    setSelectedClients(filteredClients.map(client=>client._id))
                    close()
                }}>Выбрать все</MenuItem>
                <MenuItem onClick={() => {
                    setSelectedClients([])
                    close()
                }}>Отменить выбор</MenuItem>
            </Menu>
            <div className='count'>
                Клиентов: {formatAmount(selectedClients.length)}
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
            organizations: await getOrganizations({city: ctx.store.getState().app.city, search: '', filter: ''}, getClientGqlSsr(ctx.req))
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
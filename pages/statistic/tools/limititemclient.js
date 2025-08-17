import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import initialApp from '../../../src/initialApp'
import CardLimitItemClient from '../../../components/card/CardLimitItemClient'
import { getItemsForLimitItemClients, getLimitItemClients } from '../../../src/gql/limitItemClient'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import * as snackbarActions from '../../../redux/actions/snackbar'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import CircularProgress from '@material-ui/core/CircularProgress';
import { getClients } from '../../../src/gql/client'
import {getOrganizations} from '../../../src/gql/organization';
import {getClientTitle} from '../../../src/lib';

const DiscountClient = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    let {isMobileApp, city} = props.app;
    const {profile} = props.user;
    const {showLoad} = props.appActions;
    const initialRender = useRef(true);
    let [organizations, setOrganizations] = useState(data.organizations);
    let [clients, setClients] = useState([]);
    let [client, setClient] = useState(null);
    let [items, setItems] = useState([]);
    let [limitItemClients, setLimitItemClients] = useState([]);
    let [organization, setOrganization] = useState(profile.organization?{_id: profile.organization}:null);
    const [inputValue, setInputValue] = React.useState('');
    const searchTimeOut = useRef(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if(profile.organization) {
            organization = data.organizations.find(organization => organization._id === profile.organization)
            if(organization)
                setOrganization(organization)
        }
    }, [])
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
                    setClients(await getClients({search: inputValue, sort: '-name', filter: 'all', city: organization?organization.cities[0]:city}))
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
    let handleClient =  (client) => {
        setClient(client)
        setOpen(false)
    };
    useEffect(() => {
        (async () => {
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                showLoad(true)
                setOrganization(null)
                setOrganizations(await getOrganizations({search: '', filter: '', city}))
                showLoad(false)
            }
        })()
    }, [city])
    useEffect(() => {
        (async () => {
            setClient(null)
        })()
    }, [organization])
    useEffect(() => {
        (async () => {
            if(client&&organization) {
                showLoad(true)
                // eslint-disable-next-line no-undef
                const [items, limitItemClients] = await Promise.all([
                    getItemsForLimitItemClients({client: client._id, organization: organization._id}),
                    getLimitItemClients({client: client._id, organization: organization._id})
                ])
                setItems(items)
                setLimitItemClients(limitItemClients)
                showLoad(false)
            }
            else {
                setLimitItemClients([])
                setItems([])
            }
        })()
    }, [client])
    const inputClass = profile.role==='admin'?classes.inputHalf:classes.input
    return (
        <App cityShow pageName='Лимит покупки товаров клиентом' >
            <Head>
                <title>Лимит покупки товаров клиентом</title>
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
                                    )}/>
                                :
                                null
                        }
                        {
                            organization?
                                <Autocomplete
                                    onClose={() =>setOpen(false)}
                                    open={open}
                                    disableOpenOnFocus
                                    className={inputClass}
                                    options={clients}
                                    getOptionLabel={option => getClientTitle(option)}
                                    onChange={(event, newValue) => {
                                        handleClient(newValue)
                                    }}
                                    value={client}
                                    noOptionsText='Ничего не найдено'
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
                                :
                                null
                        }
                    </div>
                </CardContent>
            </Card>
            {
                organization&&client&&limitItemClients?
                    <div className={classes.listInvoices}>
                        <CardLimitItemClient
                            setList={setLimitItemClients}
                            organization={organization}
                            items={items}
                            client={client}
                            setItems={setItems}
                        />
                        {limitItemClients?limitItemClients.map((element, idx) => {
                            return (
                                <CardLimitItemClient
                                    idx={idx} key={element._id}
                                    element={element}
                                    setList={setLimitItemClients}
                                    organization={organization}
                                    items={items}
                                    client={client}
                                    setItems={setItems}
                                />
                            )
                        }):null}
                    </div>
                    :
                    null
            }
        </App>
    )
})

DiscountClient.getInitialProps = async function(ctx) {
    await initialApp(ctx)
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
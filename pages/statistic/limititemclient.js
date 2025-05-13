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
import CardLimitItemClient from '../../components/limitItemClient/CardLimitItemClient'
import CardLimitItemClientPlaceholder from '../../components/limitItemClient/CardLimitItemClientPlaceholder'
import { getActiveOrganization } from '../../src/gql/statistic'
import { getItemsForLimitItemClients, getLimitItemClients } from '../../src/gql/limitItemClient'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../redux/actions/app'
import LazyLoad from 'react-lazyload';
import * as snackbarActions from '../../redux/actions/snackbar'
import { getClientGqlSsr } from '../../src/getClientGQL'
import CircularProgress from '@material-ui/core/CircularProgress';
import { getClients } from '../../src/gql/client'

const height = 225

const DiscountClient = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    let { isMobileApp, city } = props.app;
    const { profile } = props.user;
    const { showLoad } = props.appActions;
    const initialRender = useRef(true);
    let [activeOrganization, setActiveOrganization] = useState(data.activeOrganization);
    let [clients, setClients] = useState([]);
    let [client, setClient] = useState(undefined);
    let [items, setItems] = useState([]);
    let [limitItemClients, setLimitItemClients] = useState([]);
    let [organization, setOrganization] = useState(data.organization?data.organization:undefined);
    const [inputValue, setInputValue] = React.useState('');
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        (async()=>{
            if (inputValue.length < 3) {
                setClients([]);
                if (open)
                    setOpen(false)
                if (loading)
                    setLoading(false)
            }
            else {
                if (!loading)
                    setLoading(true)
                if (searchTimeOut)
                    clearTimeout(searchTimeOut)
                searchTimeOut = setTimeout(async () => {
                    setClients((await getClients({search: inputValue, sort: '-name', filter: 'all', city})).clients)
                    if (!open)
                        setOpen(true)
                    setLoading(false)
                }, 500)
                setSearchTimeOut(searchTimeOut)
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
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                await showLoad(true)
                setOrganization(undefined)
                setActiveOrganization((await getActiveOrganization(city)).activeOrganization)
                await showLoad(false)
            }
        })()
    },[city])
    useEffect(()=>{
        (async()=>{
            setClient(undefined)
        })()
    },[organization])
    useEffect(()=>{
        (async()=>{
            if(client&&organization){
                await showLoad(true)
                setItems(await getItemsForLimitItemClients({client: client._id, organization: organization._id}))
                setLimitItemClients(await getLimitItemClients({client: client._id, organization: organization._id}))
                await showLoad(false)
            }
            else {
                setLimitItemClients([])
                setItems([])
            }
        })()
    },[client])
    return (
        <App cityShow pageName='Лимит покупки товаров клиентом' >
            <Head>
                <title>Лимит покупки товаров клиентом</title>
                <meta name='description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:title' content='Лимит покупки товаров клиентом' />
                <meta property='og:description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:type' content='website' />
                <meta property='og:image' content={`${urlMain}/static/512x512.png`} />
                <meta property='og:url' content={`${urlMain}/statistic/limitItemclient`} />
                <link rel='canonical' href={`${urlMain}/statistic/limitItemclient.`}/>
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
                                    onClose={()=>setOpen(false)}
                                    open={open}
                                    disableOpenOnFocus
                                    className={classes.input}
                                    options={clients}
                                    getOptionLabel={option => `${option.name}${option.address&&option.address[0]?` (${option.address[0][2]?`${option.address[0][2]}, `:''}${option.address[0][0]})`:''}`}
                                    onChange={(event, newValue) => {
                                        handleClient(newValue)
                                    }}
                                    value={client}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField {...params} label='Выберите клиента' variant='outlined' fullWidth
                                                   onChange={handleChange}
                                                   InputProps={{
                                                       ...params.InputProps,
                                                       endAdornment: (
                                                           <React.Fragment>
                                                               {loading ? <CircularProgress color="inherit" size={20} /> : null}
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
                            list={limitItemClients}/>
                        {limitItemClients?limitItemClients.map((element, idx)=> {
                            return (
                                <LazyLoad scrollContainer={'.App-body'} key={element._id}
                                          height={height} offset={[height, 0]} debounce={0}
                                          once={true}
                                          placeholder={<CardLimitItemClientPlaceholder/>}>
                                    <CardLimitItemClient
                                        idx={idx} key={element._id}
                                        element={element}
                                        setList={setLimitItemClients}
                                        organization={organization}
                                        items={items}
                                        client={client}
                                        list={limitItemClients}/>
                                </LazyLoad>
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
    let organization
    if(ctx.store.getState().user.profile.organization)
        organization = {_id: ctx.store.getState().user.profile.organization}
    return {
        data: {
            ...(await getActiveOrganization(ctx.store.getState().app.city, ctx.req?await getClientGqlSsr(ctx.req):undefined)),
            organization
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
import Head from 'next/head';
import React, { useState, useRef, useEffect } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import pageListStyle from '../../src/styleMUI/statistic/statistic'
import * as userActions from '../../redux/actions/user'
import * as snackbarActions from '../../redux/actions/snackbar'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import Router from 'next/router'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { uploadingAgentRoute, getActiveOrganization } from '../../src/gql/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import Confirmation from '../../components/dialog/Confirmation'
import { getAgentRoutes } from '../../src/gql/agentRoute'

const UploadingAgentRoute = React.memo((props) => {
    const { profile } = props.user;
    const classes = pageListStyle();
    const { data } = props;
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    const { isMobileApp, city } = props.app;
    const { showSnackBar } = props.snackbarActions;
    const initialRender = useRef(true);
    let [organization, setOrganization] = useState({_id: undefined});
    let [agentRoutes, setAgentRoutes] = useState([]);
    let [agentRoute, setAgentRoute] = useState({_id: undefined});
    let [activeOrganization, setActiveOrganization] = useState(data.activeOrganization);
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                setOrganization(undefined)
                setAgentRoutes([])
                setAgentRoute({_id: undefined})
                setActiveOrganization([{name: 'AZYK.STORE', _id: 'super'}, ...(await getActiveOrganization(city)).activeOrganization])
            }
        })()
    },[city])
    let [document, setDocument] = useState(undefined);
    let documentRef = useRef(null);
    let handleChangeDocument = ((event) => {
        if(event.target.files[0].size/1024/1024<50){
            setDocument(event.target.files[0])
        } else {
            showSnackBar('Файл слишком большой')
        }
    })
    useEffect(()=>{
        (async()=>{
            if(profile.role==='admin'&&organization&&organization._id) {
                setAgentRoutes((await getAgentRoutes({search: '', organization: organization._id})).agentRoutes)
                setAgentRoute({_id: undefined})
            }
        })()
    },[organization])
    return (
        <App cityShow pageName='Загрузка маршрутов 1C'>
            <Head>
                <title>Загрузка маршрутов 1C</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        Формат xlsx: GUID клиента из 1С (ПН, ВТ, СР, ЧТ, ПТ, СБ, ВС).
                    </div>
                    <div className={classes.row}>
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
                            )}
                        />
                        <Autocomplete
                            className={classes.input}
                            options={agentRoutes}
                            getOptionLabel={option => option.name}
                            value={agentRoute}
                            onChange={(event, newValue) => {
                                setAgentRoute(newValue)
                            }}
                            noOptionsText='Ничего не найдено'
                            renderInput={params => (
                                <TextField {...params} label='Маршрут' fullWidth />
                            )}
                        />
                    </div>
                    <div className={classes.row}>
                        <Button size='small' color='primary' onClick={()=>{documentRef.current.click()}}>
                            {document?document.name:'Прикрепить файл'}
                        </Button>
                    </div>
                    <br/>
                    <Button variant='contained' size='small' color='primary' onClick={async()=>{
                        if(agentRoute&&agentRoute._id&&document) {
                            const action = async() => {
                                let res = await uploadingAgentRoute({
                                    agentRoute: agentRoute._id,
                                    document: document
                                });
                                if(res.uploadingAgentRoute.data==='OK')
                                    showSnackBar('Все данные загруженны')
                            }
                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                            showMiniDialog(true)
                        }
                    }}>
                        Загрузить
                    </Button>
                </CardContent>
            </Card>
            <input
                ref={documentRef}
                accept='*/*'
                style={{ display: 'none' }}
                id='contained-button-file'
                type='file'
                onChange={handleChangeDocument}
            />
        </App>
    )
})

UploadingAgentRoute.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data:
            {
                activeOrganization: [{name: 'AZYK.STORE', _id: 'super'}, ...(await getActiveOrganization(ctx.store.getState().app.city, ctx.req?await getClientGqlSsr(ctx.req):undefined)).activeOrganization]
            }
    }
};

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UploadingAgentRoute);
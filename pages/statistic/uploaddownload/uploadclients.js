import Head from 'next/head';
import React, { useState, useRef, useEffect } from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import * as userActions from '../../../redux/actions/user'
import * as snackbarActions from '../../../redux/actions/snackbar'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import initialApp from '../../../src/initialApp'
import Router from 'next/router'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { uploadClients } from '../../../src/gql/uploadDownload'
import { getOrganizations } from '../../../src/gql/organization'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import Confirmation from '../../../components/dialog/Confirmation'
import {checkFileInput, maxFileSize, maxImageSize} from '../../../src/lib';

const UploadClients = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    let [organization, setOrganization] = useState(null);
    const {city} = props.app;
    const {isMobileApp} = props.app;
    const {showSnackBar} = props.snackbarActions;
    const initialRender = useRef(true);
    let [organizations, setOrganizations] = useState(data.organizations);
    let [document, setDocument] = useState(null);
    let documentRef = useRef(null);
    useEffect(() => {
        (async () => {
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                setOrganization(null)
                setOrganizations(await getOrganizations({search: '', filter: '', city}))
            }
        })()
    }, [city])
    let handleChangeDocument = ((event) => {
        const file = checkFileInput(event)
        if(file)
            setDocument(file)
        else showSnackBar('Файл слишком большой')
    })
    return (
        <App cityShow pageName='Загрузка клиентов 1C'>
            <Head>
                <title>Загрузка клиентов 1C</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        Формат xlsx: GUID клиента из 1С, название магазина клиента, адрес магазина клиента, категория клиента, ИНН клиента.
                    </div>
                    <div className={classes.row}>
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
                        <Button size='small' color='primary' onClick={() => documentRef.current.click()}>
                            {document?document.name:'Прикрепить файл'}
                        </Button>
                    </div>
                    <br/>
                    {
                        organization&&city&&document?
                            <Button variant='contained' size='small' color='primary' onClick={() => {
                                const action = async () => {
                                    let res = await uploadClients({
                                        organization: organization._id,
                                        document,
                                        city
                                    });
                                    if(res==='OK')
                                        showSnackBar('Все данные загруженны')
                                }
                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                showMiniDialog(true)
                            }}>
                                Загрузить
                            </Button>
                            :
                            null
                    }
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

UploadClients.getInitialProps = async function(ctx) {
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
        data: {
            ...await getOrganizations({city: ctx.store.getState().app.city, search: '', filter: ''},  getClientGqlSsr(ctx.req)),
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

export default connect(mapStateToProps, mapDispatchToProps)(UploadClients);
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
import { uploadDistricts } from '../../../src/gql/uploadDownload'
import { getOrganizations } from '../../../src/gql/organization'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import Confirmation from '../../../components/dialog/Confirmation'
import {maxFileSize} from '../../../src/lib';

const UploadDistricts = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    const {isMobileApp, city} = props.app;
    const initialRender = useRef(true);
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    let [organization, setOrganization] = useState(null);
    const {showSnackBar} = props.snackbarActions;
    let [organizations, setOrganizations] = useState(data.organizations);
    useEffect(() => {
        (async () => {
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                setOrganization(null)
                setOrganizations([{name: 'AZYK.STORE', _id: 'super'}, ...await getOrganizations({search: '', filter: '', city})])
            }
        })()
    }, [city])
    let [document, setDocument] = useState(null);
    let documentRef = useRef(null);
    let handleChangeDocument = ((event) => {
        if(event.target.files[0]&&event.target.files[0].size/1024/1024<maxFileSize)
            setDocument(event.target.files[0])
        else showSnackBar('Файл слишком большой')
    })
    return (
        <App cityShow pageName='Загрузка районов 1C'>
            <Head>
                <title>Загрузка районов 1C</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        Формат xlsx: _id клиента, _id торгового агента.
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
                    <Button variant='contained' size='small' color='primary' onClick={() => {
                        if(organization&&document) {
                            const action = async () => {
                                let res = await uploadDistricts({
                                    organization: organization._id,
                                    document: document
                                });
                                if(res==='OK')
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

UploadDistricts.getInitialProps = async function(ctx) {
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
                organizations: [{name: 'AZYK.STORE', _id: 'super'}, ...await getOrganizations({city: ctx.store.getState().app.city, search: '', filter: ''}, getClientGqlSsr(ctx.req))]
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

export default connect(mapStateToProps, mapDispatchToProps)(UploadDistricts);
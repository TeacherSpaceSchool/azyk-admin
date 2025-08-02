import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import initialApp from '../../../src/initialApp'
import Table from '../../../components/app/Table'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import {checkIntegrateClient} from '../../../src/gql/statistic'
import { getOrganizations } from '../../../src/gql/organization'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import * as snackbarActions from '../../../redux/actions/snackbar'
import Button from '@material-ui/core/Button';
import {maxFileSize} from '../../../src/lib';

const CheckIntegrateClient = React.memo((props) => {

    const classes = pageListStyle();
    const {data} = props;
    const {isMobileApp, city} = props.app;
    const {profile} = props.user;
    const types = ['повторяющиеся guid', 'повторящиеся клиенты', 'схожие клиенты', 'отличая от 1С']
    const {showSnackBar} = props.snackbarActions;
    const {showLoad} = props.appActions;
    let [type, setType] = useState('повторяющиеся guid');
    let [checkClient, setCheckClient] = useState(null);
    let [organization, setOrganization] = useState(null);
    let [document1, setDocument1] = useState(null);
    let document1Ref = useRef(null);
    const initialRender = useRef(true);
    let [organizations, setOrganizations] = useState(data.organizations);
    let handleChangeDocument1 = ((event) => {
        if(event.target.files[0].size/1024/1024<maxFileSize)
            setDocument1(event.target.files[0])
        else showSnackBar('Файл слишком большой')
    })
    useEffect(() => {
        (async () => {
            if(profile.role==='admin'&&type&&organization) {
                showLoad(true)
                setCheckClient(await checkIntegrateClient({
                    organization: organization._id,
                    type: type,
                    document: document1
                }))
                showLoad(false)
            }
        })()
    }, [organization, type, document1])
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
        if(process.browser) {
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    }, [process.browser])
    return (
        <App cityShow pageName='Проверка интеграции клиентов'>
            <Head>
                <title>Проверка интеграции клиентов</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        <Autocomplete
                            className={classes.inputHalf}
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
                        <Autocomplete
                            className={classes.inputHalf}
                            options={types}
                            getOptionLabel={option => option}
                            value={type}
                            onChange={(event, newValue) => {
                                setDocument1(null)
                                setType(newValue)
                            }}
                            noOptionsText='Ничего не найдено'
                            renderInput={params => (
                                <TextField {...params} label='Тип' fullWidth />
                            )}
                        />
                    </div>
                    {type==='отличая от 1С'?
                        <>
                        <br/>
                        <br/>
                        <div className={classes.row}>
                            Формат xlsx: GUID клиента из 1С.
                            <Button size='small' color='primary' onClick={() => document1Ref.current.click()}>
                                {document1?document1.name:'Прикрепить файл'}
                            </Button>
                        </div>
                        </>
                        :null}
                    {
                        checkClient?
                            <Table filterHeight={58} type='item' row={checkClient.row} columns={checkClient.columns}/>
                            :null
                    }
                </CardContent>
            </Card>
            <div className='count'>
                {
                    checkClient?
                        `Ошибок: ${checkClient.row.length}`
                        :null
                }
            </div>
            <input
                ref={document1Ref}
                accept='*/*'
                style={{ display: 'none' }}
                id='contained-button-file'
                type='file'
                onChange={handleChangeDocument1}
            />
        </App>
    )
})

CheckIntegrateClient.getInitialProps = async function(ctx) {
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
            organizations: await getOrganizations({city: ctx.store.getState().app.city, search: '', filter: ''}, getClientGqlSsr(ctx.req)),
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
        appActions: bindActionCreators(appActions, dispatch),

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckIntegrateClient);
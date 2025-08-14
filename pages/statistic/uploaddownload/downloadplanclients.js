import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import * as userActions from '../../../redux/actions/user'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import initialApp from '../../../src/initialApp'
import Router from 'next/router'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { getOrganizations } from '../../../src/gql/organization'
import { getUnloadPlanClients } from '../../../src/gql/planClient'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import * as appActions from '../../../redux/actions/app'
import {getDistricts} from '../../../src/gql/district';

const UnloadPlanClients = React.memo((props) => {
    const {profile} = props.user;
    const classes = pageListStyle();
    const {data} = props;
    let [organization, setOrganization] = useState(null);
    let [districts, setDistricts] = useState([]);
    let [district, setDistrict] = useState(null);
    const {isMobileApp, city} = props.app;
    const {showLoad} = props.appActions;
    const initialRender = useRef(true);
    let [organizations, setOrganizations] = useState(data.organizations);
    useEffect(() => {
        if(!initialRender.current) {
            (async () => {
                if(organization) {
                    showLoad(true)
                    setDistricts(await getDistricts({
                        organization: organization._id,
                        search: '',
                        sort: 'name'
                    }))
                    showLoad(false)
                }
                else setDistricts([])
            })()
        }
    }, [organization])
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
        <App cityShow pageName='Выгрузка планов клиентов'>
            <Head>
                <title>Выгрузка планов клиентов</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        {
                            !profile.organization?
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
                                :
                                <><br/><br/></>
                        }
                        <Autocomplete
                            className={classes.inputHalf}
                            options={districts}
                            getOptionLabel={option => option.name}
                            value={district}
                            onChange={(event, newValue) => {
                                setDistrict(newValue)
                            }}
                            noOptionsText='Ничего не найдено'
                            renderInput={params => (
                                <TextField {...params} label='Район' fullWidth
                                           onKeyPress={async event => {
                                               if(event.key === 'Enter'&&district) {
                                                   await setDistrict(district._id)
                                               }
                                           }}/>
                            )}
                        />
                    </div>
                    <br/>
                    <Button variant='contained' size='small' color='primary' onClick={async () => {
                        if(profile.organization) organization = {_id: profile.organization}
                        if(organization&&district) {
                            showLoad(true)
                            window.open(await getUnloadPlanClients({
                                organization: organization._id,
                                district: district._id
                            }), '_blank');
                            showLoad(false)
                        }
                    }}>
                        Выгрузить
                    </Button>
                </CardContent>
            </Card>
        </App>
    )
})

UnloadPlanClients.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация', 'организация', 'менеджер'].includes(ctx.store.getState().user.profile.role))
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
                organizations: await getOrganizations({city: ctx.store.getState().app.city, search: '', filter: ''}, getClientGqlSsr(ctx.req))
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
        appActions: bindActionCreators(appActions, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UnloadPlanClients);
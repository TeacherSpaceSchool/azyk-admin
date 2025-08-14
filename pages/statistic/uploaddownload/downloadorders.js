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
import { downloadOrders } from '../../../src/gql/uploadDownload'
import { getOrganizations } from '../../../src/gql/organization'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import * as appActions from '../../../redux/actions/app'

const DownloadOrders = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    const {profile} = props.user;
    const initialRender = useRef(true);
    let [organizations, setOrganizations] = useState(data.organizations);
    let [date, setDate] = useState(null);
    let [organization, setOrganization] = useState(profile.organization?{_id: profile.organization}:{_id: 'all'});
    const {isMobileApp, filter, city} = props.app;
    useEffect(() => {
        if(process.browser) {
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    }, [process.browser])
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
    const {showLoad} = props.appActions;
    const filters = [{name: 'Дата доставки', value: 'Дата доставки'}, {name: 'Дата заказа', value: 'Дата заказа'}]
    return (
        <App cityShow pageName='Выгрузка заказов' filters={filters}>
            <Head>
                <title>Выгрузка заказов</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        {
                            !profile.organization ?
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
                                        <TextField {...params} label='Организация' fullWidth/>
                                    )}
                                />
                                :
                                null
                        }
                        <TextField
                            className={classes.inputHalf}
                            label={filter}
                            type='date'
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={date}
                            onChange={ event => setDate(event.target.value) }
                        />
                    </div>
                    <br/>
                    <Button variant='contained' size='small' color='primary' onClick={async () => {
                        if(organization&&organization._id&&date) {
                            showLoad(true)
                            window.open(await downloadOrders({
                                organization: organization._id,
                                dateStart: date,
                                filter
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

DownloadOrders.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    ctx.store.getState().app.filter = 'Дата доставки'
    if(!['admin', 'суперорганизация'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data:
            await getOrganizations({city: ctx.store.getState().app.city, search: '', filter: ''}, getClientGqlSsr(ctx.req)),
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

export default connect(mapStateToProps, mapDispatchToProps)(DownloadOrders);
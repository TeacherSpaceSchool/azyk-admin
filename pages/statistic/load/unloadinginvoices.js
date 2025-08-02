import Head from 'next/head';
import React, { useState, useEffect } from 'react';
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
import { getUnloadingInvoices } from '../../../src/gql/statistic'
import { getOrganizations } from '../../../src/gql/organization'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import * as appActions from '../../../redux/actions/app'

const UnloadingInvoices = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    let [date, setDate] = useState(null);
    let [all, setAll] = useState(false);
    let [organization, setOrganization] = useState(null);
    const {isMobileApp} = props.app;
    useEffect(() => {
        if(process.browser) {
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    }, [process.browser])
    const {showLoad} = props.appActions;
    return (
        <App pageName='Выгрузка накладных'>
            <Head>
                <title>Выгрузка накладных</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        <Autocomplete
                            className={classes.inputHalf}
                            options={[{name: 'AZYK.STORE', _id: 'super'}, ...data.organizations]}
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
                        <TextField
                            className={classes.inputHalf}
                            label='Дата начала'
                            type='date'
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={date}
                            onChange={ event => setDate(event.target.value) }
                        />
                    </div>
                    <br/>
                    <div className={classes.row}>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={()=>setAll(true)} size='small' color={all?'primary':''}>
                            Все
                        </Button>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={()=>setAll(false)} size='small' color={!all?'primary':''}>
                            Свои
                        </Button>
                    </div>
                    <br/>
                    <Button variant='contained' size='small' color='primary' onClick={async () => {
                        if(organization&&organization._id&&date) {
                            showLoad(true)
                            window.open(await getUnloadingInvoices({
                                organization: organization._id,
                                dateStart: date,
                                all: all,
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

UnloadingInvoices.getInitialProps = async function(ctx) {
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

export default connect(mapStateToProps, mapDispatchToProps)(UnloadingInvoices);
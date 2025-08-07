import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import Head from 'next/head';
import React, {useState, useEffect, useRef} from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import initialApp from '../../../src/initialApp'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import {getDeliveryDate, setDeliveryDate} from '../../../src/gql/deliveryDate'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import * as snackbarActions from '../../../redux/actions/snackbar'
import Button from '@material-ui/core/Button';
import {getOrganizations} from '../../../src/gql/organization';
import Confirmation from '../../../components/dialog/Confirmation';

const defaultDays = [true, true, true, true, true, true, false]

const LogistiOorder = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    let {isMobileApp, city} = props.app;
    const {profile} = props.user;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {showLoad} = props.appActions;
    const initialRender = useRef(true);
    let [organizations, setOrganizations] = useState(data.organizations);
    let [organization, setOrganization] = useState(profile.organization?{_id: profile.organization}:null);
    let [days, setDays] = useState(defaultDays);
    useEffect(() => {
        if(profile.organization) {
            organization = data.organizations.find(organization => organization._id === profile.organization)
            if(organization)
                setOrganization(organization)
        }
    }, [])
    useEffect(() => {
        if(!initialRender.current&&organization) {
            (async () => {
                const deliveryDate = await getDeliveryDate({organization: organization._id})
                setDays([...deliveryDate?deliveryDate.days:defaultDays])
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
                setOrganizations(...await getOrganizations({search: '', filter: '', city}))
                showLoad(false)
            }
        })()
    }, [city])
    const inputClass = !isMobileApp&&profile.role==='admin'?classes.inputThird:classes.inputHalf
    return (
        <App cityShow pageName='Дни доставки'>
            <Head>
                <title>Дни доставки</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
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
                    <div className={classes.row}>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[0] = !days[0];setDays([...days])}} size='small' color={days[0]?'primary':''}>
                            ПН
                        </Button>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[1] = !days[1];setDays([...days])}} size='small' color={days[1]?'primary':''}>
                            ВТ
                        </Button>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[2] = !days[2];setDays([...days])}} size='small' color={days[2]?'primary':''}>
                            СР
                        </Button>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[3] = !days[3];setDays([...days])}} size='small' color={days[3]?'primary':''}>
                            ЧТ
                        </Button>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[4] = !days[4];setDays([...days])}} size='small' color={days[4]?'primary':''}>
                            ПТ
                        </Button>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[5] = !days[5];setDays([...days])}} size='small' color={days[5]?'primary':''}>
                            СБ
                        </Button>
                        <Button style={{width: 50, margin: 5}} variant='contained' onClick={() => {days[6] = !days[6];setDays([...days])}} size='small' color={days[6]?'primary':''}>
                            ВС
                        </Button>
                    </div>
                    <br/>
                    {organization?<Button onClick={() => {
                        const action = async () => await setDeliveryDate({organization: organization._id, days})
                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                        showMiniDialog(true)
                    }} size='small' color='primary'>
                        Сохранить
                    </Button>:null}
                    
                </CardContent>
            </Card>
        </App>
    )
})

LogistiOorder.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    ctx.store.getState().app.filter = 'Заказы'
    if(!['admin', 'суперорганизация', 'организация'].includes(ctx.store.getState().user.profile.role))
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

export default connect(mapStateToProps, mapDispatchToProps)(LogistiOorder);
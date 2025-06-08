import Head from 'next/head';
import React, {useState, useEffect, useRef} from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import Router from 'next/router'
import { urlMain } from '../../redux/constants/other'
import initialApp from '../../src/initialApp'
import { getClientGqlSsr } from '../../src/getClientGQL'
import { getStatisticGeoOrder, getActiveOrganization } from '../../src/gql/statistic'
import { Map, YMaps, Placemark } from 'react-yandex-maps';
import CircularProgress from '@material-ui/core/CircularProgress';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../redux/actions/app'
import { pdDatePicker } from '../../src/lib'

const OrderGeoStatistic = React.memo((props) => {

    const { data } = props;
    const { isMobileApp, city } = props.app;
    const { profile } = props.user;
    const { showLoad } = props.appActions;
    const initialRender = useRef(true);
    let [activeOrganization, setActiveOrganization] = useState(data.activeOrganization);
    let [load, setLoad] = useState(true);
    let [dateStart, setDateStart] = useState(data.dateStart);
    useEffect(()=>{
        if(process.browser){
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    },[process.browser])
    let [organization, setOrganization] = useState(profile.organization?{_id: profile.organization}:null);
    let [statisticOrderGeo, setStatisticOrderGeo] = useState(undefined);
    useEffect(()=>{
        (async()=>{
            if(organization&&dateStart) {
                await showLoad(true)
                setStatisticOrderGeo((await getStatisticGeoOrder({organization: organization._id, dateStart: dateStart})).statisticGeoOrder)
                await showLoad(false)
            }
        })()
    },[organization, dateStart])
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                await showLoad(true)
                setOrganization(undefined)
                setActiveOrganization((await getActiveOrganization(city)).activeOrganization)
                setStatisticOrderGeo([])
                await showLoad(false)
            }
        })()
    },[city])

    return (
        <>
        <YMaps>
            <App cityShow pageName='Карта заказов'>
                <Head>
                    <title>Карта заказов</title>
                    <meta name='robots' content='noindex, nofollow'/>
                </Head>
                {
                    process.browser&&statisticOrderGeo?
                        <div style={{height: window.innerHeight-64, width: isMobileApp?window.innerWidth:window.innerWidth-300, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            {
                                load?<CircularProgress/>:null
                            }
                            <div style={{display: load?'none':'block'}}>
                                <Map onLoad={()=>{setLoad(false)}} height={window.innerHeight-64} width={isMobileApp?window.innerWidth:window.innerWidth-300}
                                         state={{ center: [42.8700000, 74.5900000], zoom: 15 }}
                                    >
                                    {statisticOrderGeo.map((address, idx)=> {
                                            if(address[1]) return <Placemark
                                                key={`address${idx}`}
                                                options={{
                                                    draggable: false,
                                                    iconColor: '#ffb300'
                                                }}
                                                properties={{iconCaption: `${address[2] ? `${address[2]}, ` : ''}${address[0]}`}}
                                                geometry={address[1].split(', ')}/>
                                        }
                                    )}
                                </Map>
                            </div>
                        </div>
                        :
                        null
                }
            </App>
        </YMaps>
        {
            !profile.organization?
                <>
                <Autocomplete
                    style={{width: 150, position: 'fixed', top: 74, right: 10, padding: 10, borderRadius: 5, boxShadow: '0 0 10px rgba(0,0,0,0.5)', background: '#fff'}}
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
                <TextField
                    style={{width: 150, position: 'fixed', top: 74, right: 180, padding: 10, borderRadius: 5, boxShadow: '0 0 10px rgba(0,0,0,0.5)', background: '#fff'}}
                    label='Дата доставки'
                    type='date'
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={dateStart}
                    inputProps={{
                        'aria-label': 'description',
                    }}
                    onChange={ event => setDateStart(event.target.value) }
                />
                </>
                :
                <TextField
                    style={{width: 150, position: 'fixed', top: 74, right: 10, padding: 10, borderRadius: 5, boxShadow: '0 0 10px rgba(0,0,0,0.5)', background: '#fff'}}
                    label='Дата доставки'
                    type='date'
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={dateStart}
                    inputProps={{
                        'aria-label': 'description',
                    }}
                    onChange={ event => setDateStart(event.target.value) }
                />
        }
        {
            statisticOrderGeo?
                <div className='count'>
                    {`Заказов: ${statisticOrderGeo.length}`}
                </div>
                :null
        }
        </>
    )
})

OrderGeoStatistic.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    let dateStart = new Date()
    if (dateStart.getHours()<3)
        dateStart.setDate(dateStart.getDate() - 1)
    return {
        data: {
            ...await getActiveOrganization(ctx.store.getState().app.city, ctx.req?await getClientGqlSsr(ctx.req):undefined),
            dateStart: pdDatePicker(dateStart)
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

        appActions: bindActionCreators(appActions, dispatch),

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderGeoStatistic);
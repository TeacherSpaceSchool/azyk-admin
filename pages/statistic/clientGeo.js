import Head from 'next/head';
import React, {useState, useEffect, useRef} from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import Router from 'next/router'
import initialApp from '../../src/initialApp'
import { getClientGqlSsr } from '../../src/getClientGQL'
import { getStatisticClientGeo, getActiveOrganization } from '../../src/gql/statistic'
import { Map, YMaps, ObjectManager } from 'react-yandex-maps';
import CircularProgress from '@material-ui/core/CircularProgress';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../redux/actions/app'

const ClientGeoStatistic = React.memo((props) => {

    const { data } = props;
    const { search, isMobileApp, filter, city } = props.app;
    const { profile } = props.user;
    const { showLoad } = props.appActions;
    const initialRender = useRef(true);
    let [activeOrganization, setActiveOrganization] = useState(data.activeOrganization);
    let [load, setLoad] = useState(true);
    useEffect(()=>{
        if(process.browser){
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    },[process.browser])
    let [organization, setOrganization] = useState(null);
    let [items, setItems] = useState([]);
    let [item, setItem] = useState(null);
    let [statisticClientGeo, setStatisticClientGeo] = useState(undefined);
    let [greenData, setGreenData] = useState([]);
    let [yellowData, setYellowData] = useState([]);
    let [redData, setRedData] = useState([]);
    /*useEffect(()=>{
        (async()=>{
            if(profile.role==='admin') {
                setItem(null)
                if(organization)
                    setItems((await getActiveItem({organization: organization._id})).activeItem)
                else
                    setItems([])
                //setStatisticClientGeo((await getStatisticClientGeo({organization: organization ? organization._id : null})).statisticClientGeo)
            }
        })()
    },[organization])*/
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    useEffect(()=>{
        (async()=>{
            if(profile.role==='admin') {
                if(searchTimeOut)
                    clearTimeout(searchTimeOut)
                searchTimeOut = setTimeout(async()=>{
                    await showLoad(true)
                    setStatisticClientGeo((await getStatisticClientGeo({city: city, search, organization: organization ? organization._id : null, item: item ? item._id : null})).statisticClientGeo)
                    await showLoad(false)
                }, 500)
                setSearchTimeOut(searchTimeOut)
            }
        })()
    },[/*item, items, */search, organization, activeOrganization])
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
            if(profile.role==='admin'&&statisticClientGeo) {
                let _greenData = []
                let _yellowData = []
                let _redData = []
                let data
                for(let i=1;i<statisticClientGeo.length;i++){
                    data = {
                        type: 'Feature',
                            id: statisticClientGeo[i].client,
                            geometry: {
                            type: 'Point',
                                coordinates: statisticClientGeo[i].address[1].split(', ')
                        },
                        properties: {
                            iconColor: statisticClientGeo[i].data[1],
                                iconCaption: `${statisticClientGeo[i].data[0]==='true' ? `🔔` : '🔕'}${statisticClientGeo[i].address[2] ? `${statisticClientGeo[i].address[2]}, ` : ''}${statisticClientGeo[i].address[0]}`
                        }
                    }
                    if(statisticClientGeo[i].data[1]==='red')
                        _redData.push(data)
                    else if(statisticClientGeo[i].data[1]==='green')
                        _greenData.push(data)
                    else
                        _yellowData.push(data)
                }
                setGreenData(_greenData)
                setRedData(_redData)
                setYellowData(_yellowData)
            }
        })()
    },[statisticClientGeo])
    const filters = [{name: 'Все', value: ''}, {name: 'Зеленные', value: 'green'}, {name: 'Желтые', value: 'yellow'}, {name: 'Зеленные/Желтые', value: 'green/yellow'}]
    return (
        <>
        <YMaps>
            <App cityShow searchShow={true} pageName='Карта клиентов' filters={filters}>
                <Head>
                    <title>Карта клиентов</title>
                    <meta name='robots' content='noindex, nofollow'/>
                </Head>
                {
                    process.browser&&statisticClientGeo?
                        <div style={{height: window.innerHeight-64, width: isMobileApp?window.innerWidth:window.innerWidth-300, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            {
                                load?<CircularProgress/>:null
                            }
                            <div style={{display: load?'none':'block'}}>
                                <Map onLoad={()=>{setLoad(false)}} height={window.innerHeight-64} width={isMobileApp?window.innerWidth:window.innerWidth-300}
                                         state={{ center: [42.8700000, 74.5900000], zoom: 15 }}
                                    >
                                    {
                                        !filter.length?
                                            <ObjectManager
                                                options={{
                                                    clusterize: true,
                                                    gridSize: 32,
                                                }}
                                                objects={{
                                                    openBalloonOnClick: true,
                                                    preset: 'islands#redDotIcon',
                                                }}
                                                clusters={{
                                                    preset: 'islands#redClusterIcons',
                                                }}
                                                features={redData}
                                            />
                                            :
                                            null
                                    }
                                    {
                                        !filter.length||filter.includes('green')?
                                            <ObjectManager
                                            options={{
                                                clusterize: true,
                                                gridSize: 32,
                                            }}
                                            objects={{
                                                openBalloonOnClick: true,
                                                preset: 'islands#greenDotIcon',
                                            }}
                                            clusters={{
                                                preset: 'islands#greenClusterIcons',
                                            }}
                                            features={greenData}
                                        />
                                            :
                                            null
                                    }
                                    {
                                        !filter.length||filter.includes('yellow')?
                                            <ObjectManager
                                                options={{
                                                    clusterize: true,
                                                    gridSize: 32,
                                                }}
                                                objects={{
                                                    openBalloonOnClick: true,
                                                    preset: 'islands#yellowDotIcon',
                                                }}
                                                clusters={{
                                                    preset: 'islands#yellowClusterIcons',
                                                }}
                                                features={yellowData}
                                            />
                                            :
                                            null
                                    }
                                        {
                                           /* statisticClientGeo?
                                                (statisticClientGeo.slice(1)).map(
                                                        (element, idx) => {
                                                            return <Placemark
                                                                onClick={()=>{window.open(`/client/${element.client}`,'_blank');}}
                                                                key={idx}
                                                                options={{iconColor: element.data[1]}}
                                                                properties={{iconCaption: }}
                                                                geometry={element.address[1].split(', ')}/>
                                                        }
                                                    )
                                                :
                                                null
                                                */
                                        }
                                </Map>
                            </div>
                        </div>
                        :
                        null
                }
            </App>
        </YMaps>
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
        {
            items&&items.length>0?
                <Autocomplete
                    style={{width: 150, position: 'fixed', top: 74, right: 180, padding: 10, borderRadius: 5, boxShadow: '0 0 10px rgba(0,0,0,0.5)', background: '#fff'}}
                    options={items}
                    getOptionLabel={option => option.name}
                    value={item}
                    onChange={(event, newValue) => {
                        setItem(newValue)
                    }}
                    noOptionsText='Ничего не найдено'
                    renderInput={params => (
                        <TextField {...params} label='Товар' fullWidth />
                    )}
                />
                :
                null
        }
        {
            statisticClientGeo?
                <div className='count'>
                    {`${parseInt(statisticClientGeo[0].data[0])+parseInt(statisticClientGeo[0].data[1])+parseInt(statisticClientGeo[0].data[2])}(${statisticClientGeo[0].data[0]}|${statisticClientGeo[0].data[1]}|${statisticClientGeo[0].data[2]})`}
                </div>
                :null
        }
        </>
    )
})

ClientGeoStatistic.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    ctx.store.getState().app.filter = 'green/yellow'
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
            ...await getActiveOrganization(ctx.store.getState().app.city, ctx.req?await getClientGqlSsr(ctx.req):undefined),
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

export default connect(mapStateToProps, mapDispatchToProps)(ClientGeoStatistic);
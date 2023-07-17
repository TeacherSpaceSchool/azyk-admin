import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../src/styleMUI/statistic/statisticsList'
import { urlMain } from '../redux/constants/other'
import Link from 'next/link';
import Router from 'next/router'
import initialApp from '../src/initialApp'
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
const list = {
    statisticAzykStore: [
        {
            name: 'Статистика агента AZYK.STORE',
            link: '/statistic/agentAzykStore',
            role: ['admin']
        },
        {
            name: 'Статистика агентов AZYK.STORE',
            link: '/statistic/agentsAzykStore',
            role: ['admin']
        },
        {
            name: 'Статистика заказов AZYK.STORE',
            link: '/statistic/orderAzykStore',
            role: ['admin']
        }
    ],
    statistic: [
        {
            name: 'Активность клиентов',
            link: '/statistic/activeclient',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Активность организаций',
            link: '/statistic/activeorganization',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Активность товаров',
            link: '/statistic/activeitem',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Графики заказов',
            link: '/statistic/chart',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'История посещений',
            link: '/statistic/agenthistorygeo',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Карта клиентов',
            link: '/statistic/clientGeo',
            role: ['admin',]
        },
        {
            name: 'Карта заказов',
            link: '/statistic/ordergeo',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Карта посещений',
            link: '/statistic/agentmapgeo',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Рабочие часы',
            link: '/statistic/agentsworktime',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Статистика агентов',
            link: '/statistic/agents',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Статистика акций',
            link: '/statistic/adss',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Статистика возвратов',
            link: '/statistic/returneds',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Статистика девайсов',
            link: '/statistic/device',
            role: ['admin']
        },
        {
            name: 'Статистика дистрибьюторов',
            link: '/statistic/distributer',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Статистика заказов',
            link: '/statistic/order',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Статистика клиента',
            link: '/statistic/client/super',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Статистика клиентов',
            link: '/statistic/clients',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Статистика клиентов в городах',
            link: '/statistic/clientcity',
            role: ['admin']
        },
        {
            name: 'Статистика мерчендайзинга',
            link: '/statistic/merchandising',
            role: ['admin', 'суперорганизация', 'организация']
        },
        {
            name: 'Статистика подбрендов',
            link: '/statistic/subbrand',
            role: ['admin']
        },
        {
            name: 'Статистика товаров',
            link: '/statistic/item',
            role: ['admin']
        },
        {
            name: 'Статистика часов',
            link: '/statistic/hours',
            role: ['admin']
        },
    ],
    tools: [
        {
            name: 'Дни поставки',
            link: '/statistic/deliverydate',
            role: ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент']
        },
        {
            name: 'Корзина',
            link: '/statistic/trash',
            role: ['admin']
        },
        {
            name: 'Логистика',
            link: '/statistic/logisticorder',
            role: ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент']
        },
        {
            name: 'Оффлайн заказы',
            link: '/statistic/offlineorder',
            role: ['агент', 'суперагент']
        },
        {
            name: 'Подписчики',
            link: '/statistic/subscriber',
            role: ['admin']
        },
        {
            name: 'Проверка заказов',
            link:'/statistic/checkorder',
            role: ['admin']
        },
        {
            name: 'Проверка интеграции клиентов',
            link:'/statistic/checkintegrateclient',
            role: ['admin']
        },
        {
            name: 'Проверка маршрутов',
            link:'/statistic/checkagentroute',
            role: ['суперорганизация', 'admin']
        },
        {
            name: 'Пуш-уведомления',
            link: '/statistic/notificationStatistic',
            role: ['admin']
        },
        {
            name: 'Сбои',
            link: '/statistic/error',
            role: ['admin']
        },
        {
            name: 'Себестоимость товара',
            link: '/statistic/itemscostprice',
            role: ['admin']
        },
        {
            name: 'Скидки клиентов',
            link: '/statistic/discountclient',
            role: ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент']
        },
        {
            name: 'Специальная цена',
            link: '/statistic/specialpriceclient',
            role: ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент']
        },
        {
            name: 'Файловое хранилище',
            link: '/statistic/files',
            role: ['admin']
        },
        {
            name: 'Хранилище коллекций',
            link: '/statistic/statisticstoragesize',
            role: ['admin']
        },
    ],
    integrate: [
        {
            name: 'Акционная интеграции 1С',
            link: '/statistic/outxmlads',
            role: ['admin']
        },
        {
            name: 'Выгрузка интеграции 1С',
            link: '/statistic/integrateouts',
            role: ['admin']
        },
        {
            name: 'Загрузка клиентов 1C',
            link: '/statistic/uploadingclients',
            role: ['admin']
        },
        {
            name: 'Загрузка GUID клиентов 1C',
            link: '/statistic/unloadingintegrate1C',
            role: ['admin']
        },
        {
            name: 'Загрузка маршрутов 1C',
            link: '/statistic/uploadingagentroute',
            role: ['admin']
        },
        {
            name: 'Загрузка районов 1C',
            link: '/statistic/uploadingdistricts',
            role: ['admin']
        },
        {
            name: 'Загрузка товаров 1С',
            link: '/statistic/uploadingitems',
            role: ['admin']
        },
        {
            name: 'Интеграция 1С',
            link: '/statistic/integrates',
            role: ['admin']
        },
        {
            name: 'Интеграция клиентов 1С',
            link: '/statistic/clientssync',
            role: ['admin']
        },
        {
            name: 'Принятая интеграции 1С',
            link: `/statistic/receivedatas`,
            role: ['admin', 'суперорганизация', 'организация', 'менеджер']
        },
        {
            name: 'Несинхронизованные заказы',
            link: `/statistic/unsyncorder`,
            role: ['admin']
        },
    ],
    load: [
        {
            name: 'Выгрузка акционных заказов',
            link: '/statistic/unloadingadsorders',
            role: ['admin', 'суперорганизация', 'организация']
        },
        {
            name: 'Выгрузка заказов',
            link: '/statistic/unloadingorders',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Выгрузка клиентов',
            link: '/statistic/unloadingclients',
            role: ['admin']
        },
        {
            name: 'Выгрузка маршрутов',
            link: '/statistic/unloadingagentroutes',
            role: ['admin']
        },
        {
            name: 'Выгрузка районов',
            link: '/statistic/unloadingdistricts',
            role: ['admin']
        },
        {
            name: 'Выгрузка сотрудников',
            link: '/statistic/unloadingemployments',
            role: ['admin']
        },
    ]
}

const Statistic = React.memo((props) => {
    const classes = pageListStyle();
    const { isMobileApp, search } = props.app;
    const { profile } = props.user;
    let [showList, setShowList] = useState(props.showList);
    const [expanded, setExpanded] = React.useState(false);
    const initialRender = useRef(true);
    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            } else {
                showList = {
                    statistic: [],
                    tools: [],
                    integrate: [],
                    load: [],
                    statisticAzykStore: []
                }
                for (let i = 0; i < list.statisticAzykStore.length; i++) {
                    if (list.statisticAzykStore[i].name.toLowerCase().includes(search.toLowerCase()) && list.statisticAzykStore[i].role.includes(profile.role))
                        showList.statisticAzykStore.push(list.statisticAzykStore[i])
                }
                for (let i = 0; i < list.statistic.length; i++) {
                    if (list.statistic[i].name.toLowerCase().includes(search.toLowerCase()) && list.statistic[i].role.includes(profile.role))
                        showList.statistic.push(list.statistic[i])
                }
                for (let i = 0; i < list.tools.length; i++) {
                    if (list.tools[i].name.toLowerCase().includes(search.toLowerCase()) && list.tools[i].role.includes(profile.role))
                        showList.tools.push(list.tools[i])
                }
                for (let i = 0; i < list.integrate.length; i++) {
                    if (list.integrate[i].name.toLowerCase().includes(search.toLowerCase()) && list.integrate[i].role.includes(profile.role))
                        showList.integrate.push(list.integrate[i])
                }
                for (let i = 0; i < list.load.length; i++) {
                    if (list.load[i].name.toLowerCase().includes(search.toLowerCase()) && list.load[i].role.includes(profile.role))
                        showList.load.push(list.load[i])
                }
                setShowList({...showList})
            }
        })()
    },[search])
    return (
        <App searchShow={true} pageName='Инструменты'>
            <Head>
                <title>Инструменты</title>
                <meta name='description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:title' content='Инструменты' />
                <meta property='og:description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:type' content='website' />
                <meta property='og:image' content={`${urlMain}/static/512x512.png`} />
                <meta property='og:url' content={`${urlMain}/statistics`} />
                <link rel='canonical' href={`${urlMain}/statistics`}/>
            </Head>
            <div className={classes.page}>
                {
                    showList.load&&showList.load.length>0?
                        <ExpansionPanel expanded={expanded === 'load'} onChange={handleChange('load')} style={{width: 'calc(100% - 20px)', margin: 10, background: '#F5F5F5'}}>
                            <ExpansionPanelSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls='panel1a-content'
                                id='panel1a-header'
                                style={{background: '#fff'}}
                            >
                                <h3>Выгрузка</h3>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails className={classes.page}>
                                {showList.load.map((element, idx)=>
                                    <Link key={`unload${idx}`} href={element.link}>
                                        <Card className={isMobileApp?classes.cardM:classes.cardD}>
                                            <CardActionArea>
                                                <div className={classes.line}>
                                                    <h3 className={classes.input}>
                                                        {element.name}
                                                    </h3>
                                                </div>
                                            </CardActionArea>
                                        </Card>
                                    </Link>
                                )}
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                        :
                        null
                }
                {
                    showList.tools&&showList.tools.length>0?
                        <ExpansionPanel expanded={expanded === 'tools'} onChange={handleChange('tools')} style={{width: 'calc(100% - 20px)', margin: 10, background: '#F5F5F5'}}>
                            <ExpansionPanelSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls='panel1a-content'
                                id='panel1a-header'
                                style={{background: '#fff'}}
                            >
                                <h3>Инструменты</h3>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails className={classes.page} >
                                {showList.tools.map((element, idx)=>
                                    <Link key={`tool${idx}`} href={element.link}>
                                        <Card className={isMobileApp?classes.cardM:classes.cardD}>
                                            <CardActionArea>
                                                <div className={classes.line}>
                                                    <h3 className={classes.input}>
                                                        {element.name}
                                                    </h3>
                                                </div>
                                            </CardActionArea>
                                        </Card>
                                    </Link>
                                )}
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                        :
                        null
                }
                {
                    showList.integrate&& showList.integrate.length>0?
                        <ExpansionPanel expanded={expanded === 'integrate'} onChange={handleChange('integrate')} style={{width: 'calc(100% - 20px)', margin: 10, background: '#F5F5F5'}}>
                            <ExpansionPanelSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls='panel1a-content'
                                id='panel1a-header'
                                style={{background: '#fff'}}
                            >
                                <h3>Интеграция</h3>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails className={classes.page} >
                                {showList.integrate.map((element, idx)=>
                                    <Link key={`integrate${idx}`} href={element.link}>
                                        <Card className={isMobileApp?classes.cardM:classes.cardD}>
                                            <CardActionArea>
                                                <div className={classes.line}>
                                                    <h3 className={classes.input}>
                                                        {element.name}
                                                    </h3>
                                                </div>
                                            </CardActionArea>
                                        </Card>
                                    </Link>
                                )}
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                        :
                        null
                }
                {
                    showList.statistic&&showList.statistic.length>0?
                        <ExpansionPanel expanded={expanded === 'statistic'} onChange={handleChange('statistic')} style={{width: 'calc(100% - 20px)', margin: 10, background: '#F5F5F5'}}>
                            <ExpansionPanelSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls='panel1a-content'
                                id='panel1a-header'
                                style={{background: '#fff'}}
                            >
                                <h3>Статистика</h3>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails className={classes.page} >
                                {showList.statistic.map((element, idx)=>
                                    <Link key={`stat${idx}`} href={element.link}>
                                        <Card className={isMobileApp?classes.cardM:classes.cardD}>
                                            <CardActionArea>
                                                <div className={classes.line}>
                                                    <h3 className={classes.input}>
                                                        {element.name}
                                                    </h3>
                                                </div>
                                            </CardActionArea>
                                        </Card>
                                    </Link>
                                )}
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                        :
                        null
                }
                {
                    showList.statisticAzykStore&&showList.statisticAzykStore.length>0?
                        <ExpansionPanel expanded={expanded === 'statisticAzykStore'} onChange={handleChange('statisticAzykStore')} style={{width: 'calc(100% - 20px)', margin: 10, background: '#F5F5F5'}}>
                            <ExpansionPanelSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls='panel1a-content'
                                id='panel1a-header'
                                style={{background: '#fff'}}
                            >
                                <h3>Статистика AZYK.STORE</h3>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails className={classes.page} >
                                {showList.statisticAzykStore.map((element, idx)=>
                                    <Link key={`statAzykStore${idx}`} href={element.link}>
                                        <Card className={isMobileApp?classes.cardM:classes.cardD}>
                                            <CardActionArea>
                                                <div className={classes.line}>
                                                    <h3 className={classes.input}>
                                                        {element.name}
                                                    </h3>
                                                </div>
                                            </CardActionArea>
                                        </Card>
                                    </Link>
                                )}
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                        :
                        null
                }
            </div>
        </App>
    )
})

Statistic.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    let showList = {
        statistic: [],
        tools: [],
        integrate: [],
        load: [],
        statisticAzykStore: []
    }
    for(let i=0; i<list.statisticAzykStore.length; i++){
        if(list.statisticAzykStore[i].role.includes(ctx.store.getState().user.profile.role))
            showList.statisticAzykStore.push(list.statisticAzykStore[i])
    }
    for(let i=0; i<list.statistic.length; i++){
        if(list.statistic[i].role.includes(ctx.store.getState().user.profile.role))
            showList.statistic.push(list.statistic[i])
    }
    for(let i=0; i<list.tools.length; i++){
        if(list.tools[i].role.includes(ctx.store.getState().user.profile.role))
            showList.tools.push(list.tools[i])
    }
    for(let i=0; i<list.integrate.length; i++){
        if(list.integrate[i].role.includes(ctx.store.getState().user.profile.role))
            showList.integrate.push(list.integrate[i])
    }
    for(let i=0; i<list.load.length; i++){
        if(list.load[i].role.includes(ctx.store.getState().user.profile.role))
            showList.load.push(list.load[i])
    }
    return {
        showList: showList
    }
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Statistic);
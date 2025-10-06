import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import App from '../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../src/styleMUI/statistic/statisticsList'
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
    statistic: [
        {
            name: 'История посещений',
            link: '/statistic/statistic/agenthistorygeo',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Карта посещений',
            link: '/statistic/statistic/agentmapgeo',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Рабочие часы',
            link: '/statistic/statistic/agentsworktime',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Агенты',
            link: '/statistic/statistic/agents',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Акции',
            link: '/statistic/statistic/adss',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Возвраты',
            link: '/statistic/statistic/returneds',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Девайсы',
            link: '/statistic/statistic/device',
            role: ['admin']
        },
        {
            name: 'Заказы',
            link: '/statistic/statistic/orders',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Заказы вне маршрута',
            link: '/statistic/statistic/ordersOffRoute',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Карта заказов',
            link: '/statistic/statistic/ordersmap',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Клиенты',
            link: '/statistic/statistic/clients',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Клиенты в городах',
            link: '/statistic/statistic/clientcity',
            role: ['admin']
        },
        {
            name: 'Мерчендайзинг',
            link: '/statistic/statistic/merchandising',
            role: ['admin', 'суперорганизация', 'организация']
        },
        {
            name: 'Товары',
            link: '/statistic/statistic/items',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Часы',
            link: '/statistic/statistic/hours',
            role: ['admin']
        },
    ],
    tools: [
        {
            name: 'Дни поставки',
            link: '/statistic/tools/deliverydate',
            role: ['admin', 'суперорганизация', 'организация']
        },
        {
            name: 'Лимит покупки товаров клиентом',
            link: '/statistic/tools/limititemclient',
            role: ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент']
        },
        {
            name: 'Логистика',
            link: '/statistic/tools/logisticorder',
            role: ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент']
        },
        {
            name: 'Оффлайн заказы',
            link: '/statistic/tools/offlineorder',
            role: ['агент', 'суперагент']
        },
        {
            name: 'Проверка маршрутов',
            link:'/statistic/tools/checkagentroute',
            role: ['суперорганизация', 'admin']
        },
        {
            name: 'Сети клиентов',
            link: '/statistic/tools/clientnetworks',
            role: ['admin', 'суперорганизация', 'организация']
        },
        {
            name: 'Скидки клиентов',
            link: '/statistic/tools/discountclient',
            role: ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент']
        },
        {
            name: 'Специальная цена категория',
            link: '/statistic/tools/specialpricecategory',
            role: ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент']
        },
        {
            name: 'Специальная цена клиента',
            link: '/statistic/tools/specialpriceclient',
            role: ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент']
        },
    ],
    administration: [
        {
            name: 'Баннера',
            link: '/statistic/administration/banners',
            role: ['admin']
        },
        {
            name: 'История',
            link: '/statistic/administration/histories',
            role: ['admin']
        },
        {
            name: 'Подписчики',
            link: '/statistic/administration/subscribers',
            role: ['admin']
        },
        {
            name: 'Пуш-уведомления',
            link: '/statistic/administration/notificationStatistic',
            role: ['admin']
        },
        {
            name: 'Сбои',
            link: '/statistic/administration/errors',
            role: ['admin']
        },
        {
            name: 'Статистика сбоев',
            link: '/statistic/administration/errorsStatistic',
            role: ['admin']
        },
        {
            name: 'Статистика RAM',
            link: '/statistic/administration/ram',
            role: ['admin']
        },
        {
            name: 'Файловое хранилище',
            link: '/statistic/administration/files',
            role: ['admin']
        },
        {
            name: 'Хранилище коллекций',
            link: '/statistic/administration/statisticstoragesize',
            role: ['admin']
        },
    ],
    integrate: [
        {
            name: 'Акционная интеграции 1С',
            link: '/organizations?path=statistic/integrate/outxmlads&title=Акционная интеграция 1С',
            role: ['admin']
        },
        {
            name: 'Выгрузка интеграции 1С',
            link: '/organizations?path=statistic/integrate/integrateout&title=Выгрузка интеграции 1С',
            role: ['admin']
        },
        {
            name: 'Интеграция 1С',
            link: '/organizations?path=statistic/integrate/integrate&title=Интеграция 1С',
            role: ['admin']
        },
        {
            name: 'Интеграция клиентов 1С',
            link: '/organizations?path=statistic/integrate/clientssync&title=Интеграция клиентов 1С',
            role: ['admin']
        },
        {
            name: 'Логи 1С',
            link: '/organizations?path=statistic/integrate/integrationLogs&title=Логи 1С',
            role: ['admin']
        },
        {
            name: 'Несинхронизованные заказы 1С',
            link: `/statistic/integrate/unsyncorder`,
            role: ['admin']
        },
        {
            name: 'Проверка интеграции клиентов',
            link:'/statistic/integrate/checkintegrateclient',
            role: ['admin']
        },
    ],
    uploaddownload: [
        {
            name: 'Выгрузка акционных заказов',
            link: '/statistic/uploaddownload/downloadadsorders',
            role: ['admin', 'суперорганизация', 'организация']
        },
        {
            name: 'Выгрузка заказов',
            link: '/statistic/uploaddownload/downloadorders',
            role: ['admin', 'суперорганизация']
        },
        {
            name: 'Выгрузка клиентов',
            link: '/statistic/uploaddownload/downloadclients',
            role: ['admin']
        },
        {
            name: 'Выгрузка маршрутов',
            link: '/statistic/uploaddownload/downloadagentroutes',
            role: ['admin']
        },
        {
            name: 'Выгрузка накладных',
            link: '/statistic/uploaddownload/downloadinvoices',
            role: ['admin']
        },
        {
            name: 'Выгрузка оборудования',
            link: '/statistic/uploaddownload/downloadequipments',
            role: ['admin', 'суперорганизация', 'организация', 'менеджер']
        },
        {
            name: 'Выгрузка планов клиентов',
            link: '/statistic/uploaddownload/unloadplanclients',
            role: ['admin', 'суперорганизация', 'организация', 'менеджер']
        },
        {
            name: 'Выгрузка районов',
            link: '/statistic/uploaddownload/downloaddistricts',
            role: ['admin']
        },
        {
            name: 'Выгрузка сотрудников',
            link: '/statistic/uploaddownload/downloademployments',
            role: ['admin']
        },
        {
            name: 'Загрузка клиентов',
            link: '/statistic/uploaddownload/uploadclients',
            role: ['admin']
        },
        {
            name: 'Загрузка GUID клиентов',
            link: '/statistic/uploaddownload/downloadintegrate1C',
            role: ['admin']
        },
        {
            name: 'Загрузка маршрутов',
            link: '/statistic/uploaddownload/uploadagentroute',
            role: ['admin']
        },
        {
            name: 'Загрузка планов клиентов',
            link: '/statistic/uploaddownload/uploadplanclients',
            role: ['admin', 'суперорганизация', 'организация', 'менеджер']
        },
        {
            name: 'Загрузка районов',
            link: '/statistic/uploaddownload/uploaddistricts',
            role: ['admin']
        },
        {
            name: 'Загрузка товаров',
            link: '/statistic/uploaddownload/uploaditems',
            role: ['admin']
        },
    ]
}

const Statistic = React.memo((props) => {
    const classes = pageListStyle();
    const {isMobileApp, search} = props.app;
    const {profile} = props.user;
    let [showList, setShowList] = useState({});
    const [expanded, setExpanded] = React.useState(false);
    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };
    useEffect(() => {
        showList = {
            statistic: [],
            tools: [],
            administration: [],
            integrate: [],
            uploaddownload: [],
        }
        for (let i = 0; i < list.statistic.length; i++) {
            if(list.statistic[i].name.toLowerCase().includes(search.toLowerCase()) && list.statistic[i].role.includes(profile.role))
                showList.statistic.push(list.statistic[i])
        }
        for (let i = 0; i < list.tools.length; i++) {
            if(list.tools[i].name.toLowerCase().includes(search.toLowerCase()) && list.tools[i].role.includes(profile.role))
                showList.tools.push(list.tools[i])
        }
        for (let i = 0; i < list.administration.length; i++) {
            if(list.administration[i].name.toLowerCase().includes(search.toLowerCase()) && list.administration[i].role.includes(profile.role))
                showList.administration.push(list.administration[i])
        }
        for (let i = 0; i < list.integrate.length; i++) {
            if(list.integrate[i].name.toLowerCase().includes(search.toLowerCase()) && list.integrate[i].role.includes(profile.role))
                showList.integrate.push(list.integrate[i])
        }
        for (let i = 0; i < list.uploaddownload.length; i++) {
            if(list.uploaddownload[i].name.toLowerCase().includes(search.toLowerCase()) && list.uploaddownload[i].role.includes(profile.role))
                showList.uploaddownload.push(list.uploaddownload[i])
        }
        setShowList({...showList})
    }, [search])

    return (
        <App searchShow pageName='Инструменты'>
            <Head>
                <title>Инструменты</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                {
                    showList.administration&&showList.administration.length?
                        <ExpansionPanel expanded={expanded === 'administration'} onChange={handleChange('administration')} style={{width: 'calc(100% - 20px)', margin: 10, background: '#F5F5F5'}}>
                            <ExpansionPanelSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls='panel1a-content'
                                id='panel1a-header'
                                style={{background: '#fff'}}
                            >
                                <h3>Администрирование</h3>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails className={classes.page} >
                                {showList.administration.map((element, idx) =>
                                    <Link key={`tool${idx}`} href={element.link}>
                                        <a>
                                            <Card className={isMobileApp?classes.cardM:classes.cardD}>
                                                <CardActionArea>
                                                    <div className={classes.line}>
                                                        <h3 className={classes.input}>
                                                            {element.name}
                                                        </h3>
                                                    </div>
                                                </CardActionArea>
                                            </Card>
                                        </a>
                                    </Link>
                                )}
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                        :
                        null
                }
                {
                    showList.uploaddownload&&showList.uploaddownload.length?
                        <ExpansionPanel expanded={expanded === 'uploaddownload'} onChange={handleChange('uploaddownload')} style={{width: 'calc(100% - 20px)', margin: 10, background: '#F5F5F5'}}>
                            <ExpansionPanelSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls='panel1a-content'
                                id='panel1a-header'
                                style={{background: '#fff'}}
                            >
                                <h3>Выгрузка/Загрузка</h3>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails className={classes.page}>
                                {showList.uploaddownload.map((element, idx) =>
                                    <Link key={`unload${idx}`} href={element.link}>
                                        <a>
                                            <Card className={isMobileApp?classes.cardM:classes.cardD}>
                                                <CardActionArea>
                                                    <div className={classes.line}>
                                                        <h3 className={classes.input}>
                                                            {element.name}
                                                        </h3>
                                                    </div>
                                                </CardActionArea>
                                            </Card>
                                        </a>
                                    </Link>
                                )}
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                        :
                        null
                }
                {
                    showList.tools&&showList.tools.length?
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
                                {showList.tools.map((element, idx) =>
                                    <Link key={`tool${idx}`} href={element.link}>
                                        <a>
                                            <Card className={isMobileApp?classes.cardM:classes.cardD}>
                                                <CardActionArea>
                                                    <div className={classes.line}>
                                                        <h3 className={classes.input}>
                                                            {element.name}
                                                        </h3>
                                                    </div>
                                                </CardActionArea>
                                            </Card>
                                        </a>
                                    </Link>
                                )}
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                        :
                        null
                }
                {
                    showList.integrate&& showList.integrate.length?
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
                                {showList.integrate.map((element, idx) =>
                                    <Link key={`integrate${idx}`} href={element.link}>
                                        <a>
                                            <Card className={isMobileApp?classes.cardM:classes.cardD}>
                                                <CardActionArea>
                                                    <div className={classes.line}>
                                                        <h3 className={classes.input}>
                                                            {element.name}
                                                        </h3>
                                                    </div>
                                                </CardActionArea>
                                            </Card>
                                        </a>
                                    </Link>
                                )}
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                        :
                        null
                }
                {
                    showList.statistic&&showList.statistic.length?
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
                                {showList.statistic.map((element, idx) =>
                                    <Link key={`stat${idx}`} href={element.link}>
                                        <a>
                                            <Card className={isMobileApp?classes.cardM:classes.cardD}>
                                                <CardActionArea>
                                                    <div className={classes.line}>
                                                        <h3 className={classes.input}>
                                                            {element.name}
                                                        </h3>
                                                    </div>
                                                </CardActionArea>
                                            </Card>
                                        </a>
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
    return {}
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Statistic);
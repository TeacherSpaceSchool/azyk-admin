import React, {useState} from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import drawerStyle from '../../src/styleMUI/drawer'
import * as appActions from '../../redux/actions/app'
import Drawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ReorderIcon from '@material-ui/icons/ViewList';
import AllInboxIcon from '@material-ui/icons/AllInbox';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import CopyrightIcon from '@material-ui/icons/Loyalty';
import LiveHelp from '@material-ui/icons/LiveHelp';
import InfoIcon from '@material-ui/icons/Info';
import SmsIcon from '@material-ui/icons/Sms';
import GroupIcon from '@material-ui/icons/Group';
import ReceiptIcon from '@material-ui/icons/Receipt';
import RateReview from '@material-ui/icons/RateReview';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import BusinessCenterIcon from '@material-ui/icons/BusinessCenter';
import EqualizerIcon from '@material-ui/icons/Build';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import ImageIcon from '@material-ui/icons/Image';
import TargetIcon from '@material-ui/icons/TrackChanges';
import DashboardIcon from '@material-ui/icons/Dashboard';
import WarehousesIcon from '@material-ui/icons/Home';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Badge from '@material-ui/core/Badge';
import LocalGroceryStore from '@material-ui/icons/LocalGroceryStore';
import {isNotTestUser} from '../../src/lib';
import Sign from '../dialog/Sign';
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import LocalShipping from '@material-ui/icons/LocalShipping';
import UnfoldMore from '@material-ui/icons/UnfoldMore';
import UnfoldLess from '@material-ui/icons/UnfoldLess';

const MyDrawer = React.memo((props) => {
    const {classes, unread} = props
    const {drawer, isMobileApp} = props.app;
    const {profile, authenticated} = props.user;
    const {showDrawer} = props.appActions;
    let variant = isMobileApp?'temporary' : 'permanent';
    const open = isMobileApp?drawer:true;
    const router = useRouter();
    const isEmptyQuery = !router.asPath.includes('?')||router.asPath.endsWith('?')
    const [uncover, setUncover] = useState(router.asPath);
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    return (
        <Drawer
            disableSwipeToOpen = {true}
            disableBackdropTransition = {true}
            onOpen={() =>showDrawer(true)}
            disableDiscovery
            variant= {variant}
            className={classes.drawer}
            open={open}
            onClose={() =>showDrawer(false)}
            classes={{paper: classes.drawerPaper,}}
        >
            {
                isMobileApp?
                    null
                    :
                    <div className={classes.toolbar}/>
            }
            <List>
                <Divider />
                {
                    ['admin', 'client'].includes(profile.role)?
                        <>
                        <Link href='/'>
                            <ListItem style={{background: (router.pathname===('/')||router.pathname.includes('brand')||router.pathname.includes('item'))&&!router.pathname.includes('subbrands')&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                <ListItemIcon><CopyrightIcon color='inherit'/></ListItemIcon>
                                <ListItemText primary='Бренды' />
                            </ListItem>
                        </Link>
                        <Divider/>
                        </>
                        :null
                }
                {
                    ['агент', 'суперагент', 'экспедитор', 'суперорганизация', 'организация', 'менеджер', 'суперэкспедитор'].includes(profile.role)?
                        <>
                            <Link href={'/catalog'} as={'/catalog'}>
                                <ListItem style={{background:router.pathname.includes('catalog')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                    <ListItemIcon><LocalGroceryStore color='inherit'/></ListItemIcon>
                                    <ListItemText primary={'Каталог'} />
                                </ListItem>
                            </Link>
                            <Divider/>
                        </>
                        :null
                }
                {
                    ['суперорганизация', 'организация', 'менеджер'].includes(profile.role)?
                        <>
                            <Link href={'/items/[id]'} as={'/items/all'}>
                                <ListItem style={{background:
                                        (
                                            router.pathname.includes('item')
                                        )&&!router.pathname.includes('statistic')?
                                            'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                    <ListItemIcon><ReorderIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary={'Товары'} />
                                </ListItem>
                            </Link>
                            <Divider/>
                        </>
                            :
                            null
                }
                {
                    ['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                        <>
                        <Link href='/subbrands'>
                            <ListItem style={{background: router.pathname.includes('subbrands')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                <ListItemIcon><CopyrightIcon color='inherit'/></ListItemIcon>
                                <ListItemText primary='Подбренды' />
                            </ListItem>
                        </Link>
                        <Divider/>
                        </>
                        :null
                }
                {
                    ['admin', 'client', 'суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент'].includes(profile.role)?
                        <>
                            <Link href={!profile.organization?'/organizations?path=ads&title=Акции':'/ads/[id]'}
                                  as={!profile.organization?'/organizations?path=ads&title=Акции':`/ads/${profile.organization}`}>
                                <ListItem style={{background: router.asPath.includes('ads')&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                    <ListItemIcon><WhatshotIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary='Акции' />
                                </ListItem>
                            </Link>
                            <Divider/>
                        </>
                        :null
                }
                {
                    ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент', 'экспедитор'].includes(profile.role)?
                        <>
                        <Link href={'/clients'}>
                            <ListItem style={{background: router.pathname.includes('client')&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                <ListItemIcon><GroupIcon color='inherit'/></ListItemIcon>
                                <ListItemText primary='Клиенты' />
                            </ListItem>
                        </Link>
                        <Divider/>
                        </>
                        :null
                }
                {
                    ['экспедитор', 'client', 'admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент', 'суперэкспедитор'].includes(profile.role)?
                        <>
                        <Link href='/orders'>
                            <ListItem style={{background: router.pathname==='/orders'&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                <ListItemIcon><ReceiptIcon color='inherit'/></ListItemIcon>
                                <ListItemText primary='Заказы' />
                                <Badge color='secondary' variant='dot' invisible={!unread.orders}/>
                            </ListItem>
                        </Link>
                        <Divider/>
                        </>
                        :null
                }
                {
                    ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент'].includes(profile.role)?
                        <>
                        <Link href='/returneds'>
                            <ListItem style={{background: router.pathname==='/returneds'&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                <ListItemIcon><ReceiptIcon color='inherit'/></ListItemIcon>
                                <ListItemText primary='Возвраты' />
                                <Badge color='secondary' variant='dot' invisible={!unread.returneds}/>
                            </ListItem>
                        </Link>
                        <Divider/>
                        </>
                        :null
                }
                {
                    authenticated?
                        profile.organization?
                            <Link href='/organization/[id]' as={`/organization/${profile.organization}`}>
                                <ListItem style={{background: isEmptyQuery&&router.pathname.includes('organization')&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                    <ListItemIcon><BusinessCenterIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary='Организация' />
                                </ListItem>
                            </Link>
                            :
                            <Link href='/organizations'>
                                <ListItem style={{background: isEmptyQuery&&router.pathname.includes('organization')&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                    <ListItemIcon><BusinessCenterIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary='Организации' />
                                </ListItem>
                            </Link>
                        :
                        null
                }
                <Divider/>
                {
                    ['admin', 'суперорганизация', 'организация', 'менеджер'].includes(profile.role)?
                        <>
                        <Link href={profile.role==='admin'?'/organizations?path=employments&title=Сотрудники&super=1':'/employments/[id]'}
                              as={profile.role==='admin'?'/organizations?path=employments&title=Сотрудники&super=1':`/employments/${profile.organization}`}>
                            <ListItem style={{background: router.asPath.includes('employment')&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                <ListItemIcon><GroupIcon color='inherit'/></ListItemIcon>
                                <ListItemText primary='Сотрудники' />
                            </ListItem>
                        </Link>
                        <Divider/>
                        </>
                        :null
                }
                {
                    ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент'].includes(profile.role)?
                        <>
                            <Link href={profile.role==='admin'?`/organizations?path=districts&title=Районы&super=1`:['агент', 'суперагент'].includes(profile.role)?'/district/[id]':'/districts/[id]'}
                                  as={profile.role==='admin'?`/organizations?path=districts&title=Районы&super=1`:['агент', 'суперагент'].includes(profile.role)?'/district/agent':`/districts/${profile.organization}`}>
                                <ListItem style={{background: router.asPath.includes('district')&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                    <ListItemIcon><LocationCityIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary={['агент', 'суперагент'].includes(profile.role)?'Район':'Районы'} />
                                </ListItem>
                            </Link>
                            <Divider/>
                        </>
                        :null
                }
                {
                    ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент'].includes(profile.role)?
                        <>
                            <Link href={profile.role==='admin'?`/organizations?path=agentroutes&title=Маршруты агентов&super=1`:['агент', 'суперагент'].includes(profile.role)?'/agentroute/[id]':'/agentroutes/[id]'}
                                  as={profile.role==='admin'?`/organizations?path=agentroutes&title=Маршруты агентов&super=1`:['агент', 'суперагент'].includes(profile.role)?'/agentroute/agent':`/agentroutes/${profile.organization}`}>
                                <ListItem style={{background: router.asPath.includes('agentroute')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                    <ListItemIcon><FormatListNumberedIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary={['агент', 'суперагент'].includes(profile.role)?'Маршрут агента':'Маршруты агентов'} />
                                </ListItem>
                            </Link>
                            <Divider/>
                        </>
                        :null
                }
                {['admin', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(profile.role)?profile.role==='агент'?<Link href={'/logistic/changelogistic/[id]'} as={`/logistic/changelogistic/${profile.organization}`}>
                    <ListItem style={{background: router.asPath.includes('logistic/changelogistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => {showDrawer(false);}}>
                        <ListItemIcon><LocalShipping color="inherit"/></ListItemIcon>
                        <ListItemText primary='Редактирование логистики'/>
                    </ListItem>
                </Link>:<>
                    <ListItem style={{background: router.asPath.includes('logistic') ? 'rgba(255, 179, 0, 0.15)' : '#ffffff'}} button onClick={() => {showDrawer(false);setUncover(uncover => uncover !== 'logistic' ? 'logistic' : '')}}>
                        <ListItemIcon><LocalShipping color="inherit"/></ListItemIcon>
                        <ListItemText primary="Логистика"/>
                        {uncover.includes('logistic') ? <UnfoldLess/> : <UnfoldMore/>}
                    </ListItem>
                    <Divider/>
                    {uncover.includes('logistic')?<>
                        <Link href={profile.role==='admin'?'/organizations?path=logistic/financereport&title=Отчет по деньгам':'/logistic/financereport/[id]'}
                              as={profile.role==='admin'?'/organizations?path=logistic/financereport&title=Отчет по деньгам':`/logistic/financereport/${profile.organization}`}>
                            <ListItem style={{background: router.asPath.includes('logistic/financereport')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => {showDrawer(false);}}>
                                <ListItemIcon/>
                                <ListItemText primary='Отчет по деньгам'/>
                            </ListItem>
                        </Link>
                        <Divider/>
                        <Link href={profile.role==='admin'?'/organizations?path=logistic/changelogistic&title=Редактирование логистики':'/logistic/changelogistic/[id]'}
                              as={profile.role==='admin'?'/organizations?path=logistic/changelogistic&title=Редактирование логистики':`/logistic/changelogistic/${profile.organization}`}>
                            <ListItem style={{background: router.asPath.includes('logistic/changelogistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => {showDrawer(false);}}>
                                <ListItemIcon/>
                                <ListItemText primary='Редактирование логистики'/>
                            </ListItem>
                        </Link>
                        <Divider/>
                        <Link href={profile.role==='admin'?'/organizations?path=logistic/summaryinvoice&title=Отчет по деньгам':'/logistic/summaryinvoice/[id]'}
                              as={profile.role==='admin'?'/organizations?path=logistic/summaryinvoice&title=Отчет по деньгам':`/logistic/summaryinvoice/${profile.organization}`}>
                            <ListItem style={{background: router.asPath.includes('logistic/summaryinvoice')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => {showDrawer(false);}}>
                                <ListItemIcon/>
                                <ListItemText primary='Сводная накладная'/>
                            </ListItem>
                        </Link>
                        <Divider/>
                    </>:null}
                </>:null}
                {
                    ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'ремонтник'].includes(profile.role)?
                        <>
                            <Link href={profile.role==='admin'?'/organizations?path=equipments&title=Оборудование':'/equipments/[id]'}
                                  as={profile.role==='admin'?'/organizations?path=equipments&title=Оборудование':`/equipments/${profile.organization}`}>
                                <ListItem style={{background: router.asPath.includes('equipment')&&!router.asPath.includes('repairequipment')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                    <ListItemIcon><AllInboxIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary='Оборудование' />
                                </ListItem>
                            </Link>
                            <Divider/>
                        </>
                        :null
                }
                {
                    isNotTestUser(profile)&&['admin', 'client', 'суперорганизация', 'организация'].includes(profile.role)?
                        <>
                        <Link href='/reviews'>
                            <ListItem style={{background: router.pathname==='/reviews'?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                <ListItemIcon><RateReview color='inherit'/></ListItemIcon>
                                <ListItemText primary='Отзывы' />
                            </ListItem>
                        </Link>
                        <Divider/>
                        </>
                        :null
                }
                {
                    ['admin', 'суперагент', 'суперорганизация', 'организация', 'менеджер', 'агент', 'мерчендайзер'].includes(profile.role)?
                        <>
                            <Link href={profile.role==='admin'?'/organizations?path=merchandisings&title=Мерчендайзинг':'/merchandisings/[id]'}
                                  as={profile.role==='admin'?'/organizations?path=merchandisings&title=Мерчендайзинг':`/merchandisings/${profile.organization}`}>
                                <ListItem style={{background: router.asPath.includes('merchandising')&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                    <ListItemIcon><AssignmentIndIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary='Мерчендайзинг' />
                                </ListItem>
                            </Link>
                            <Divider/>
                        </>
                        :null
                }
                {
                    ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'мерчендайзер'].includes(profile.role)?
                        <>
                            <Link href={profile.role==='admin'?'/organizations?path=fhoclients&title=ФХО%20клиентов':'/fhoclients/[id]'}
                                  as={profile.role==='admin'?'/organizations?path=fhoclients&title=ФХО%20клиентов':`/fhoclients/${profile.organization}`}>
                                <ListItem style={{background: router.asPath.includes('fhoclients')&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                    <ListItemIcon><ImageIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary='ФХО клиентов' />
                                </ListItem>
                            </Link>
                            <Divider/>
                        </>
                        :null
                }
                {/*
                    ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(profile.role)?
                        <>
                            <ListItem style={{background: router.asPath.includes('logistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => {showDrawer(false); setUncover(uncover => uncover!=='logistic'?'logistic':'')}}>
                                <ListItemIcon><LocalShipping color='inherit'/></ListItemIcon>
                                <ListItemText primary='Консигнации' />
                                {uncover.includes('logistic') ? <UnfoldLess/> : <UnfoldMore/>}
                            </ListItem>
                            <Divider/>
                            {uncover.includes('logistic')?<>
                                {['admin', 'суперорганизация', 'организация', 'менеджер'].includes(profile.role)?<>
                                    <Link href={profile.role==='admin'?'/organizations?path=logistic/financereport&title=Отчет по деньгам':'/logistic/financereport/[id]'}
                                          as={profile.role==='admin'?'/organizations?path=logistic/financereport&title=Отчет по деньгам':`/logistic/financereport/${profile.organization}`}>
                                        <ListItem style={{background: router.asPath.includes('logistic/financereport')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => {showDrawer(false);}}>
                                            <ListItemIcon/>
                                            <ListItemText primary='Отчет по деньгам'/>
                                        </ListItem>
                                    </Link>
                                    <Divider/>
                                </>:null}
                                {['admin', 'суперорганизация', 'организация', 'менеджер'].includes(profile.role)?<>
                                    <Link href={profile.role==='admin'?'/organizations?path=logistic/changelogistic&title=Редактирование логистики':'/logistic/changelogistic/[id]'}
                                          as={profile.role==='admin'?'/organizations?path=logistic/changelogistic&title=Редактирование логистики':`/logistic/changelogistic/${profile.organization}`}>
                                        <ListItem style={{background: router.asPath.includes('logistic/changelogistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => {showDrawer(false);}}>
                                            <ListItemIcon/>
                                            <ListItemText primary='Статистик'/>
                                        </ListItem>
                                    </Link>
                                    <Divider/>
                                </>:null}
                            </>:null}
                        </>
                        :null
                */}
                {
                    ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(profile.role)?
                        <>
                            <Link href={profile.role==='admin'?'/organizations?path=consigflows&title=Задолженность':'/consigflows/[id]'}
                                  as={profile.role==='admin'?'/organizations?path=consigflows&title=Задолженность':`/consigflows/${profile.organization}`}>
                                <ListItem style={{background: router.asPath.includes('planClients')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                    <ListItemIcon><TargetIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary='Задолженность' />
                                </ListItem>
                            </Link>
                            <Divider/>
                        </>
                        :null
                }
                {
                    ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(profile.role)?
                        <>
                            <Link href={profile.role==='admin'?'/organizations?path=planClients&title=Планы клиентов':'/planClients/[id]'}
                                  as={profile.role==='admin'?'/organizations?path=planClients&title=Планы клиентов':`/planClients/${profile.organization}`}>
                                <ListItem style={{background: router.asPath.includes('planClients')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                    <ListItemIcon><TargetIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary='Планы клиентов' />
                                </ListItem>
                            </Link>
                            <Divider/>
                        </>
                        :null
                }
                {
                    ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(profile.role)?
                        <>
                            <Link href={profile.role==='admin'?'/organizations?path=stocks&title=Остатки':'/stocks/[id]'}
                                  as={profile.role==='admin'?'/organizations?path=stocks&title=Остатки':`/stocks/${profile.organization}`}>
                                <ListItem style={{background: router.asPath.includes('stocks')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                    <ListItemIcon><DashboardIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary='Остатки' />
                                </ListItem>
                            </Link>
                            <Divider/>
                        </>
                        :null
                }
                {
                    ['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                        <>
                            <Link href={profile.role==='admin'?'/organizations?path=warehouses&title=Склады':'/warehouses/[id]'}
                                  as={profile.role==='admin'?'/organizations?path=warehouses&title=Склады':`/warehouses/${profile.organization}`}>
                                <ListItem style={{background: router.asPath.includes('warehouses')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                    <ListItemIcon><WarehousesIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary='Склады' />
                                </ListItem>
                            </Link>
                            <Divider/>
                        </>
                        :null
                }
                {
                    isNotTestUser(profile)&&authenticated?
                        <>
                        <Link href={'/faq'}>
                            <ListItem style={{background: router.pathname==='/faq'?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                <ListItemIcon><LiveHelp color='inherit'/></ListItemIcon>
                                <ListItemText primary='Инструкции' />
                            </ListItem>
                        </Link>
                        <Divider/>
                        </>
                        :
                        null
                }
                {
                    'admin'===profile.role||!profile.role?
                        <>
                        <Link href='/connectionapplications'>
                            <ListItem style={{background: router.pathname==='/connectionapplications'?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                <ListItemIcon><SmsIcon color='inherit'/></ListItemIcon>
                                <ListItemText primary='Заявка на подключение' />
                            </ListItem>
                        </Link>
                        <Divider/>
                        </>
                        :null
                }
                <Link href={'/contact'}>
                    <ListItem style={{background: router.pathname==='/contact'?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                        <ListItemIcon><InfoIcon color='inherit'/></ListItemIcon>
                        <ListItemText primary='Контакты' />
                    </ListItem>
                </Link>
                <Divider/>
                {
                    ['admin','суперорганизация', 'организация', 'менеджер', 'агент'].includes(profile.role)?
                        <>
                            <Link href={'/statistic'}>
                                <ListItem style={{background: router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={() => showDrawer(false)}>
                                    <ListItemIcon><EqualizerIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary='Инструменты' />
                                </ListItem>
                            </Link>
                            <Divider/>
                        </>
                        :null
                }
                {
                    !profile.role?
                        <>
                            <ListItem button onClick={() => {
                                setMiniDialog('Вход', <Sign isMobileApp={isMobileApp}/>)
                                showMiniDialog(true)
                                
                                showDrawer(false)
                            }}>
                                <ListItemIcon><ExitToAppIcon color='inherit'/></ListItemIcon>
                                <ListItemText primary='Войти в приложение' />
                            </ListItem>
                            <Divider/>
                        </>
                        :
                        null
                }
            </List>
        </Drawer>
    )
})

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
    }
}

MyDrawer.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(drawerStyle)(MyDrawer))
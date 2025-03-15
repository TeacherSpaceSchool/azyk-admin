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
import CommuteIcon from '@material-ui/icons/Commute';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import CopyrightIcon from '@material-ui/icons/Loyalty';
import LiveHelp from '@material-ui/icons/LiveHelp';
import InfoIcon from '@material-ui/icons/Info';
import SmsIcon from '@material-ui/icons/Sms';
import GroupIcon from '@material-ui/icons/Group';
import ReceiptIcon from '@material-ui/icons/Receipt';
import LocalActivityIcon from '@material-ui/icons/LocalActivity';
import BallotIcon from '@material-ui/icons/Ballot';
import RateReview from '@material-ui/icons/RateReview';
import LocalShipping from '@material-ui/icons/LocalShipping';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import BusinessCenterIcon from '@material-ui/icons/BusinessCenter';
import ArtTrackIcon from '@material-ui/icons/ArtTrack';
import EqualizerIcon from '@material-ui/icons/Build';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import TargetIcon from '@material-ui/icons/TrackChanges';
import DashboardIcon from '@material-ui/icons/Dashboard';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Badge from '@material-ui/core/Badge';
import LocalGroceryStore from '@material-ui/icons/LocalGroceryStore';
import {isNotTestUser} from '../../src/lib';
import Sign from '../dialog/Sign';
import * as mini_dialogActions from '../../redux/actions/mini_dialog'

const MyDrawer = React.memo((props) => {
    const { classes, unread } = props
    const { drawer, isMobileApp } = props.app;
    const { profile, authenticated } = props.user;
    const { showDrawer } = props.appActions;
    let variant = isMobileApp?'temporary' : 'permanent';
    const open = isMobileApp?drawer:true;
    const router = useRouter();
    const [uncover, setUncover] = useState(null);
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    return (
        <Drawer
            disableSwipeToOpen = {true}
            disableBackdropTransition = {true}
            onOpen={()=>showDrawer(true)}
            disableDiscovery={true}
            variant= {variant}
            className={classes.drawer}
            open={open}
            onClose={()=>showDrawer(false)}
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
                            <ListItem style={{background: (router.pathname===('/')||router.pathname.includes('brand'))&&!router.pathname.includes('subbrands')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
                                <ListItemIcon><CopyrightIcon color='inherit'/></ListItemIcon>
                                <ListItemText primary='Бренды' />
                            </ListItem>
                        </Link>
                        <Divider/>
                        </>
                        :null
                }
                {
                    'admin'===profile.role?
                        <>
                        <Link href='/subbrands'>
                            <ListItem style={{background: router.pathname.includes('subbrands')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
                                <ListItemIcon><CopyrightIcon color='inherit'/></ListItemIcon>
                                <ListItemText primary='Подбренды' />
                            </ListItem>
                        </Link>
                        <Divider/>
                        </>
                        :null
                }
                {
                    ['экспедитор', 'суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент', 'суперэкспедитор'].includes(profile.role)?
                        <>
                        <Link href={'/catalog'} as={'/catalog'}>
                            <ListItem style={{background:router.pathname.includes('catalog')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{showDrawer(false)}}>
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
                                        router.pathname===('/category')
                                        ||
                                        router.pathname.includes('subcategory')
                                        ||
                                        router.pathname.includes('item')
                                    )&&!router.pathname.includes('statistic')?
                                        'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{showDrawer(false)}}>
                                    <ListItemIcon><ReorderIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary={'Товары'} />
                                </ListItem>
                            </Link>
                        <Divider/>
                        </>
                        :
                        isNotTestUser(profile)&&['client', 'admin'].includes(profile.role)?
                            <>
                            <Link href='/category'>
                                    <ListItem style={{background: (router.pathname===('/category')
                                    ||
                                    router.pathname.includes('subcategory')
                                    ||
                                    router.pathname.includes('item'))&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{showDrawer(false)}}>
                                        <ListItemIcon><ReorderIcon color='inherit'/></ListItemIcon>
                                        <ListItemText primary='Категории' />
                                    </ListItem>
                                </Link>
                            <Divider/>
                            </>
                            :
                            null
                }
                {
                    ['admin', 'client', 'суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент'].includes(profile.role)?
                        <>
                        <Link href={`/ads`} as={`/ads`}>
                            <ListItem style={{background: router.pathname.includes('ads')&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
                                <ListItemIcon><WhatshotIcon color='inherit'/></ListItemIcon>
                                <ListItemText primary='Акции' />
                            </ListItem>
                        </Link>
                        <Divider/>
                        </>
                        :null
                }
                {
                    isNotTestUser(profile)&&['admin', 'client', 'суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент'].includes(profile.role)?
                        <>
                        <Link href={`/lotterys`} as={`/lotterys`}>
                            <ListItem style={{background: router.pathname.includes('lottery')&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
                                <ListItemIcon><LocalActivityIcon color='inherit'/></ListItemIcon>
                                <ListItemText primary='Лотереи' />
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
                            <ListItem style={{background: router.pathname.includes('client')&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
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
                            <ListItem style={{background: router.pathname==='/orders'&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
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
                            <ListItem style={{background: router.pathname==='/returneds'&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
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
                                <ListItem style={{background: router.pathname.includes('organization')&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
                                    <ListItemIcon><BusinessCenterIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary='Организация' />
                                </ListItem>
                            </Link>
                            :
                            <Link href='/organizations'>
                                <ListItem style={{background: router.pathname.includes('organization')&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
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
                        <Link href={`/employments${['суперорганизация', 'организация', 'менеджер'].includes(profile.role)?'/[id]':''}`} as={`/employments${['суперорганизация', 'организация', 'менеджер'].includes(profile.role)?`/${profile.organization}`:''}`}>
                            <ListItem style={{background: router.pathname.includes('employment')&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
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
                        <Link href={['суперорганизация', 'организация', 'менеджер', 'admin'].includes(profile.role)?`/districts${['суперорганизация', 'организация', 'менеджер', 'оператор'].includes(profile.role)?'/[id]':''}`:'/district/[id]'} as={['суперорганизация', 'организация', 'менеджер', 'admin', 'оператор'].includes(profile.role)?`/districts${['суперорганизация', 'организация', 'менеджер', 'оператор'].includes(profile.role)?`/${profile.organization}`:''}`:'/district/agent'}>
                            <ListItem style={{background: router.pathname.includes('district')&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
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
                        <Link href={['суперорганизация', 'организация', 'менеджер', 'admin'].includes(profile.role)?`/agentroutes${['суперорганизация', 'организация', 'менеджер', 'оператор'].includes(profile.role)?'/[id]':''}`:'/agentroute/[id]'} as={['суперорганизация', 'организация', 'менеджер', 'admin', 'оператор'].includes(profile.role)?`/agentroutes${['суперорганизация', 'организация', 'менеджер', 'оператор'].includes(profile.role)?`/${profile.organization}`:''}`:'/agentroute/agent'}>
                            <ListItem style={{background: router.pathname.includes('agentroute')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
                                <ListItemIcon><FormatListNumberedIcon color='inherit'/></ListItemIcon>
                                <ListItemText primary={['агент', 'суперагент'].includes(profile.role)?'Маршрут агента':'Маршруты агентов'} />
                            </ListItem>
                        </Link>
                        <Divider/>
                        </>
                        :null
                }
                {
                    ['admin', 'организация', 'суперорганизация', 'суперэкспедитор', 'экспедитор', 'агент'].includes(profile.role)?
                        <>
                        <Link
                            href={'admin'===profile.role?'/routes':'/routes/[id]'}
                            as={'admin'===profile.role?'/routes':`/routes/${profile.organization?profile.organization:'super'}`}
                        >
                            <ListItem style={{background: router.pathname.includes('route')&&!router.pathname.includes('agentroute')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
                                <ListItemIcon><FormatListNumberedIcon color='inherit'/></ListItemIcon>
                                <ListItemText primary='Маршруты экспедитора' />
                            </ListItem>
                        </Link>
                        <Divider/>
                        </>
                        :null
                }
                {
                    'admin'===profile.role?
                        <>
                        <Link href={'/distributers'} as={'/distributers'}>
                            <ListItem style={{background: router.pathname.includes('distributer')&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
                                <ListItemIcon><LocalShipping color='inherit'/></ListItemIcon>
                                <ListItemText primary='Дистрибьюторы' />
                            </ListItem>
                        </Link>
                        <Divider/>
                        </>
                        :null
                }
                {
                    ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'ремонтник'].includes(profile.role)?
                        <>
                            <Link href={profile.organization?`/equipments/${profile.organization}`:'/equipments'}>
                                <ListItem style={{background: router.pathname.includes('equipment')&&!router.pathname.includes('repairequipment')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{showDrawer(false)}}>
                                    <ListItemIcon><AllInboxIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary='Оборудование' />
                                </ListItem>
                            </Link>
                            <Divider/>
                        </>
                        :null
                }
                {
                    ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'ремонтник'].includes(profile.role)?
                        <>
                            <Link href={profile.organization?`/repairequipments/${profile.organization}`:'/repairequipments'}>
                                <ListItem style={{background: router.pathname.includes('repairequipment')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{showDrawer(false)}}>
                                    <ListItemIcon><AllInboxIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary='Ремонт оборудования' />
                                </ListItem>
                            </Link>
                            <Divider/>
                        </>
                        :null
                }
                {
                    ['admin', 'суперорганизация', 'организация', 'менеджер'].includes(profile.role)?
                        <>
                        <Link href={`/autos${'admin'!==profile.role?'/[id]':''}`} as={`/autos${profile.organization?`/${profile.organization}`:'/super'}`}>
                            <ListItem style={{background: router.pathname.includes('/autos')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
                                <ListItemIcon><CommuteIcon color='inherit'/></ListItemIcon>
                                <ListItemText primary='Транспорт' />
                            </ListItem>
                        </Link>
                        <Divider/>
                        </>
                        :null
                }
                {
                    ['admin', 'client', 'суперагент'].includes(profile.role)?
                        <>
                        <Link href='/blog'>
                            <ListItem style={{background: router.pathname==='/blog'?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
                                <ListItemIcon><ArtTrackIcon color='inherit'/></ListItemIcon>
                                <ListItemText primary='Блог' />
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
                            <ListItem style={{background: router.pathname==='/reviews'?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
                                <ListItemIcon><RateReview color='inherit'/></ListItemIcon>
                                <ListItemText primary='Отзывы' />
                            </ListItem>
                        </Link>
                        <Divider/>
                        </>
                        :null
                }
                {
                    isNotTestUser(profile)&&['admin', 'client', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(profile.role)?
                        <>
                        <Link href='/forms'>
                            <ListItem style={{background: router.pathname.includes('form')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
                                <ListItemIcon><BallotIcon color='inherit'/></ListItemIcon>
                                <ListItemText primary='Анкеты/Опросники' />
                            </ListItem>
                        </Link>
                        <Divider/>
                        </>
                        :null
                }
                {
                    ['admin', 'суперагент', 'суперорганизация', 'организация', 'менеджер', 'агент', 'мерчендайзер'].includes(profile.role)?
                        <>
                            <Link href={`/merchandisings${'admin'!==profile.role?'/[id]':''}`} as={`/merchandisings${profile.organization?`/${profile.organization}`:'/super'}`}>
                                <ListItem style={{background: router.pathname.includes('merchandising')&&!router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
                                    <ListItemIcon><AssignmentIndIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary='Мерчендайзинг' />
                                </ListItem>
                            </Link>
                            <Divider/>
                        </>
                        :null
                }
                {
                    ['admin', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(profile.role)?
                        <>
                            <Link href={`/planClients${'admin'!==profile.role?'/[id]':''}`} as={`/planClients${profile.organization?`/${profile.organization}`:''}`}>
                                <ListItem style={{background: router.pathname.includes('planClients')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
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
                            <Link href={`/stocks${'admin'!==profile.role?'/[id]':''}`} as={`/stocks${profile.organization?`/${profile.organization}`:''}`}>
                                <ListItem style={{background: router.pathname.includes('stocks')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
                                    <ListItemIcon><DashboardIcon color='inherit'/></ListItemIcon>
                                    <ListItemText primary='Остатки' />
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
                            <ListItem style={{background: router.pathname==='/faq'?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
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
                            <ListItem style={{background: router.pathname==='/connectionapplications'?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
                                <ListItemIcon><SmsIcon color='inherit'/></ListItemIcon>
                                <ListItemText primary='Заявка на подключение' />
                            </ListItem>
                        </Link>
                        <Divider/>
                        </>
                        :null
                }
                <Link href={'/contact'}>
                    <ListItem style={{background: router.pathname==='/contact'?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
                        <ListItemIcon><InfoIcon color='inherit'/></ListItemIcon>
                        <ListItemText primary='Контакты' />
                    </ListItem>
                </Link>
                <Divider/>
                {
                    ['admin','суперорганизация', 'организация', 'менеджер', 'агент'].includes(profile.role)?
                        <>
                            <Link href={'/statistic'}>
                                <ListItem style={{background: router.pathname.includes('statistic')?'rgba(255, 179, 0, 0.15)':'#ffffff'}} button onClick={()=>{setUncover(false);showDrawer(false)}}>
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
                            <ListItem button onClick={()=>{
                                setMiniDialog('Вход', <Sign isMobileApp={isMobileApp}/>)
                                showMiniDialog(true)
                                setUncover(false);
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
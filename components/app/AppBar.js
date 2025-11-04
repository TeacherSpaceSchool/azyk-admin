import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import MenuIcon from '@material-ui/icons/Menu';
import ExitToApp from '@material-ui/icons/ExitToApp';
import AssignmentInd from '@material-ui/icons/AssignmentInd';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as userActions from '../../redux/actions/user'
import * as appActions from '../../redux/actions/app'
import appbarStyle from '../../src/styleMUI/appbar'
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Paper from '@material-ui/core/Paper';
import Cancel from '@material-ui/icons/Cancel';
import ClientNetworksIcon from '@material-ui/icons/DeviceHub';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import Search from '@material-ui/icons/SearchRounded';
import Sort from '@material-ui/icons/SortRounded';
import ForwarderIcon from '@material-ui/icons/LocalShipping';
import BusinessCenterIcon from '@material-ui/icons/BusinessCenter';
import GroupIcon from '@material-ui/icons/Group';
import PersonIcon from '@material-ui/icons/Person';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ReorderIcon from '@material-ui/icons/Reorder';
import RemoveIcon from '@material-ui/icons/Delete';
import FilterList from '@material-ui/icons/FilterListRounded';
import DateRange from '@material-ui/icons/DateRange';
import PermIdentity from '@material-ui/icons/PermIdentity';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Badge from '@material-ui/core/Badge';
import Sign from '../dialog/Sign'
import Confirmation from '../dialog/Confirmation'
import SetDate from '../dialog/SetDate'
import SetOrganizations from '../dialog/SetOrganizations'
import SetAgent from '../dialog/SetAgent'
import SetCities from '../dialog/SetCities'
import { getOrganizations } from '../../src/gql/organization'
import {getEmployments} from '../../src/gql/employment'
import {isNotTestUser, setCityCookie, setViewModeCookie} from '../../src/lib'
import {pdDDMMYY} from '../../src/lib'
import {getDistricts} from '../../src/gql/district';
import SetDistrict from '../dialog/SetDistrict';
import {viewModes} from '../../src/enum';
import SetClientNetwork from '../dialog/SetClientNetwork';
import {getClientNetworks} from '../../src/gql/clientNetwork';
import SetForwarder from '../dialog/SetForwarder';

const MyAppBar = React.memo((props) => {
    //props
    const initialRender = useRef(true);
    const classes = appbarStyle();
    const {filters, sorts, pageName, dates, searchShow, unread, defaultOpenSearch, organizations, clientNetworkShow, cityShow, agents, showForwarder, showDistrict, cities, clearBasket} = props
    const {drawer, search, filter, sort, isMobileApp, date, organization, agent, district, forwarder, city, clientNetwork, viewMode} = props.app;
    const {showDrawer, setSearch, setFilter, setSort, setDate, setOrganization, setAgent, setDistrict, setForwarder, setCity, setClientNetwork, setViewMode} = props.appActions;
    const {authenticated, profile} = props.user;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {logout} = props.userActions;
    //state
    const handleViewMode = (viewMode) => {
        setViewMode(viewMode);
        setViewModeCookie(viewMode)
    }
    const [anchorElMobileMenu, setAnchorElMobileMenu] = React.useState(null);
    const openMobileMenu = Boolean(anchorElMobileMenu);
    let handleMobileMenu = (event) => {
        setAnchorElMobileMenu(event.currentTarget);
    }
    let handleCloseMobileMenu = () => {
        setAnchorElMobileMenu(null);
    }
    const [anchorElSort, setAnchorElSort] = useState(null);
    const openSort = Boolean(anchorElSort);
    let handleMenuSort = (event) => {
        setAnchorElSort(event.currentTarget);
    }
    let handleCloseSort = () => {
        setAnchorElSort(null);
    }
    const [anchorElProfile, setAnchorElProfile] = useState(null);
    const openProfile = Boolean(anchorElProfile);
    let handleMenuProfile = (event) => {
        setAnchorElProfile(event.currentTarget);
    }
    let handleCloseProfile = () => {
        setAnchorElProfile(null);
    }
    const [anchorElFilter, setAnchorElFilter] = useState(null);
    const openFilter = Boolean(anchorElFilter);
    let handleMenuFilter = (event) => {
        setAnchorElFilter(event.currentTarget);
    }
    let handleCloseFilter = () => {
        setAnchorElFilter(null);
    }
    const [anchorElDate, setAnchorElDate] = useState(null);
    const openDate = Boolean(anchorElDate);
    let handleMenuDate = (event) => {
        setAnchorElDate(event.currentTarget);
    }
    let handleCloseDate = () => {
        setAnchorElDate(null);
    }
    const [anchorElOrganizations, setAnchorElOrganizations] = useState(null);
    const openOrganizations = Boolean(anchorElOrganizations);
    let handleMenuOrganizations = (event) => {
        setAnchorElOrganizations(event.currentTarget);
    }
    let handleCloseOrganizations = () => {
        setAnchorElOrganizations(null);
    }
    const [anchorElAgents, setAnchorElAgents] = useState(null);
    const openAgents = Boolean(anchorElAgents);
    let handleMenuAgents = (event) => {
        setAnchorElAgents(event.currentTarget);
    }
    let handleCloseAgents = () => {
        setAnchorElAgents(null);
    }
    const [anchorElForwarders, setAnchorElForwarders] = useState(null);
    const openForwarders = Boolean(anchorElForwarders);
    let handleMenuForwarders = (event) => {
        setAnchorElForwarders(event.currentTarget);
    }
    let handleCloseForwarders = () => {
        setAnchorElForwarders(null);
    }
    const [anchorElDistricts, setAnchorElDistricts] = useState(null);
    const openDistricts = Boolean(anchorElDistricts);
    let handleMenuDistricts = (event) => {
        setAnchorElDistricts(event.currentTarget);
    }
    let handleCloseDistricts = () => {
        setAnchorElDistricts(null);
    }
    const [anchorElCities, setAnchorElCities] = useState(null);
    const openCities = Boolean(anchorElCities);
    let handleMenuCities = (event) => {
        setAnchorElCities(event.currentTarget);
    }
    let handleCloseCities = () => {
        setAnchorElCities(null);
    }
    //ClientNetwork
    const [anchorElClientNetworks, setAnchorElClientNetworks] = useState(null);
    const openClientNetworks = Boolean(anchorElClientNetworks);
    let handleMenuClientNetworks = (event) => {
        setAnchorElClientNetworks(event.currentTarget);
    }
    let handleCloseClientNetworks = () => {
        setAnchorElClientNetworks(null);
    }
    const [openSearch, setOpenSearch] = useState(searchShow&&search.length||defaultOpenSearch);
    let handleSearch = (event) => {
        setSearch(event.target.value)
    };
    useEffect(() => {
        if(initialRender.current) {
            initialRender.current = false;
        } else {
            if(document.getElementById('search'))
                document.getElementById('search').focus();
        }
    }, [openSearch])
    return (
        <div className={classes.root}>
            <AppBar position='fixed' className='appBar'>
                <Toolbar>
                    <IconButton
                        edge='start'
                        aria-owns='menu-appbar'
                        aria-haspopup='true'
                        onClick={() => {showDrawer(!drawer)}}
                        color='inherit'
                    >
                        <Badge variant='dot' invisible={openSearch||!isMobileApp||!unread.orders&&!unread.returneds} color='secondary'>
                            <MenuIcon/>
                        </Badge>
                    </IconButton>
                    <Typography onClick={() => {showDrawer(!drawer)}} variant='h6' className={classes.title}>
                        {pageName}
                    </Typography>
                    {isMobileApp?
                        openSearch?
                            <Paper className={classes.searchM}>
                                <Input className={classes.searchField}
                                       id='search'
                                       type={'login'}
                                       value={search}
                                       onChange={handleSearch}
                                       endAdornment={
                                           <InputAdornment position='end'>
                                               <IconButton onClick={() => {setSearch('');setOpenSearch(false)}}>
                                                   <Cancel />
                                               </IconButton>
                                           </InputAdornment>
                                       }/>
                            </Paper>
                            :
                            <>
                                {clearBasket?<Tooltip title='Очистка корзины'>
                                    <IconButton
                                        aria-haspopup='true'
                                        onClick={clearBasket}
                                        color='inherit'
                                    >
                                        <RemoveIcon/>
                                    </IconButton>
                                </Tooltip>:null}
                                <Tooltip title={viewMode===viewModes.card?'Карточки':'Таблица'}>
                                    <IconButton
                                        aria-owns={openCities ? 'menu-appbar' : null}
                                        aria-haspopup='true'
                                        onClick={() => handleViewMode(viewMode===viewModes.card?viewModes.table:viewModes.card)}
                                        color='inherit'
                                    >
                                        {viewMode===viewModes.card?<DashboardIcon/>:<ReorderIcon/>}
                                    </IconButton>
                                </Tooltip>
                                {
                                    cityShow||clientNetworkShow||dates||searchShow||filters||sorts?
                                        <IconButton
                                            id='mobile-menu-button'
                                            style={{background: date||organization||agent||showForwarder||showDistrict||city||filter?'rgba(51, 143, 255, 0.29)': 'transparent'}}
                                            aria-owns={openMobileMenu ? 'menu-appbar' : null}
                                            aria-haspopup='true'
                                            onClick={handleMobileMenu}
                                            color='inherit'
                                        >
                                            <Search />
                                        </IconButton>
                                        :
                                        null
                                }
                                <Menu
                                    id='menu-appbar'
                                    anchorEl={anchorElMobileMenu}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    }}
                                    transformOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    }}
                                    open={openMobileMenu}
                                    onClose={handleCloseMobileMenu}
                                >
                                    {
                                        searchShow?
                                            <MenuItem key='search' onClick={() => {
                                                setOpenSearch(true);handleCloseMobileMenu()
                                            }}>
                                                <div style={{display: 'flex', color: '#606060'}}>
                                                    <Search/>&nbsp;Поиск
                                                </div>
                                            </MenuItem>
                                            :
                                            null
                                    }
                                    {filters&&filters.length?
                                        [
                                            <MenuItem id='filter-button' key='filterMenu' onClick={handleMenuFilter} style={{background: filter?'rgba(255, 179, 0, 0.15)': '#fff'}}>
                                                <div style={{display: 'flex', color: '#606060'}}>
                                                    <FilterList/>&nbsp;{filter?(filters.find(elem=>filter===elem.value))?(filters.find(elem=>filter===elem.value)).name:'Фильтр':'Фильтр'}
                                                </div>
                                            </MenuItem>,
                                            <Menu
                                                key='filter'
                                                id='menu-appbar'
                                                anchorEl={anchorElFilter}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                open={openFilter}
                                                onClose={handleCloseFilter}
                                            >
                                                {filters.map((elem, idx) =><MenuItem key={'filter'+idx} style={{background: filter===elem.value?'rgba(255, 179, 0, 0.15)': '#fff'}}  onClick={() => {setFilter(elem.value);handleCloseFilter();handleCloseMobileMenu();}}>{elem.name}</MenuItem>)}
                                            </Menu>
                                        ]
                                        :null
                                    }
                                    {sorts&&sorts.length?
                                        [
                                            <MenuItem key='sortMenu' onClick={handleMenuSort} style={{background: '#fff'}}>
                                                <div style={{display: 'flex', color: '#606060'}}>
                                                    {
                                                        sort?
                                                            <>
                                                                {sort[0]==='-'?<ArrowDownward />:<ArrowUpward/>}&nbsp;
                                                                {
                                                                    (sorts.find(elem=>{
                                                                        return sort===elem.field||`-${elem.field}`===sort?elem.name:null
                                                                    }))?
                                                                        (sorts.find(elem=>{
                                                                            return sort===elem.field||`-${elem.field}`===sort?elem.name:null
                                                                        })).name
                                                                        :
                                                                        'Сортировка'
                                                                }
                                                            </>
                                                            :
                                                            <>
                                                                <Sort/>&nbsp;
                                                                Сортировка
                                                            </>
                                                    }
                                                </div>
                                            </MenuItem>,
                                            <Menu
                                                key='sort'
                                                id='menu-appbar'
                                                anchorEl={anchorElSort}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'left',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'left',
                                                }}
                                                open={openSort}
                                                onClose={handleCloseSort}
                                            >
                                                {sorts.map((elem, idx) =><MenuItem style={{background: sort===elem.field||`-${elem.field}`===sort?'rgba(255, 179, 0, 0.15)': '#fff'}} key={'sort'+idx} onClick={() => {sort===`-${elem.field}`?setSort(elem.field):setSort(`-${elem.field}`);handleCloseSort();handleCloseMobileMenu()}}>{sort===`-${elem.field}`?<ArrowDownward />:sort===elem.field?<ArrowUpward />:<div style={{width: '24px'}}/>}{elem.name}</MenuItem>)}
                                            </Menu>
                                        ]
                                        :null
                                    }
                                    {dates?
                                        [
                                            <MenuItem key='dateMenu' onClick={handleMenuDate} style={{background: date?'rgba(255, 179, 0, 0.15)': '#fff'}}>
                                                <div style={{display: 'flex', color: '#606060'}}>
                                                    <DateRange/>&nbsp;{date?pdDDMMYY(date):'Дата'}
                                                </div>
                                            </MenuItem>,
                                            <Menu
                                                key='date'
                                                id='menu-appbar'
                                                anchorEl={anchorElDate}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                open={openDate}
                                                onClose={handleCloseDate}
                                            >
                                                <MenuItem key='onDate' style={{background: date?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={() => {setMiniDialog('Дата', <SetDate/>);showMiniDialog(true);handleCloseDate();handleCloseMobileMenu();}}>
                                                    По дате
                                                </MenuItem>
                                                <MenuItem key='allDate' style={{background: !date?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={() => {setDate('');handleCloseDate();handleCloseMobileMenu();}}>
                                                    Все
                                                </MenuItem>
                                            </Menu>
                                        ]
                                        :null
                                    }
                                    {organizations&&['суперагент', 'admin', 'client'].includes(profile.role)?
                                        [
                                            <MenuItem key='organizationsMenu' onClick={handleMenuOrganizations} style={{background: organization?'rgba(255, 179, 0, 0.15)': '#fff'}}>
                                                <div style={{display: 'flex', color: '#606060'}}>
                                                    <BusinessCenterIcon/>&nbsp;Организации
                                                </div>
                                            </MenuItem>,
                                            <Menu
                                                key='organizations'
                                                id='menu-appbar'
                                                anchorEl={anchorElOrganizations}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                open={openOrganizations}
                                                onClose={handleCloseOrganizations}
                                            >
                                                <MenuItem key='onOrganizations' style={{background: organization?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={async () => {let organizations = await getOrganizations({search: '', filter: '', city});setMiniDialog('Организации', <SetOrganizations organizations={organizations}/>);showMiniDialog(true);handleCloseOrganizations();handleCloseMobileMenu();}}>
                                                    По организации
                                                </MenuItem>
                                                <MenuItem key='allOrganizations' style={{background: !organization?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={() => {setOrganization(null);handleCloseOrganizations();handleCloseMobileMenu();}}>
                                                    Все
                                                </MenuItem>
                                            </Menu>
                                        ]
                                        :null
                                    }
                                    {organization&&agents&&['суперорганизация', 'организация', 'менеджер', 'admin'].includes(profile.role)?
                                        [
                                            <MenuItem key='agentssMenu' onClick={handleMenuAgents} style={{background: agent?'rgba(255, 179, 0, 0.15)': '#fff'}}>
                                                <div style={{display: 'flex', color: '#606060'}}>
                                                    <PersonIcon/>&nbsp;Агенты
                                                </div>
                                            </MenuItem>,
                                            <Menu
                                                key='agents'
                                                id='menu-appbar'
                                                anchorEl={anchorElAgents}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                open={openAgents}
                                                onClose={handleCloseAgents}
                                            >
                                                <MenuItem key='onAgents' style={{background: agent?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={async () => {let agents = await getEmployments({organization, search: '', filter: 'агент', sort: 'name'});setMiniDialog('Агент', <SetAgent agents={agents}/>);showMiniDialog(true);handleCloseAgents();handleCloseMobileMenu();}}>
                                                    По агенту
                                                </MenuItem>
                                                <MenuItem key='allAgents' style={{background: !agent?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={() => {setAgent(null);handleCloseAgents();handleCloseMobileMenu();}}>
                                                    Все
                                                </MenuItem>
                                            </Menu>
                                        ]
                                        :null
                                    }
                                    {organization&&showDistrict&&['суперорганизация', 'организация', 'менеджер', 'admin'].includes(profile.role)?
                                        [
                                            <MenuItem key='districtMenu' onClick={handleMenuDistricts} style={{background: district?'rgba(255, 179, 0, 0.15)': '#fff'}}>
                                                <div style={{display: 'flex', color: '#606060'}}>
                                                    <GroupIcon/>&nbsp;Районы
                                                </div>
                                            </MenuItem>,
                                            <Menu
                                                key='districts'
                                                id='menu-appbar'
                                                anchorEl={anchorElDistricts}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                open={openDistricts}
                                                onClose={handleCloseDistricts}
                                            >
                                                <MenuItem key='onDistrict' style={{background: district?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={async () => {let districts = await getDistricts({organization, search: '', sort: '-createdAt'});setMiniDialog('Район', <SetDistrict setDistrict={setDistrict} districts={districts}/>);showMiniDialog(true);handleCloseDistricts();handleCloseMobileMenu();}}>
                                                    По району
                                                </MenuItem>
                                                <MenuItem key='allDistricts' style={{background: !district?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={() => {setDistrict(null);handleCloseDistricts();handleCloseMobileMenu();}}>
                                                    Все
                                                </MenuItem>
                                            </Menu>
                                        ]
                                        :null
                                    }
                                    {organization&&showForwarder&&['суперорганизация', 'организация', 'менеджер', 'admin'].includes(profile.role)?
                                        [
                                            <MenuItem key='forwarderMenu' onClick={handleMenuForwarders} style={{background: forwarder?'rgba(255, 179, 0, 0.15)': '#fff'}}>
                                                <div style={{display: 'flex', color: '#606060'}}>
                                                    <ForwarderIcon/>&nbsp;Экспедиторы
                                                </div>
                                            </MenuItem>,
                                            <Menu
                                                key='forwarders'
                                                id='menu-appbar'
                                                anchorEl={anchorElForwarders}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                open={openForwarders}
                                                onClose={handleCloseForwarders}
                                            >
                                                <MenuItem key='onForwarder' style={{background: forwarder?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={async () => {let forwarders = await getEmployments({organization, search: '', filter: 'экспедитор', sort: 'name'});setMiniDialog('Экспедитор', <SetForwarder setForwarder={setForwarder} forwarders={forwarders}/>);showMiniDialog(true);handleCloseForwarders();handleCloseMobileMenu();}}>
                                                    По экспедитору
                                                </MenuItem>
                                                <MenuItem key='allForwarders' style={{background: !forwarder?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={() => {setForwarder(null);handleCloseForwarders();handleCloseMobileMenu();}}>
                                                    Все
                                                </MenuItem>
                                            </Menu>
                                        ]
                                        :null
                                    }
                                    {cityShow&&['admin'].includes(profile.role)?
                                        [
                                            <MenuItem key='cityMenu' onClick={handleMenuCities} style={{background: city?'rgba(255, 179, 0, 0.15)': '#fff'}}>
                                                <div style={{display: 'flex', color: '#606060'}}>
                                                    <LocationCityIcon/>&nbsp;{city?city:'Город'}
                                                </div>
                                            </MenuItem>,
                                            <Menu
                                                key='city'
                                                id='menu-appbar'
                                                anchorEl={anchorElCities}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                open={openCities}
                                                onClose={handleCloseCities}
                                            >
                                                <MenuItem key='onCity' style={{background: city?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={async () => {setMiniDialog('Город', <SetCities cities={cities}/>);showMiniDialog(true);handleCloseCities();handleCloseMobileMenu();}}>
                                                    По городу
                                                </MenuItem>
                                                <MenuItem key='allCity' style={{background: !city?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={() => {setCity(null);setCityCookie('');handleCloseCities();handleCloseMobileMenu();}}>
                                                    Все
                                                </MenuItem>
                                            </Menu>
                                        ]
                                        :null
                                    }
                                    {clientNetworkShow&&profile.role?
                                        [
                                            <MenuItem key='networkMenu' onClick={handleMenuClientNetworks} style={{background: clientNetwork?'rgba(255, 179, 0, 0.15)': '#fff'}}>
                                                <div style={{display: 'flex', color: '#606060'}}>
                                                    <ClientNetworksIcon/>&nbsp;Сети клиентов
                                                </div>
                                            </MenuItem>,
                                            <Menu
                                                key='clientNetwork'
                                                id='menu-appbar'
                                                anchorEl={anchorElClientNetworks}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                open={openClientNetworks}
                                                onClose={handleCloseClientNetworks}
                                            >
                                                <MenuItem key='onClientNetwork' style={{background: clientNetwork?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={async () => {let clientNetworks = await getClientNetworks({search: ''});setMiniDialog('Сети клиентов', <SetClientNetwork clientNetworks={clientNetworks}/>);showMiniDialog(true);handleCloseClientNetworks();handleCloseMobileMenu();}}>
                                                    По сети клиентов
                                                </MenuItem>
                                                <MenuItem key='allClientNetworks' style={{background: !clientNetwork?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={() => {setClientNetwork(null);handleCloseClientNetworks();handleCloseMobileMenu();}}>
                                                    Все
                                                </MenuItem>
                                            </Menu>
                                        ]
                                        :null
                                    }
                                </Menu>
                                <Tooltip title='Профиль'>
                                    <IconButton
                                        aria-owns='menu-appbar'
                                        aria-haspopup='true'
                                        color='inherit'
                                        onClick={handleMenuProfile}
                                    >
                                        <PermIdentity/>
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    id='menu-appbar'
                                    anchorEl={anchorElProfile}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={openProfile}
                                    onClose={handleCloseProfile}
                                >
                                    {
                                        isNotTestUser(profile)&&profile.role==='client'?
                                            <MenuItem key='profile'>
                                                <Link href={`/${profile.role==='client'?'client':'employment'}/[id]`} as={`/${profile.role==='client'?'client':'employment'}/${profile._id}`}>
                                                    <a style={{display: 'flex', color: '#606060'}}>
                                                        <AssignmentInd/>&nbsp;Профиль
                                                    </a>
                                                </Link>
                                            </MenuItem>
                                            :
                                            null
                                    }
                                    {
                                        authenticated?
                                            <MenuItem key='outProfile' onClick={() => {
                                                handleCloseProfile()
                                                const action = async () => logout(true)
                                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                showMiniDialog(true)
                                            }}>
                                                <div style={{display: 'flex', color: '#606060'}}>
                                                    <ExitToApp/>&nbsp;Выйти
                                                </div>
                                            </MenuItem>
                                            :
                                            <MenuItem key='enterProfile' onClick={() => {
                                                handleCloseProfile()
                                                setMiniDialog('Вход', <Sign isMobileApp={isMobileApp}/>)
                                                showMiniDialog(true)
                                            }}>
                                                <div style={{display: 'flex', color: '#606060'}}>
                                                    <ExitToApp/>&nbsp;Войти
                                                </div>
                                            </MenuItem>
                                    }
                                </Menu>

                            </>
                        :
                        openSearch?
                            <Paper className={classes.searchD}>
                                <Input className={classes.searchField}
                                       id='search'
                                       type={'login'}
                                       value={search}
                                       onChange={handleSearch}
                                       endAdornment={
                                           <InputAdornment position='end'>
                                               <IconButton onClick={() => {setSearch('');setOpenSearch(false)}}>
                                                   <Cancel />
                                               </IconButton>
                                           </InputAdornment>
                                       }/>
                            </Paper>
                            :
                            <>
                                {clearBasket?<Tooltip title='Очистка корзины'>
                                    <IconButton
                                        aria-haspopup='true'
                                        onClick={clearBasket}
                                        color='inherit'
                                    >
                                        <RemoveIcon/>
                                    </IconButton>
                                </Tooltip>:null}
                                <Tooltip title={viewMode===viewModes.card?'Карточки':'Таблица'}>
                                    <IconButton
                                        aria-haspopup='true'
                                        onClick={() => handleViewMode(viewMode===viewModes.card?viewModes.table:viewModes.card)}
                                        color='inherit'
                                    >
                                        {viewMode===viewModes.card?<DashboardIcon/>:<ReorderIcon/>}
                                    </IconButton>
                                </Tooltip>
                                {cityShow&&['admin'].includes(profile.role)?
                                    <>
                                        <Tooltip title='Город'>
                                            <IconButton
                                                style={{background: city?'rgba(51, 143, 255, 0.29)': 'transparent'}}
                                                aria-owns={openCities ? 'menu-appbar' : null}
                                                aria-haspopup='true'
                                                onClick={handleMenuCities}
                                                color='inherit'
                                            >
                                                <LocationCityIcon/>
                                            </IconButton>
                                        </Tooltip>
                                        <Menu
                                            key='Cities'
                                            id='menu-appbar'
                                            anchorEl={anchorElCities}
                                            anchorOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            open={openCities}
                                            onClose={handleCloseCities}
                                        >
                                            <MenuItem style={{background: city?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={async () => {setMiniDialog('Город', <SetCities cities={cities}/>);showMiniDialog(true);handleCloseCities();}}>
                                                По городу
                                            </MenuItem>
                                            <MenuItem style={{background: !city?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={() => {setCity(null);setCityCookie('');handleCloseCities();}}>
                                                Все
                                            </MenuItem>
                                        </Menu>
                                        &nbsp;
                                    </>
                                    :null
                                }
                                {clientNetworkShow&&profile.role?
                                    <>
                                        <Tooltip title='Сети клиентов'>
                                            <IconButton
                                                style={{background: clientNetwork?'rgba(51, 143, 255, 0.29)': 'transparent'}}
                                                aria-owns={openClientNetworks ? 'menu-appbar' : null}
                                                aria-haspopup='true'
                                                onClick={handleMenuClientNetworks}
                                                color='inherit'
                                            >
                                                <ClientNetworksIcon/>
                                            </IconButton>
                                        </Tooltip>
                                        <Menu
                                            key='clientNetworkShow'
                                            id='menu-appbar'
                                            anchorEl={anchorElClientNetworks}
                                            anchorOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            open={openClientNetworks}
                                            onClose={handleCloseClientNetworks}
                                        >
                                            <MenuItem style={{background: clientNetwork?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={async () => {let clientNetworks = await getClientNetworks({search: ''});setMiniDialog('Сети клиентов', <SetClientNetwork clientNetworks={clientNetworks}/>);showMiniDialog(true);handleCloseClientNetworks();}}>
                                                По сети клиентов
                                            </MenuItem>
                                            <MenuItem style={{background: !clientNetwork?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={() => {setClientNetwork(null);handleCloseClientNetworks();}}>
                                                Все
                                            </MenuItem>
                                        </Menu>
                                        &nbsp;
                                    </>
                                    :null
                                }
                                {organizations&&['суперагент', 'admin', 'client'].includes(profile.role)?
                                    <>
                                        <Tooltip title='Организации'>
                                            <IconButton
                                                style={{background: organization?'rgba(51, 143, 255, 0.29)': 'transparent'}}
                                                aria-owns={openOrganizations ? 'menu-appbar' : null}
                                                aria-haspopup='true'
                                                onClick={handleMenuOrganizations}
                                                color='inherit'
                                            >
                                                <BusinessCenterIcon/>
                                            </IconButton>
                                        </Tooltip>
                                        <Menu
                                            key='Organizations'
                                            id='menu-appbar'
                                            anchorEl={anchorElOrganizations}
                                            anchorOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            open={openOrganizations}
                                            onClose={handleCloseOrganizations}
                                        >
                                            <MenuItem style={{background: organization?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={async () => {let organizations = await getOrganizations({search: '', filter: '', city});setMiniDialog('Организация', <SetOrganizations organizations={organizations}/>);showMiniDialog(true);handleCloseOrganizations();}}>
                                                По организации
                                            </MenuItem>
                                            <MenuItem style={{background: !organization?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={() => {setOrganization(null);handleCloseOrganizations();}}>
                                                Все
                                            </MenuItem>
                                        </Menu>
                                        &nbsp;
                                    </>
                                    :null
                                }
                                {organization&&agents&&['суперорганизация', 'организация', 'менеджер', 'admin'].includes(profile.role)?
                                    <>
                                        <Tooltip title='Агенты'>
                                            <IconButton
                                                style={{background: agent?'rgba(51, 143, 255, 0.29)': 'transparent'}}
                                                aria-owns={openAgents ? 'menu-appbar' : null}
                                                aria-haspopup='true'
                                                onClick={handleMenuAgents}
                                                color='inherit'
                                            >
                                                <PersonIcon/>
                                            </IconButton>
                                        </Tooltip>
                                        <Menu
                                            key='Agents'
                                            id='menu-appbar'
                                            anchorEl={anchorElAgents}
                                            anchorOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            open={openAgents}
                                            onClose={handleCloseAgents}
                                        >
                                            <MenuItem style={{background: agent?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={async () => {let agents = await getEmployments({organization, search: '', filter: 'агент', sort: 'name'});setMiniDialog('Агент', <SetAgent agents={agents}/>);showMiniDialog(true);handleCloseAgents();}}>
                                                По агенту
                                            </MenuItem>
                                            <MenuItem style={{background: !agent?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={() => {setAgent(null);handleCloseAgents();}}>
                                                Все
                                            </MenuItem>
                                        </Menu>
                                        &nbsp;
                                    </>
                                    :null
                                }
                                {organization&&showForwarder&&['суперорганизация', 'организация', 'менеджер', 'admin'].includes(profile.role)?
                                    <>
                                        <Tooltip title='Экспедиторы'>
                                            <IconButton
                                                style={{background: forwarder?'rgba(51, 143, 255, 0.29)': 'transparent'}}
                                                aria-owns={openForwarders ? 'menu-appbar' : null}
                                                aria-haspopup='true'
                                                onClick={handleMenuForwarders}
                                                color='inherit'
                                            >
                                                <ForwarderIcon/>
                                            </IconButton>
                                        </Tooltip>
                                        <Menu
                                            key='Forwarders'
                                            id='menu-appbar'
                                            anchorEl={anchorElForwarders}
                                            anchorOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            open={openForwarders}
                                            onClose={handleCloseForwarders}
                                        >
                                            <MenuItem style={{background: forwarder?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={async () => {let forwarders = await getEmployments({organization, search: '', filter: 'экспедитор', sort: 'name'});setMiniDialog('Экспедитор', <SetForwarder setForwarder={setForwarder} forwarders={forwarders}/>);showMiniDialog(true);handleCloseForwarders();}}>
                                                По экспедитору
                                            </MenuItem>
                                            <MenuItem style={{background: !forwarder?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={() => {setForwarder(null);handleCloseForwarders();}}>
                                                Все
                                            </MenuItem>
                                        </Menu>
                                        &nbsp;
                                    </>
                                    :null
                                }
                                {organization&&showDistrict&&['суперорганизация', 'организация', 'менеджер', 'admin'].includes(profile.role)?
                                    <>
                                        <Tooltip title='Районы'>
                                            <IconButton
                                                style={{background: district?'rgba(51, 143, 255, 0.29)': 'transparent'}}
                                                aria-owns={openDistricts ? 'menu-appbar' : null}
                                                aria-haspopup='true'
                                                onClick={handleMenuDistricts}
                                                color='inherit'
                                            >
                                                <GroupIcon/>
                                            </IconButton>
                                        </Tooltip>
                                        <Menu
                                            key='Districts'
                                            id='menu-appbar'
                                            anchorEl={anchorElDistricts}
                                            anchorOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            open={openDistricts}
                                            onClose={handleCloseDistricts}
                                        >
                                            <MenuItem style={{background: district?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={async () => {let districts = await getDistricts({organization, search: '', sort: '-createdAt'});setMiniDialog('Район', <SetDistrict setDistrict={setDistrict} districts={districts}/>);showMiniDialog(true);handleCloseDistricts();}}>
                                                По району
                                            </MenuItem>
                                            <MenuItem style={{background: !district?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={() => {setDistrict(null);handleCloseDistricts();}}>
                                                Все
                                            </MenuItem>
                                        </Menu>
                                        &nbsp;
                                    </>
                                    :null
                                }
                                {dates?
                                    <>
                                        <Tooltip title='Дата'>
                                            <IconButton
                                                style={{background: date?'rgba(51, 143, 255, 0.29)': 'transparent'}}
                                                aria-owns={openDate ? 'menu-appbar' : null}
                                                aria-haspopup='true'
                                                onClick={handleMenuDate}
                                                color='inherit'
                                            >
                                                <DateRange/>
                                            </IconButton>
                                        </Tooltip>
                                        <Menu
                                            key='Date'
                                            id='menu-appbar'
                                            anchorEl={anchorElDate}
                                            anchorOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            open={openDate}
                                            onClose={handleCloseDate}
                                        >
                                            <MenuItem style={{background: date!==''?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={() => {setMiniDialog('Дата', <SetDate/>);showMiniDialog(true);handleCloseDate();}}>
                                                По дате
                                            </MenuItem>
                                            <MenuItem style={{background: date===''?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={() => {setDate('');handleCloseDate();}}>
                                                Все
                                            </MenuItem>
                                        </Menu>
                                        &nbsp;
                                    </>
                                    :null
                                }
                                {filters&&filters.length?
                                    <>
                                        <Tooltip title='Фильтр'>
                                            <IconButton
                                                id='filter-button'
                                                style={{background: filter?'rgba(51, 143, 255, 0.29)': 'transparent'}}
                                                aria-owns={openFilter ? 'menu-appbar' : null}
                                                aria-haspopup='true'
                                                onClick={handleMenuFilter}
                                                color='inherit'
                                            >
                                                <FilterList/>
                                            </IconButton>
                                        </Tooltip>
                                        <Menu
                                            id='menu-appbar'
                                            key='filter'
                                            anchorEl={anchorElFilter}
                                            anchorOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            open={openFilter}
                                            onClose={handleCloseFilter}
                                        >
                                            {filters.map((elem, idx) =><MenuItem key={'filter'+idx} style={{background: filter===elem.value?'rgba(255, 179, 0, 0.15)': '#fff'}} onClick={() => {setFilter(elem.value);handleCloseFilter();}}>{elem.name}</MenuItem>)}
                                        </Menu>
                                        &nbsp;
                                    </>
                                    :null
                                }
                                {sorts&&sorts.length?
                                    <>
                                        <Tooltip title='Сортировка'>
                                            <IconButton
                                                aria-owns={openSort ? 'menu-appbar' : null}
                                                aria-haspopup='true'
                                                onClick={handleMenuSort}
                                                color='inherit'
                                            >
                                                <Sort />
                                            </IconButton>
                                        </Tooltip>
                                        <Menu
                                            id='menu-appbar'
                                            anchorEl={anchorElSort}
                                            anchorOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            open={openSort}
                                            onClose={handleCloseSort}
                                            key='sort'
                                        >
                                            {sorts.map((elem, idx) =><MenuItem key={'sort'+idx} onClick={() => {sort===`-${elem.field}`?setSort(elem.field):setSort(`-${elem.field}`);handleCloseSort();}}>{sort===`-${elem.field}`?<ArrowDownward />:sort===elem.field?<ArrowUpward />:<div style={{width: '24px'}}/>}{elem.name}</MenuItem>)}
                                        </Menu>
                                        &nbsp;
                                    </>
                                    :null
                                }
                                {
                                    searchShow?
                                        <Tooltip title='Поиск'>
                                            <IconButton
                                                aria-owns={openSearch ? 'menu-appbar' : null}
                                                aria-haspopup='true'
                                                onClick={() => {
                                                    setOpenSearch(true)}}
                                                color='inherit'
                                            >
                                                <Search />
                                            </IconButton>
                                        </Tooltip>
                                        :
                                        null
                                }
                                <Tooltip title='Профиль'>
                                    <IconButton
                                        aria-owns='menu-appbar'
                                        aria-haspopup='true'
                                        color='inherit'
                                        onClick={handleMenuProfile}
                                    >
                                        <PermIdentity/>
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    id='menu-appbar'
                                    anchorEl={anchorElProfile}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={openProfile}
                                    onClose={handleCloseProfile}
                                >
                                    {
                                        isNotTestUser(profile)&&profile.role==='client'?
                                            <MenuItem>
                                                <Link href={`/${profile.role==='client'?'client':'employment'}/[id]`} as={`/${profile.role==='client'?'client':'employment'}/${profile._id}`}>
                                                    <a style={{display: 'flex', color: '#606060'}}>
                                                        <AssignmentInd/>&nbsp;Профиль
                                                    </a>
                                                </Link>
                                            </MenuItem>
                                            :
                                            null
                                    }
                                    {
                                        authenticated?
                                            <MenuItem onClick={() => {
                                                handleCloseProfile()
                                                const action = async () => logout(true)
                                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                showMiniDialog(true)
                                            }}>
                                                <div style={{display: 'flex', color: '#606060'}}>
                                                    <ExitToApp/>&nbsp;Выйти
                                                </div>
                                            </MenuItem>
                                            :
                                            <MenuItem onClick={() => {
                                                handleCloseProfile()
                                                setMiniDialog('Вход', <Sign isMobileApp={isMobileApp}/>)
                                                showMiniDialog(true)
                                            }}>
                                                <div style={{display: 'flex', color: '#606060'}}>
                                                    <ExitToApp/>&nbsp;Войти
                                                </div>
                                            </MenuItem>
                                    }
                                </Menu>

                            </>
                    }
                </Toolbar>
            </AppBar>
        </div>
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
        userActions: bindActionCreators(userActions, dispatch),
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyAppBar);

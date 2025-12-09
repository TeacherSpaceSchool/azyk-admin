import React from 'react';
import {
    formatAmount,
    getClientTitle,
    isEmpty,
    isNotEmpty,
    pdDDMM,
    pdDDMMHHMM,
    pdDDMMMM,
    selectedMainColor
} from '../../../src/lib';
import CheckCircle from '@material-ui/icons/CheckCircle';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';
import {bindActionCreators} from 'redux';
import * as mini_dialogActions from '../../../redux/actions/mini_dialog';
import {connect} from 'react-redux';
import * as appActions from '../../../redux/actions/app';
import {getEmployments} from '../../../src/gql/employment';
import SetForwarder from '../../dialog/SetForwarder';
import SetDate from '../../dialog/SetDate';
import {getOrder} from '../../../src/gql/order';
import Order from '../../dialog/Order';
import CloseIcon from '@material-ui/icons/Close';
import ChangeLogistic from '../../dialog/ChangeLogistic';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import ChangeDateDelivery from '../../dialog/ChangeDateDelivery';

const Tables =  React.memo(({list, typeDate, setTypeDate, forwarderByClient, forwarderData, middleList, setList, user, selectedOrders, setSelectedOrders, pagination, app, appActions, mini_dialogActions}) =>{
    const {organization, date, filter, isMobileApp} = app;
    const {profile} = user;
    const isEdit = profile.role!=='экспедитор'
    const {setForwarder, setFilter} = appActions;
    const {setMiniDialog, showMiniDialog} = mini_dialogActions;
    const columns = [
        {title: '', style: {width: 28.59}},
        {title: 'Адрес', style: {width: 300}},
        {title: 'Рейс', style: {width: 30}},
        {title: 'Сумма', style: {width: 60}},
        {title: 'Способ оп-ты', style: {width: 90}},
        {title: 'Тоннаж', style: {width: 60}},
        {title: typeDate==='Доставка'?'Создан':'Доставка', style: {width: 75}},
        ...!forwarderData?[{title: 'Экспедитор', style: {width: 250}}]:[],
    ]
    const openOrder = async (idx) => {
        let _element = await getOrder(list[idx]._id)
        if(_element) {
            setMiniDialog('Заказ', <Order element={_element} setList={setList} idx={idx}/>);
            showMiniDialog(true)
        }
    }
    const changePaymentMethod = (invoice) => {
        setMiniDialog('Логистика', <ChangeLogistic
            dateDelivery={date} type={'paymentMethod'} invoices={[invoice._id]} setList={setList}/>)
        showMiniDialog(true)
    }
    //menu
    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleClick = (event) => {
        if(setTypeDate) setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    return <div style={{width: 'fit-content', background: 'white'}}>
            <div
                style={{display: 'flex', alignItems: 'center', zIndex: 1000, padding: 5, height: 31, position: 'sticky', background: 'white', top: 0, fontWeight: 600, borderRight: '1px solid #00000040', borderBottom: '1px solid #00000040'}}>
                {!middleList?<>
                    {profile.role!=='экспедитор'?<><span style={{cursor: 'pointer'}} onClick={async () => {
                        const forwarders = await getEmployments({organization, search: '', filter: 'экспедитор', sort: 'name'});
                        setMiniDialog('Экспедитор', <SetForwarder setForwarder={setForwarder} forwarders={forwarders}/>);
                        showMiniDialog(true);
                    }}>
                        <span style={{color: '#707070'}}>Экспедитор:</span>&nbsp;
                        <span style={!forwarderData?{color: '#ffb300'}:{display: 'inline-block', maxWidth: 210, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', verticalAlign: 'bottom'}}>
                            {forwarderData?forwarderData.name:'указать'}
                        </span>
                    </span>
                    {!isMobileApp&&forwarderData?<CloseIcon style={{fontSize: 20, color: 'red', cursor: 'pointer'}} onClick={() => setForwarder(null)}/>:null}
                    &nbsp;&nbsp;&nbsp;</>:null}
                    <span style={{cursor: 'pointer'}}>
                        <span style={{color: '#707070'}} onClick={handleClick}>{typeDate}:</span>&nbsp;
                        <Menu
                            id='simple-menu'
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem style={typeDate==='Доставка'?{background: selectedMainColor}:{}} onClick={() => {setTypeDate('Доставка');handleClose();}}>Доставка</MenuItem>
                            <MenuItem style={typeDate==='Создан'?{background: selectedMainColor}:{}} onClick={() => {setTypeDate('Создан');handleClose();}}>Создан</MenuItem>
                        </Menu>
                        <span style={!date?{color: 'red'}:{}} onClick={async () => {
                            setMiniDialog('Доставка', <SetDate/>);
                            showMiniDialog(true);
                        }}>{date?pdDDMMMM(date):'указать'}</span>
                    </span>&nbsp;&nbsp;&nbsp;&nbsp;
                    <span style={{cursor: 'pointer'}} onClick={async () => {
                        if(document.getElementById('filter-button')) {
                            if (isMobileApp)
                                await document.getElementById('mobile-menu-button').click();
                            document.getElementById('filter-button').click();
                        }
                    }}>
                        <span style={{color: '#707070'}}>Рейс:</span>&nbsp;
                        <span style={!filter?{color: '#ffb300'}:{}}>{filter?filter:'указать'}</span>
                    </span>
                    {!isMobileApp&&filter?<CloseIcon style={{fontSize: 20, color: 'red', cursor: 'pointer'}} onClick={() => setFilter(null)}/>:null}
                </>:null}
            </div>
            <div className='tableHead' style={{top: 31}}>
                {columns.map((column, idx) => {
                    return column&&(idx||isEdit)?<React.Fragment key={`column${idx}`}>
                        <div className='tableCell' style={{...column.style, whiteSpace: 'nowrap', ...!idx?{margin: 0, padding: 5}:{}}}>
                            {column.title}
                        </div>
                        <div className='tableBorder'/>
                    </React.Fragment>:null
                })}
            </div>
        {list?list.map((row, idx) => {
            let index=null;
            for(let i=0; i<selectedOrders.length; i++) {
                if(selectedOrders[i]._id===row._id)
                    index = i
            }
            if(idx<pagination) {
                if (middleList)
                    idx += middleList
                const forwarder = row.forwarder||(forwarderByClient[row.client._id]||{name: 'Не указан'})
                return <div className='tableRow' key={`row${idx}`} style={{cursor: 'pointer', borderRight: '1px solid #00000040'}}>
                    {isEdit?<><div className='tableCell' style={{display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 0, padding: 5, ...columns[0].style}} onClick={() => {
                        setSelectedOrders(selectedOrders => {
                            if (isEmpty(index)) {
                                selectedOrders.push(row)
                            } else {
                                selectedOrders.splice(index, 1)
                            }
                            return [...selectedOrders]
                        })
                    }}>
                        {
                            isNotEmpty(index) ?
                                <CheckCircle style={{color: '#ffb300', fontSize: 18.59}}/>
                                :
                                <CheckCircleOutline style={{color: '#00000040', fontSize: 18.59}}/>
                        }
                    </div>
                    <div className='tableBorder'/></>:null}
                    <div className='tableCell' style={columns[1].style} onClick={() => openOrder(idx)}>
                        {getClientTitle({address: [row.address]})}
                    </div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[2].style} onClick={() => openOrder(idx)}>
                        {row.track}
                    </div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[3].style} onClick={() => openOrder(idx)}>
                        {formatAmount(row.allPrice - row.rejectedPrice)}
                    </div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[4].style} onClick={() => isEdit?changePaymentMethod(row):openOrder(idx)}>
                        {row.paymentMethod}
                    </div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[5].style} onClick={() => openOrder(idx)}>
                        {formatAmount(row.allTonnage)}
                    </div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[6].style} onClick={() => {
                        if(typeDate==='Доставка')
                            openOrder(idx)
                        else {
                            setMiniDialog('Дата доставки', <ChangeDateDelivery
                                dateDelivery={row.dateDelivery} invoices={[row._id]} setList={setList}/>)
                            showMiniDialog(true)
                        }
                    }}>
                        {typeDate==='Доставка'?pdDDMMHHMM(row.createdAt):pdDDMM(row.dateDelivery)}
                    </div>
                    {!forwarderData?<>
                        <div className='tableBorder'/>
                        <div className='tableCell' style={columns[7].style} onClick={() => setForwarder(forwarder._id)}>
                            {forwarder.name}
                        </div>
                    </>:null}
                </div>
            }
        }):[]}
    </div>;
})

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tables)



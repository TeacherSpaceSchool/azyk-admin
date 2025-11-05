import React from 'react';
import {formatAmount, getClientTitle, isEmpty, isNotEmpty, pdDDMMHHMM, pdDDMMMM} from '../../../src/lib';
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

const Tables =  React.memo(({list, forwarderByClient, forwarderData, middleList, selectedOrders, setSelectedOrders, pagination, app, appActions, mini_dialogActions}) =>{
    const {organization, date, filter, isMobileApp} = app;
    const {setForwarder, setFilter} = appActions;
    const {setMiniDialog, showMiniDialog} = mini_dialogActions;
    const columns = [
        {title: '', style: {width: 28.59}},
        {title: 'Адрес', style: {width: 300}},
        {title: 'Рейс', style: {width: 30}},
        {title: 'Сумма', style: {width: 60}},
        {title: 'Вес', style: {width: 40}},
        {title: 'Создан', style: {width: 75}},
        ...!forwarderData?[{title: 'Экспедитор', style: {width: 250}}]:[],
    ]
    const openOrder = async (row) => {
        let _element = await getOrder(row._id)
        if(_element) {
            setMiniDialog('Заказ', <Order element={_element}/>);
            showMiniDialog(true)
        }
    }
    return <div style={{width: 'fit-content', background: 'white'}}>
            <div
                style={{display: 'flex', alignItems: 'center', zIndex: 1000, padding: 5, height: 31, position: 'sticky', background: 'white', top: 0, fontWeight: 600, borderRight: '1px solid #00000040', borderBottom: '1px solid #00000040'}}>
                {!middleList?<>
                    <span style={{cursor: 'pointer'}} onClick={async () => {
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
                    &nbsp;&nbsp;&nbsp;
                    <span style={{cursor: 'pointer'}} onClick={async () => {
                        setMiniDialog('Доставка', <SetDate/>);
                        showMiniDialog(true);
                    }}>
                        <span style={{color: '#707070'}}>Доставка:</span>&nbsp;
                        <span style={!date?{color: 'red'}:{}}>{date?pdDDMMMM(date):'указать'}</span>
                    </span>&nbsp;&nbsp;&nbsp;&nbsp;
                    <span style={{cursor: 'pointer'}} onClick={async () => {
                        if(isMobileApp)
                            await document.getElementById('mobile-menu-button').click();
                        document.getElementById('filter-button').click();
                    }}>
                        <span style={{color: '#707070'}}>Рейс:</span>&nbsp;
                        <span style={!filter?{color: '#ffb300'}:{}}>{filter?filter:'указать'}</span>
                    </span>
                    {!isMobileApp&&filter?<CloseIcon style={{fontSize: 20, color: 'red', cursor: 'pointer'}} onClick={() => setFilter(null)}/>:null}
                </>:null}
            </div>
            <div className='tableHead' style={{top: 31}}>
                {columns.map((column, idx) => {
                    return column?<React.Fragment key={`column${idx}`}>
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
                    <div className='tableCell' style={{display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 0, padding: 5, ...columns[0].style}} onClick={() => {
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
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[1].style} onClick={() => openOrder(row)}>
                        {getClientTitle({address: [row.address]})}
                    </div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[2].style} onClick={() => openOrder(row)}>
                        {row.track}
                    </div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[3].style} onClick={() => openOrder(row)}>
                        {formatAmount(row.allPrice - row.returnedPrice)}
                    </div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[4].style} onClick={() => openOrder(row)}>
                        {formatAmount(row.allTonnage)}
                    </div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[5].style} onClick={() => openOrder(row)}>
                        {pdDDMMHHMM(row.createdAt)}
                    </div>
                    {!forwarderData?<>
                        <div className='tableBorder'/>
                        <div className='tableCell' style={columns[6].style} onClick={() => setForwarder(forwarder._id)}>
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
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tables)



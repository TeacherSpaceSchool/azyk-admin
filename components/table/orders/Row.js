import React from 'react';
import {connect} from 'react-redux';
import SyncOn from '@material-ui/icons/Sync';
import SyncOff from '@material-ui/icons/SyncDisabled';
import {formatAmount, getClientTitle, pdDDMMHHMM, pdDDMM} from '../../../src/lib';
import {getOrder} from '../../../src/gql/order';
import Order from '../../dialog/Order';
import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import {bindActionCreators} from 'redux';

const Tables =  React.memo(({element, idx, columns, setList, user, mini_dialogActions}) =>{
    const {setMiniDialog, showMiniDialog} = mini_dialogActions;
    const {profile} = user;
    const isShowSync = ['admin', 'организация', 'суперорганизация', 'экспедитор', 'суперагент', 'менеджер', 'агент'].includes(profile.role)
    const status = element.taken?'принят':element.cancelForwarder||element.cancelClient?'отмена':element.confirmationForwarder&&element.confirmationClient?'выполнен':'обработка'
    const statusColor = {
        'обработка': 'orange',
        'принят': 'blue',
        'выполнен': 'green',
        'отмена': 'red'
    }
    const onCLick = async () => {
        let _element = await getOrder(element._id)
        if(_element) {
            setMiniDialog('Заказ', <Order idx={idx} element={_element} setList={setList}/>);
            showMiniDialog(true)
        }
    }
    return <div className='tableRow tablePointer' onClick={onCLick}>
        <div className='tableCell' style={columns[0].style}>
            {element.number}
            <div style={{display: 'flex', alignItems: 'flex-end'}}>
                <span style={{color: statusColor[status]}}>{status}</span>
                {isShowSync?[1,2].includes(element.sync)? <SyncOn style={{fontSize: 20, color: element.sync===1?'orange':'green'}}/> : <SyncOff style={{fontSize: 20}} color='secondary'/>:null}
            </div>
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[1].style}>
            {pdDDMMHHMM(element.createdAt)}<br/>
            {pdDDMM(element.dateDelivery)}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[2].style}>
            {element.returnedPrice?`${formatAmount(element.allPrice-element.returnedPrice)}\n${formatAmount(element.allPrice)}`:formatAmount(element.allPrice)}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={{...columns[3].style, ...!element.address[1]?{color: 'red'}:{}}}>
            {getClientTitle({address: [element.address]})}{['admin', 'суперагент'].includes(profile.role)&&element.city?` (${element.city})`:''}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[4].style}>
            {element.organization.name}<br/>
            {element.agent?element.agent.name:'online'}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={{...columns[5].style, color: element.adss&&element.adss.length?'green':'red'}}>
            {element.adss&&element.adss.length?'есть':'нету'}
        </div>
    </div>
})

function mapStateToProps (state) {
    return {
        user: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tables)


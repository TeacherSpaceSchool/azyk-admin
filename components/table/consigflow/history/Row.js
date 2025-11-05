import React from 'react';
import {checkFloat, formatAmount, getClientTitle, pdDDMMYY} from '../../../../src/lib';
import {getHistories} from '../../../../src/gql/history';
import * as mini_dialogActions from '../../../../redux/actions/mini_dialog'
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import History from '../../../dialog/History';
import {getOrder} from '../../../../src/gql/order';
import Order from '../../../dialog/Order';
import AddConsigFlow from '../../../dialog/AddConsigFlow';
import {setConsigFlow} from '../../../../src/gql/consigFlow';
import Confirmation from '../../../dialog/Confirmation';
import Link from 'next/link';

const Tables =  React.memo(({element, columns, mini_dialogActions, user}) =>{
    const {setMiniDialog, showMiniDialog} = mini_dialogActions;
    const {profile} = user;
    return <div className='tableRow'>
        <div className='tableCell' style={columns[0].style}>
            {pdDDMMYY(element.createdAt)}
            {element.cancel?<><br/><span style={{color: 'red'}}>отмена</span></>:null}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[1].style}>
            <Link href={'/client/[id]'} as={`/client/${element.client._id}`}>
                <a>
                    {getClientTitle(element.client)}
                </a>
            </Link>
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[2].style}>
            {formatAmount(element.amount*element.sign)}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[3].style}>
            {element.invoice?<span style={{cursor: 'pointer'}} onClick={async () => {
                let _element = await getOrder(element.invoice._id)
                if(_element) {
                    setMiniDialog('Заказ', <Order element={_element}/>);
                    showMiniDialog(true)
                }
            }}>{element.invoice.number}</span>:null}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={{cursor: 'pointer', color: '#ffb300', ...columns[4].style}}>
            {!element.invoice?<>
                {['суперорганизация', 'менеджер'].includes(profile.role)?<span onClick={async () => {
                    const histories = await getHistories({search: element._id, filter: 'ConsigFlowAzyk'});
                    setMiniDialog('История', <History list={histories}/>);
                    showMiniDialog(true)
                }}>История</span>:null}
                {['суперорганизация', 'организация', 'менеджер', 'агент'].includes(profile.role)&&!element.cancel?<span style={{color: 'red'}} onClick={async () => {
                    const action = async () => await setConsigFlow({_id: element._id, cancel: true})
                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                    showMiniDialog(true)
                }}>Отмена</span>:null}
            </>:null}
            {['суперорганизация', 'организация', 'менеджер', 'агент'].includes(profile.role)&&!element.cancel&&element.sign===1?<span onClick={() => {
                setMiniDialog('Оплатить', <AddConsigFlow initialClient={element.client._id} initialAmount={element.amount}/>)
                showMiniDialog(true)
            }}>Оплатить</span>:null}
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
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tables)


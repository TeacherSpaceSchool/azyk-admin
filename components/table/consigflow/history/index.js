import React from 'react';
import Table from '../../Table';
import Row from './Row';
import {useRouter} from 'next/router';
import {bindActionCreators} from 'redux';
import * as mini_dialogActions from '../../../../redux/actions/mini_dialog';
import * as appActions from '../../../../redux/actions/app';
import {connect} from 'react-redux';
import {getDistricts} from '../../../../src/gql/district';
import SetDistrict from '../../../dialog/SetDistrict';
import CloseIcon from '@material-ui/icons/Close';
import SetDate from '../../../dialog/SetDate';
import {formatAmount, getClientTitle, pdDDMMYY, pdMMMMYYYY} from '../../../../src/lib';
import Link from 'next/link';
import {getOrder} from '../../../../src/gql/order';
import Order from '../../../dialog/Order';
import {getHistories} from '../../../../src/gql/history';
import History from '../../../dialog/History';
import {setConsigFlow} from '../../../../src/gql/consigFlow';
import Confirmation from '../../../dialog/Confirmation';
import AddConsigFlow from '../../../dialog/AddConsigFlow';

const Tables =  React.memo(({list, app, user, districtData, mini_dialogActions, appActions}) =>{
    let {profile} = user;
    let {date, isMobileApp, organization} = app;
    const {setMiniDialog, showMiniDialog} = mini_dialogActions;
    const {setDistrict} = appActions;
    const columns = [
        {title: 'Создан', style: {width: 60}},
        {title: 'Клиент', style: {width: 300}},
        {title: 'Сумма', style: {width: 80}},
        {title: 'Заказ', style: {width: 200}},
        {title: '', style: {width: 60}},
    ]
    return <div style={{width: 'fit-content', background: 'white'}}>
        <div style={{display: 'flex', alignItems: 'center', zIndex: 1000, padding: 5, height: 31, position: 'sticky', background: 'white', top: 0, fontWeight: 600, borderRight: '1px solid #00000040', borderBottom: '1px solid #00000040'}}>
                    <span style={{cursor: 'pointer'}} onClick={async () => {
                        let districts = await getDistricts({organization, search: '', sort: '-createdAt'});
                        setMiniDialog('Район', <SetDistrict setDistrict={setDistrict} districts={districts}/>);
                        showMiniDialog(true);
                    }}>
                        <span style={{color: '#707070'}}>Район:</span>&nbsp;
                        <span style={!districtData?{color: '#ffb300'}:{display: 'inline-block', maxWidth: 210, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', verticalAlign: 'bottom'}}>
                            {districtData?districtData.name:'указать'}
                        </span>
                    </span>
            {!isMobileApp&&districtData?<CloseIcon style={{fontSize: 20, color: 'red', cursor: 'pointer'}} onClick={() => setDistrict(null)}/>:null}
        </div>
        <div className='tableHead' style={{top: 31}}>
            {columns.map((column, idx) => {
                return column?<React.Fragment key={`column${idx}`}>
                    <div className='tableCell' style={{...column.style, whiteSpace: 'nowrap'}}>
                        {column.title}
                    </div>
                    <div className='tableBorder'/>
                </React.Fragment>:null
            })}
        </div>
        {list?list.map((element, idx) => {
            return <div className='tableRow' key={`row${idx}`} style={{borderRight: '1px solid #00000040'}}>
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


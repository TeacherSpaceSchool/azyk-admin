import React from 'react';
import {formatAmount, getClientTitle, pdDDMMHHMM, pdDDMMMM} from '../../../src/lib';
import {bindActionCreators} from 'redux';
import * as mini_dialogActions from '../../../redux/actions/mini_dialog';
import {connect} from 'react-redux';
import * as appActions from '../../../redux/actions/app';
import {getEmployments} from '../../../src/gql/employment';
import SetForwarder from '../../dialog/SetForwarder';
import SetDate from '../../dialog/SetDate';
import CloseIcon from '@material-ui/icons/Close';
import {toTableRow} from '../../../pages/logistic/financereport/[id]';

const Tables =  React.memo(({list, forwarderData, pagination, app, appActions, mini_dialogActions}) =>{
    const {organization, date, filter, isMobileApp} = app;
    const {setForwarder, setFilter} = appActions;
    const {setMiniDialog, showMiniDialog} = mini_dialogActions;
    const columns = [
        {title: 'Адрес', style: {width: 300}},
        {title: 'Отгружено', style: {width: 70}},
        {title: 'К оплате', style: {width: 60}},
        {title: 'Тип оплаты', style: {width: 90}},
        {title: 'Возврат', style: {width: 60}},
        {title: 'Долг', style: {width: 60}},
        {title: 'СФ', style: {width: 25}},
        {title: 'Комментарий', style: {width: 200}},
    ]
    return <div style={{width: 'fit-content', background: 'white'}}>
        <div style={{display: 'flex', alignItems: 'center', zIndex: 1000, padding: 5, height: 31, position: 'sticky', background: 'white', top: 0, fontWeight: 600, borderRight: '1px solid #00000040', borderBottom: '1px solid #00000040'}}>
            <span style={{cursor: 'pointer'}} onClick={async () => {
                const forwarders = await getEmployments({organization, search: '', filter: 'экспедитор', sort: 'name'});
                setMiniDialog('Экспедитор', <SetForwarder setForwarder={setForwarder} forwarders={forwarders}/>);
                showMiniDialog(true);
            }}>
                <span style={{color: '#707070'}}>Экспедитор:</span>&nbsp;
                <span style={!forwarderData?{color: 'red'}:{}}>
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
                </span>
            &nbsp;&nbsp;&nbsp;
            <span style={{cursor: 'pointer'}} onClick={async () => {
                if(isMobileApp)
                    await document.getElementById('mobile-menu-button').click();
                document.getElementById('filter-button').click();
            }}>
                <span style={{color: '#707070'}}>Рейс:</span>&nbsp;
                <span style={!filter?{color: '#ffb300'}:{}}>{filter?filter:'указать'}</span>
            </span>
            {!isMobileApp&&filter?<CloseIcon style={{fontSize: 20, color: 'red', cursor: 'pointer'}} onClick={() => setFilter(null)}/>:null}
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
        {list?list.map((invoice, idx) => {
            if(idx<pagination) {
                const row = toTableRow(invoice)
                return <div className='tableRow' key={`row${idx}`} style={{borderRight: '1px solid #00000040'}}>
                    <div className='tableCell' style={columns[0].style}>{row[0]}</div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[1].style}>{row[1]}</div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[2].style}>{row[2]}</div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[3].style}>{row[3]}</div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[4].style}>{row[4]}</div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[5].style}>{row[5]}</div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[6].style}>{row[6]}</div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[7].style}>{invoice.agent?'Агент:':'Онлайн:'} {pdDDMMHHMM(invoice.createdAt)}<br/>{row[7]}</div>
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



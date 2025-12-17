import React from 'react';
import {formatAmount, pdDDMMMM} from '../../../src/lib';
import {bindActionCreators} from 'redux';
import * as mini_dialogActions from '../../../redux/actions/mini_dialog';
import {connect} from 'react-redux';
import {getEmployments} from '../../../src/gql/employment';
import SetForwarder from '../../dialog/SetForwarder';
import * as appActions from '../../../redux/actions/app';
import SetDate from '../../dialog/SetDate';
import CloseIcon from '@material-ui/icons/Close';

const Tables =  React.memo(({list, forwarderData, pagination, app, user, appActions, mini_dialogActions}) =>{
    const {organization, date, isMobileApp, filter} = app;
    const {profile} = user;
    const {setForwarder, setFilter} = appActions;
    const {setMiniDialog, showMiniDialog} = mini_dialogActions;
    const columns = [
        {title: forwarderData?'Клиент':'Экспедитор', style: {width: forwarderData?300:250}},
        {title: 'Товар', style: {width: 250}},
        {title: 'Кол-во', style: {width: 60}},
        {title: 'Уп-ок', style: {width: 60}},
        {title: 'Сумма', style: {width: 60}},
        {title: 'Тоннаж', style: {width: 60}},
    ]
    return <div style={{width: 'fit-content', background: 'white'}}>
        <div
            style={{display: 'flex', alignItems: 'center', zIndex: 1000, padding: 5, height: 31, position: 'sticky', background: 'white', top: 0, fontWeight: 600, borderRight: '1px solid #00000040', borderBottom: '1px solid #00000040'}}>
            {profile.role!=='экспедитор'?<>
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
            </>:null}
            <span style={{cursor: 'pointer'}} onClick={async () => {
                setMiniDialog('Доставка', <SetDate/>);
                showMiniDialog(true);
            }}>
                <span style={{color: '#707070'}}>Доставка:</span>&nbsp;
                <span style={!date?{color: 'red'}:{}}>{date?pdDDMMMM(date):'указать'}</span>
            </span>
            &nbsp;&nbsp;&nbsp;
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
        {list?list.map((row, idx) => {
            if(idx<pagination) {
                return <div className='tableRow' key={`row${idx}`} style={{borderRight: '1px solid #00000040'}}>
                    <div className='tableCell' style={{...!forwarderData?{cursor: 'pointer'}:{}, ...columns[0].style}} onClick={() => {if(!forwarderData) setForwarder(row[6])}}>
                        {row[0]}
                    </div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[1].style}>{row[1]}</div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[2].style}>{formatAmount(row[2])}</div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[3].style}>{formatAmount(row[3])}</div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[4].style}>{formatAmount(row[4])}</div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[5].style}>{formatAmount(row[5])}</div>
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


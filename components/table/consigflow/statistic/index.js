import React from 'react';
import {connect} from 'react-redux';
import {formatAmount, pdMMMMYYYY} from '../../../../src/lib';
import {useRouter} from 'next/router';
import SetDate from '../../../dialog/SetDate';
import {bindActionCreators} from 'redux';
import * as mini_dialogActions from '../../../../redux/actions/mini_dialog';
import Link from 'next/link';
import CloseIcon from '@material-ui/icons/Close';
import * as appActions from '../../../../redux/actions/app';
import SetDistrict from '../../../dialog/SetDistrict';
import {getDistricts} from '../../../../src/gql/district';

const Tables =  React.memo(({list, pagination, districtData, app, mini_dialogActions, appActions}) =>{
    const router = useRouter();
    let {date, isMobileApp, organization} = app;
    const {setMiniDialog, showMiniDialog} = mini_dialogActions;
    const {setDistrict} = appActions;
    const columns = [
        {title: 'Клиент', style: {width: 300}},
        {title: 'Начало', style: {width: 80}},
        {title: 'Взято', style: {width: 80}},
        {title: 'Закрыто', style: {width: 80}},
        {title: 'Конец', style: {width: 80}},
        {title: '', style: {width: 55}},
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
            &nbsp;&nbsp;&nbsp;
            <span style={{cursor: 'pointer'}} onClick={async () => {
                setMiniDialog('Доставка', <SetDate type={'month'}/>);
                showMiniDialog(true);
            }}>
                        <span style={{color: '#707070'}}>Месяц:</span>&nbsp;
                <span style={!date?{color: 'red'}:{}}>{date?pdMMMMYYYY(date):'указать'}</span>
                    </span>
        </div>
        {date?<><div className='tableHead' style={{top: 31}}>
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
            if(idx<pagination)
                return <div className='tableRow' key={`row${idx}`} style={{borderRight: '1px solid #00000040'}}>
                    <div className='tableCell' style={columns[0].style}>
                        <Link href={'/client/[id]'} as={`/client/${row[0]}`}>
                            <a>
                                {row[1]}
                            </a>
                        </Link>
                    </div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[1].style}>
                        {formatAmount(row[2])}
                    </div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[2].style}>
                        {formatAmount(row[3])}
                    </div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[3].style}>
                        {formatAmount(row[4])}
                    </div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[4].style}>
                        {formatAmount(row[5])}
                    </div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={{cursor: 'pointer', color: '#ffb300', ...columns[5].style}}>
                        <Link href={`/consigflow/history/[id]?client=${row[0]}`} as={`/consigflow/history/${router.query.id}?client=${row[0]}`}>
                            <a>
                                История
                            </a>
                        </Link>
                    </div>
                </div>
        }):[]}</>:null}
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


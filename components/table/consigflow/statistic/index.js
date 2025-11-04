import React, {useMemo} from 'react';
import {connect} from 'react-redux';
import {formatAmount, months} from '../../../../src/lib';
import {useRouter} from 'next/router';
import SetDate from '../../../dialog/SetDate';
import {bindActionCreators} from 'redux';
import * as mini_dialogActions from '../../../../redux/actions/mini_dialog';

const Tables =  React.memo(({list, pagination, app, mini_dialogActions}) =>{
    const router = useRouter();
    let {date} = app;
    const {setMiniDialog, showMiniDialog} = mini_dialogActions;
    const month = useMemo(() => {
        if(date) {
            date = new Date(date)
            return `${months[date.getMonth()]} ${date.getFullYear()}`
        }
        else return 'Указать дату'
    }, [date]);
    const columns = [
        {title: 'Клиент', style: {width: 300}},
        {title: 'Начало', style: {width: 80}},
        {title: 'Взято', style: {width: 80}},
        {title: 'Закрыто', style: {width: 80}},
        {title: 'Конец', style: {width: 80}},
        {title: '', style: {width: 55}},
    ]
    return <div style={{width: 'fit-content', background: 'white'}}>
        <div
            onClick={() => {setMiniDialog('Дата', <SetDate/>);showMiniDialog(true);}}
            style={{zIndex: 1000, padding: 5, height: 31, position: 'sticky', cursor: 'pointer', background: 'white', top: 0, fontWeight: 600, borderRight: '1px solid #00000040', borderBottom: '1px solid #00000040'}}
        >{month}</div>
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
                        <a href={`/client/${row[0]}`} target='_blank'>
                            {row[1]}
                        </a>
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
                        <a href={`/consigflow/history/${router.query.id}?client=${row[0]}`} target='_blank'>
                            История
                        </a>
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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tables)


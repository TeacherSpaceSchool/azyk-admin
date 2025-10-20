import React from 'react';
import {formatAmount, getClientTitle, isEmpty, isNotEmpty} from '../../../src/lib';
import CheckCircle from '@material-ui/icons/CheckCircle';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';

const Tables =  React.memo(({list, forwarderData, middleList, selectedOrders, setSelectedOrders, pagination}) =>{
    const fontSize = 13
    const columns = [
        {title: '', style: {width: 28.59}},
        {title: 'Адрес', style: {width: 300}},
        {title: 'Рейс', style: {width: 35}},
        {title: 'Сумма', style: {width: 60}},
        {title: 'Вес', style: {width: 60}},
    ]
    return <div style={{width: 'fit-content', background: 'white', fontSize}}>
            {forwarderData?<div style={{zIndex: 1000, padding: 5, height: 31, position: 'sticky', background: 'white', top: 0, fontWeight: 600, borderRight: '1px solid #00000040', borderBottom: '1px solid #00000040'}}>{!middleList?<><span style={{color: '#707070'}}>Экспедитор:</span> {forwarderData.name}</>:null}</div>:null}
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
                return <div className='tableRow' key={`row${idx}`} style={{borderRight: '1px solid #00000040'}}>
                    <div className='tableCell' style={{display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 0, padding: 5, cursor: 'pointer', ...columns[0].style}} onClick={() => {
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
                    <div className='tableCell' style={columns[1].style}>
                        {getClientTitle({address: [row.address]})}
                    </div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[2].style}>
                        {row.track}
                    </div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[3].style}>
                        {formatAmount(row.allPrice - row.returnedPrice)}
                    </div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[4].style}>
                        {formatAmount(row.allTonnage)}
                    </div>
                </div>
            }
        }):[]}
    </div>;
})

export default Tables


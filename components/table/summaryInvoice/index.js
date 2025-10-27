import React from 'react';
import {formatAmount} from '../../../src/lib';

const Tables =  React.memo(({list, forwarderData, pagination}) =>{
    const columns = [
        {title: 'Склад', style: {width: 200}},
        {title: 'Товар', style: {width: 300}},
        {title: 'Кол-во', style: {width: 60}},
        {title: 'Уп-ок', style: {width: 60}},
        {title: 'Сумма', style: {width: 60}},
        {title: 'Тоннаж', style: {width: 60}},
    ]
    return <div style={{width: 'fit-content', background: 'white'}}>
            {forwarderData?<div style={{zIndex: 1000, padding: 5, height: 31, position: 'sticky', background: 'white', top: 0, fontWeight: 600, borderRight: '1px solid #00000040', borderBottom: '1px solid #00000040'}}><span style={{color: '#707070'}}>Экспедитор:</span> {forwarderData.name}</div>:null}
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
                    <div className='tableCell' style={columns[0].style}>{row[0]}</div>
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

export default Tables


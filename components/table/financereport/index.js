import React from 'react';
import {formatAmount} from '../../../src/lib';

const Tables =  React.memo(({list, forwarderData, pagination}) =>{
    const fontSize = 13
    const columns = [
        {title: 'Адрес', style: {width: 300}},
        {title: 'Отгружено', style: {width: 70}},
        {title: 'Скидки', style: {width: 60}},
        {title: 'К оплате', style: {width: 60}},
        {title: 'Тип оплаты', style: {width: 90}},
        {title: 'Возврат', style: {width: 60}},
        {title: 'СФ', style: {width: 25}},
        {title: 'Комментарий', style: {width: 200}},
    ]
    return <div style={{width: 'fit-content', background: 'white', fontSize}}>
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
                    <div className='tableCell' style={columns[1].style}>{formatAmount(row[1])}</div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[2].style}>{formatAmount(row[2])}</div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[3].style}>{formatAmount(row[3])}</div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[4].style}>{row[4]}</div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[5].style}>{formatAmount(row[5])}</div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[6].style}>{row[6]}</div>
                    <div className='tableBorder'/>
                    <div className='tableCell' style={columns[7].style}>{row[7]}</div>
                </div>
            }
        }):[]}
    </div>;
})

export default Tables


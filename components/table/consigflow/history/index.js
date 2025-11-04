import React from 'react';
import Table from '../../Table';
import Row from './Row';

const Tables =  React.memo(({list}) =>{
    const columns = [
        {title: 'Создан', style: {width: 60}},
        {title: 'Клиент', style: {width: 300}},
        {title: 'Сумма', style: {width: 80}},
        {title: 'Заказ', style: {width: 200}},
        {title: '', style: {width: 60}},
    ]
    return <Table
        columns = {columns}
        rows = {list?list.map((element, idx) => <Row key={`row${idx}`} element={element} idx={idx} columns={columns}/>):[]}
    />;
})

export default Tables


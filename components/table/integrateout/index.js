import React from 'react';
import Table from '../Table';
import Row from './Row';

const Tables =  React.memo(({list}) =>{
    const columns = [
        {title: 'Создан', style: {width: 100}},
        {title: 'Путь', style: {width: 300}},
    ]
    return <Table
        columns = {columns}
        rows = {list?list.map((element, idx) => <Row key={`row${idx}`} element={element} idx={idx} columns={columns}/>):[]}
    />;
})

export default Tables


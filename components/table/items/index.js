import React from 'react';
import Table from '../Table';
import Row from './Row';

const Tables =  React.memo(({list, pagination}) =>{
    const columns = [
        {title: 'Создан\nСтатус', style: {width: 86}},
        {title: 'Цена', style: {width: 35}},
        {title: 'Имя', style: {width: 300}},
    ]
    return <Table
        columns = {columns}
        rows = {list?list.map((element, idx) => {
            if(idx<pagination)
                return <Row key={`row${idx}`} element={element} idx={idx} columns={columns}/>
        }):[]}
    />;
})

export default Tables


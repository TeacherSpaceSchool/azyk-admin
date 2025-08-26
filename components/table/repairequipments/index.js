import React from 'react';
import Table from '../Table';
import Row from './Row';
import {connect} from 'react-redux';

const Tables =  React.memo(({list, pagination, app}) =>{
    const {isMobileApp} = app;
    const columns = [
        {title: 'Номер\nСтатус', style: {width: 100}},
        {title: 'Создан\nРемонт', style: {width: 60}},
        {title: 'Оборудование\nКлиент', style: {width: isMobileApp?200:300}},
        {title: 'Агент\nРемонтник', style: {width: isMobileApp?200:300}},
    ]
    return <Table
        columns = {columns}
        rows = {list?list.map((element, idx) => {
            if(idx<pagination)
                return <Row key={`row${idx}`} element={element} idx={idx} columns={columns}/>
        }):[]}
    />;
})

function mapStateToProps (state) {
    return {
        app: state.app,
    }
}

export default connect(mapStateToProps)(Tables)


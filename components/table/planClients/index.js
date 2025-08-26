import React from 'react';
import Table from '../Table';
import Row from './Row';
import {connect} from 'react-redux';

const Tables =  React.memo(({list, app}) =>{
    const {isMobileApp} = app;
    const columns = [
        {title: 'Создан', style: {width: 60}},
        {title: 'Месяц план\nПрогресс', style: {width: 100}},
        {title: 'Клиент', style: {width: isMobileApp?200:300}},
        {title: 'Посещение', style: {width: 100}},
    ]
    return <Table
        columns = {columns}
        rows = {list?list.map((element, idx) => <Row key={`row${idx}`} element={element} idx={idx} columns={columns}/>):[]}
    />;
})

function mapStateToProps (state) {
    return {
        app: state.app,
    }
}

export default connect(mapStateToProps)(Tables)


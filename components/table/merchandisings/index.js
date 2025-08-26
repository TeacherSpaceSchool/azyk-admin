import React from 'react';
import {connect} from 'react-redux';
import Table from '../Table';
import Row from './Row';

const Tables =  React.memo(({list, app}) =>{
    const {isMobileApp} = app;
    const columns = [
        {title: 'Проверка\nСтатус', style: {width: 100}},
        {title: 'Тип', style: {width: 80}},
        {title: 'Клиент', style: {width: isMobileApp?200:300}},
    ]
    return <Table
        columns = {columns}
        rows = {list?list.map((element, idx) => <Row key={`row${idx}`} element={element} idx={idx} columns={columns}/>):[]}
    />;
})

function mapStateToProps (state) {
    return {
        app: state.app
    }
}

export default connect(mapStateToProps)(Tables)


import React from 'react';
import Table from '../../Table';
import Row from './Row';
import {connect} from 'react-redux';

const Tables =  React.memo(({list, app}) =>{
    const {isMobileApp} = app;
    const columns = [
        {title: 'Создан\nСтатус', style: {width: 86}},
        {title: 'Телефон', style: {width: 100}},
        {title: 'Магазин\nАдрес', style: {width: isMobileApp?200:300}},
        {title: 'Откуда узнали', style: {width: 200}},
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


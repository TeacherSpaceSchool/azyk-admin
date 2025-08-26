import React from 'react';
import {connect} from 'react-redux';
import Table from '../Table';
import Row from './Row';

const Tables =  React.memo(({list, app}) =>{
    const {isMobileApp} = app;
    const columns = [
        {title: 'Создан\nТип', style: {width: 100}},
        {title: 'Модель\nОбъект\nИмя', style: {width: isMobileApp?200:300}},
        {title: 'Данные', style: {width: isMobileApp?200:300}},
        {title: 'Редактор', style: {width: isMobileApp?200:300}},
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


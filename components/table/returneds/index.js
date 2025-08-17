import React from 'react';
import {connect} from 'react-redux';
import Table from '../Table';
import Row from './Row';

const Tables =  React.memo(({list, setList, app}) =>{
    const {isMobileApp} = app;
    const columns = [
        {title: 'Номер\nСтатус', style: {width: 100}},
        {title: 'Возврат\nДоставка', style: {width: 80}},
        {title: 'Сумма', style: {width: 50}},
        {title: 'Адрес', style: {width: isMobileApp?200:300}},
        {title: 'Организация\nАгент', style: {width: 300}}
    ]
    return <Table
        columns = {columns}
        rows = {list?list.map((element, idx) => <Row key={`row${idx}`} element={element} idx={idx} columns={columns} setList={setList}/>):[]}
    />;
})

function mapStateToProps (state) {
    return {
        app: state.app
    }
}

export default connect(mapStateToProps)(Tables)


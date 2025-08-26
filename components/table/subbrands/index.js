import React from 'react';
import {connect} from 'react-redux';
import Table from '../Table';
import Row from './Row';

const Tables =  React.memo(({list, pagination, app}) =>{
    const {isMobileApp} = app;
    const columns = [
        {title: 'Создан\nСтатус', style: {width: 86}},
        {title: 'Название\nОписание', style: {width: isMobileApp?200:300}},
        {title: 'Организация', style: {width: isMobileApp?200:300}},

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
        app: state.app
    }
}

export default connect(mapStateToProps)(Tables)


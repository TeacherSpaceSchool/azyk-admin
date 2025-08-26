import React from 'react';
import Table from '../Table';
import Row from './Row';
import {connect} from 'react-redux';

const Tables =  React.memo(({list, pagination, app}) =>{
    const {isMobileApp} = app;
    const columns = [
        {title: 'Создан', style: {width: 60}},
        {title: 'Кол-во', style: {width: 60}},
        {title: 'Товар', style: {width: isMobileApp?200:300}},
        {title: 'Склад', style: {width: isMobileApp?200:300}},
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


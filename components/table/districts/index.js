import React from 'react';
import {connect} from 'react-redux';
import Table from '../Table';
import Row from './Row';

const Tables =  React.memo(({list, app, pagination}) =>{
    const {isMobileApp} = app;
    const columns = [
        {title: 'Создан', style: {width: 60}},
        {title: 'Точек', style: {width: 40}},
        {title: 'Название\nАгент', style: {width: isMobileApp?200:300}},
        {title: 'Супервайзер\nЭкспедитор', style: {width: isMobileApp?200:300}},
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
        user: state.user,
    }
}

export default connect(mapStateToProps)(Tables)


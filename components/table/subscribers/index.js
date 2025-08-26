import React from 'react';
import {connect} from 'react-redux';
import Table from '../Table';
import Row from './Row';

const Tables =  React.memo(({list, pagination}) =>{
    const columns = [
        {title: 'Создан', style: {width: 60}},
        {title: 'Подписчик', style: {width: 300}},
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


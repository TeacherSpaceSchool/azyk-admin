import React from 'react';
import Table from '../Table';
import Row from './Row';
import {connect} from 'react-redux';

const Tables =  React.memo(({list, pagination, app, user}) =>{
    const {isMobileApp} = app;
    const {profile} = user;
    const columns = [
        {title: 'Создан', style: {width: 60}},
        {title: 'Имя', style: {width: isMobileApp?200:300}},
        ...profile.role==='admin'?[{title: 'Тип', style: {width: 80}}]:[]
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
        user: state.user
    }
}

export default connect(mapStateToProps)(Tables)


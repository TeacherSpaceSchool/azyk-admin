import React from 'react';
import {connect} from 'react-redux';
import Table from '../Table';
import Row from './Row';

const Tables =  React.memo(({list, buy, app, user}) =>{
    const {isMobileApp} = app;
    const {profile} = user;
    const columns = [
        {title: 'Регистрация\nСтатус', style: {width: 90}},
        {title: 'Имя\nАдрес', style: {width: ['агент', 'суперагент'].includes(profile.role)&&buy&&isMobileApp?200:300}},
        ...['агент', 'суперагент'].includes(profile.role)&&buy?[{title: '', style: {width: 80}}]:[]
    ]
    return <Table
        columns = {columns}
        rows = {list?list.map((element, idx) => <Row key={`row${idx}`} element={element} idx={idx} columns={columns} buy={buy}/>):[]}
    />;
})

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Tables)


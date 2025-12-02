import React from 'react';
import {connect} from 'react-redux';
import Table from '../Table';
import Row from './Row';

const Tables =  React.memo(({list, clientsWithoutAds, handleClientWithoutAds}) =>{
    const columns = [
        {title: '', style: {width: 28.59, margin: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}},
        {title: 'Клиент', style: {width: 300}},
    ]
    return <Table
        columns = {columns}
        rows = {list?list.map((element, idx) => <Row key={`row${idx}`} element={element} idx={idx} columns={columns} clientsWithoutAds={clientsWithoutAds} handleClientWithoutAds={handleClientWithoutAds}/>):[]}
    />;
})

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Tables)


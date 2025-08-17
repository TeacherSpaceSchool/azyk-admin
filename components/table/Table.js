import React from 'react';
import {connect} from 'react-redux';
import Card from '@material-ui/core/Card';

const Table =  React.memo(({columns, rows}) =>{
    return <div style={{width: '100%'}}>
        <div className='tableHead'>
            {columns.map((column, idx) => {
                return column?<React.Fragment key={`column${idx}`}>
                    <div className='tableCell' style={column.style}>
                        {column.title}
                    </div>
                    {idx!==columns.length-1?<div className='tableBorder'/>:null}
                </React.Fragment>:null
            })}
        </div>
        <Card className='table'>
            {rows}
        </Card>
    </div>;
})

function mapStateToProps (state) {
    return {
        app: state.app
    }
}

export default connect(mapStateToProps)(Table)


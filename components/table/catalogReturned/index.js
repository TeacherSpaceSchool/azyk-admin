import React from 'react';
import {connect} from 'react-redux';

const Tables =  React.memo(({middleList, app, list, items, setBasketChange}) =>{
    const {isMobileApp} = app;
    let titleWidth = 300
    let widthNbmr = 55
    const columns = [
        {title: 'Название', style: {width: titleWidth}},
        {title: 'Кол-во', style: {width: widthNbmr}},
        {title: 'Цена', style: {width: widthNbmr}},
        {title: 'Итого', style: {width: widthNbmr}},
    ]
    return <div style={{width: 'fit-content', borderTop: '1px solid #00000040', borderLeft: '1px solid #00000040'}}>
        <div className='tableHead'>
            {columns.map((column, idx) => {
                return column?<React.Fragment key={`column${idx}`}>
                    <div className='tableCell' style={{...column.style, whiteSpace: 'nowrap'}}>
                        {column.title}
                    </div>
                    <div className='tableBorder'/>
                </React.Fragment>:null
            })}
        </div>
        {list?list.map((row, idx) => {
            if(middleList)
                idx += middleList
            return <div className='tableRow' key={row._id}>
                <div className='tableCell' style={columns[0].style}>
                    {row.name}
                </div>
                <div className='tableBorder'/>
                <div className='tableCell' style={columns[1].style} onClick={() => document.getElementById(`catalogCount${idx}`).focus()}>
                    <input style={{width: widthNbmr, outline: 'none', border: 'none', fontWeight: 500, fontFamily: 'Roboto, serif'}}
                           type={isMobileApp?'number':'text'} value={items[row._id]&&items[row._id].count?items[row._id].count:''}
                           onChange={(event) => setBasketChange(idx, event.target.value)} id={`catalogCount${idx}`}/>
                </div>
                <div className='tableBorder'/>
                <div className='tableCell' style={columns[2].style}>
                    {row.price}
                </div>
                <div className='tableBorder'/>
                <div className='tableCell' style={columns[3].style}>
                    {items[row._id]&&items[row._id].allPrice?items[row._id].allPrice:''}
                </div>
                <div className='tableBorder'/>
            </div>
        }):[]}
    </div>;
})

function mapStateToProps (state) {
    return {
        app: state.app,
    }
}

export default connect(mapStateToProps)(Tables)


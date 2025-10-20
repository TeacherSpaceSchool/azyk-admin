import React from 'react';
import {checkFloat, formatAmount} from '../../../src/lib';
import {connect} from 'react-redux';
import SetPackage from '../../dialog/SetPackage';
import {bindActionCreators} from 'redux';
import * as mini_dialogActions from '../../../redux/actions/mini_dialog';

const Tables =  React.memo(({middleList, double, app, mini_dialogActions, list, stockClient, basket, setBasketChange, setPackage, contentRef}) =>{
    const {isMobileApp} = app;
    const {setMiniDialog, showMiniDialog} = mini_dialogActions;
    const hasStock = Object.values(stockClient).length
    const fontSize = 13
    let titleWidth = 300
    let widthNbmr = 55
    const columns = [
        {title: 'Название', style: {width: titleWidth}},
        hasStock?{title: 'Остаток', style: {width: widthNbmr}}:null,
        {title: 'Кол-во', style: {width: widthNbmr}},
        {title: 'Упак-ок', style: {width: widthNbmr}},
        {title: 'Цена', style: {width: widthNbmr}},
        {title: 'Итого', style: {width: widthNbmr}},
    ]
    return <div style={{width: 'fit-content', borderTop: '1px solid #00000040', borderLeft: '1px solid #00000040', fontSize}}>
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
                {hasStock?<>
                    <div className='tableCell' style={columns[1].style}>
                        {stockClient[row._id]}
                    </div>
                    <div className='tableBorder'/>
                </>:null}
                <div className='tableCell' style={columns[2].style} onClick={() => document.getElementById(`catalogCount${idx}`).focus()}>
                    <input style={{width: widthNbmr, outline: 'none', border: 'none', fontWeight: 500, fontFamily: 'Roboto, serif', fontSize}}
                           readOnly={/*!row.apiece*/false} type={isMobileApp?'number':'text'} value={basket[row._id]&&basket[row._id].count?basket[row._id].count:''}
                           onChange={(event) => setBasketChange(idx, event.target.value)} id={`catalogCount${idx}`}/>
                </div>
                <div className='tableBorder'/>
                <div className='tableCell' style={{...columns[3].style, cursor: 'pointer'}} onClick={() => {
                    setMiniDialog('Упаковок', <SetPackage
                        action={setPackage}
                        idx={idx}/>)
                    showMiniDialog(true)
                }}>
                    {basket[row._id]&&basket[row._id].count?checkFloat(basket[row._id].count/(row.packaging?row.packaging:1)):''}
                </div>
                <div className='tableBorder'/>
                <div className='tableCell' style={columns[4].style}>
                    {row.price}
                </div>
                <div className='tableBorder'/>
                <div className='tableCell' style={columns[5].style}>
                    {basket[row._id]&&basket[row._id].allPrice?basket[row._id].allPrice:''}
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

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tables)


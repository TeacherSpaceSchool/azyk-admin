import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as mini_dialogActions from '../../../redux/actions/mini_dialog';
import Row from './Row';
import CloseIcon from '@material-ui/icons/Close';
import * as appActions from '../../../redux/actions/app';
import {isEmpty} from '../../../src/lib';

const Tables =  React.memo(({middleList, list, specialPriceByItem, setSpecialPriceByItem, app, appActions}) =>{
    const {isMobileApp, filter} = app;
    const {setFilter} = appActions;
    let titleWidth = isMobileApp?250:300
    let widthNbmr = 60
    const columns = [
        {title: 'Название', style: {width: titleWidth}},
        {title: 'Цена', style: {width: widthNbmr}},
    ]
    return <div style={{width: 'fit-content', background: 'white'}}>
        <div
            style={{display: 'flex', alignItems: 'center', zIndex: 1000, padding: 5, height: 31, position: 'sticky', background: 'white', top: 0, fontWeight: 600, borderRight: '1px solid #00000040', borderBottom: '1px solid #00000040'}}>
            {isEmpty(middleList)?<>
                <span style={{cursor: 'pointer'}} onClick={async () => {
                    if(document.getElementById('filter-button')) {
                        if (isMobileApp)
                            await document.getElementById('mobile-menu-button').click();
                        document.getElementById('filter-button').click();
                    }
                }}>
                        <span style={{color: '#707070'}}>Категория:</span>&nbsp;
                    <span style={!filter?{color: !filter?'red':'black'}:{}}>{filter?filter:'указать'}</span>
                    </span>
                {!isMobileApp&&filter?<CloseIcon style={{fontSize: 20, color: 'red', cursor: 'pointer'}} onClick={() => setFilter(null)}/>:null}
            </>:null}
        </div>
        <div className='tableHead' style={{top: 31}}>
        {columns.map((column, idx) => {
                return column?<React.Fragment key={`column${idx}`}>
                    <div className='tableCell' style={{...column.style, whiteSpace: 'nowrap'}}>
                        {column.title}
                    </div>
                    <div className='tableBorder'/>
                </React.Fragment>:null
            })}
        </div>
        {filter&&list?list.map((item, idx) => {
            if(middleList)
                idx += middleList
            return <Row key={item._id} item={item} columns={columns} specialPriceByItem={specialPriceByItem} setSpecialPriceByItem={setSpecialPriceByItem} idx={idx}
                        list={list} middleList={middleList}/>
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
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tables)


import React, {useRef} from 'react';
import {inputFloat, navigationKeyTable} from '../../../src/lib';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as mini_dialogActions from '../../../redux/actions/mini_dialog';
import {setSpecialPriceCategory} from '../../../src/gql/specialPriceCategory';

const Row =  React.memo(({item, columns, specialPriceByItem, setSpecialPriceByItem, idx, list, middleList, app}) =>{
    const {isMobileApp, filter, organization} = app;
    const saveTimeOut = useRef(null);
    return <div className='tableRow'>
        <div className='tableCell' style={columns[0].style}>
            {item.name}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[1].style}>
            <input style={{width: '100%', outline: 'none', border: 'none', fontWeight: 500, fontFamily: 'Roboto, serif'}}
                   type={isMobileApp?'number':'text'} value={specialPriceByItem[item._id]||''}
                   onChange={(event) => {
                       const price = inputFloat(event.target.value)
                       setSpecialPriceByItem({...specialPriceByItem, [item._id]: price})
                       if(saveTimeOut.current)
                           clearTimeout(saveTimeOut.current)
                       saveTimeOut.current = setTimeout(async () => await setSpecialPriceCategory({category: filter, organization, price, item: item._id}), 500)
                   }}
                   id={`R${idx}C${0}`} onKeyDown={event => navigationKeyTable({event, row: idx, column: 0, list, middleList})}/>
        </div>
        <div className='tableBorder'/>
    </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Row)


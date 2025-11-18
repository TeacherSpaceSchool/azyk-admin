import React, { useState, useEffect } from 'react';
import {checkFloat, inputFloat, inputInt} from '../../src/lib';
import {connect} from 'react-redux';

const PackageInput = React.memo(({ basket, row, rowIndex, action, id, style, onKeyDown, app }) => {
    const {isMobileApp} = app;
    // локальный state для input
    let [count, setCount] = useState('');

    // синхронизируем с basket[row._id].count
    useEffect(() => {
        const initialValue = basket[row._id]?.count
            ? checkFloat(basket[row._id].count / (row.packaging || 1))
            : '';
        setCount(initialValue);
    }, [basket, row._id, row.packaging]); // зависим от basket и идентификатора строки

    const handleChange = (e) => {
        count = inputInt(e.target.value)
        setCount(count);
        action(rowIndex, checkFloat(count))
    };

    return (
        <input
            id={id}
            type={isMobileApp?'number':'text'}
            value={count}
            onChange={handleChange}
            style={style}
            onKeyDown={onKeyDown}
        />
    );
})

function mapStateToProps (state) {
    return {
        app: state.app,
    }
}

export default connect(mapStateToProps)(PackageInput)

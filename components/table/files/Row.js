import React from 'react';

const Tables =  React.memo(({element, columns}) =>{
    return <div className='tableRow tablePointer'>
        <div className='tableCell' style={columns[0].style}>
            {element.createdAt}
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[1].style}>
            {element.size} MB
        </div>
        <div className='tableBorder'/>
        <div className='tableCell' style={columns[2].style}>
            {element.url}/{element.name}<br/>
            <span style={{color: element.active==='активен'?'green':'red'}}>{element.owner}</span>
        </div>
    </div>
})

export default Tables


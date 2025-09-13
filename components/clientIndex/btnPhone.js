import React from 'react';

const BtnPhone = React.memo(() => {
    const btnPhone = `${process.env.URL==='azyk.store'?'https://':'http://'}${process.env.URL}/clientIndex/btnPhone.svg`
    return <a href='https://api.whatsapp.com/send?phone=996559995197&text='>
        <div style={{
            width: '100%', aspectRatio: '6/1', background: 'linear-gradient(to right, #149F8C, #15A48C, #34E87E)', borderRadius: 12,
            paddingLeft: 20, paddingRight: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
        }}>
            <div style={{fontWeight: '500', fontSize: '1.125rem', color: 'white'}}>
                Тех поддержка
            </div>
            <img alt='Тех поддержка' src={btnPhone} style={{width: 40, height: 40}}/>
        </div>
    </a>
})

export default BtnPhone;

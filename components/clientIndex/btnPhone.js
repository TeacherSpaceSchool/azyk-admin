import React from 'react';

const BtnPhone = React.memo(() => {
    const btnPhone = `${process.env.URL==='azyk.store'?'https://':'http://'}${process.env.URL}/clientIndex/btnPhone.svg`
    return <div onClick={() => window.open('https://api.whatsapp.com/send?phone=996559995197&text=')} style={{
            width: '50%', aspectRatio: '1/0.342', background: 'white', borderRadius: 12,
            paddingLeft: 20, paddingRight: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
        }}>
            <div style={{fontWeight: '500', fontSize: '1.125rem', color: 'black'}}>
                Тех поддержка
            </div>
            <img alt='Тех поддержка' src={btnPhone} style={{width: 40, height: 40}}/>
        </div>
})

export default BtnPhone;

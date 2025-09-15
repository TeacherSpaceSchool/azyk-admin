import React from 'react';
import Link from 'next/link';

const BtnPhone = React.memo(() => {
    const btnPhone = `${process.env.URL==='azyk.store'?'https://':'http://'}${process.env.URL}/clientIndex/btnOrders.svg`
    return <Link href='/orders'>
        <div style={{
            width: '50%', aspectRatio: '1/0.342', background: 'white', borderRadius: 12,
            paddingLeft: 20, paddingRight: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
        }}>
            <div style={{fontWeight: '500', fontSize: '1.125rem', color: 'black'}}>
                Мои заказы
            </div>
            <img alt='Тех поддержка' src={btnPhone} style={{width: 40, height: 40}}/>
        </div>
    </Link>
})

export default BtnPhone;

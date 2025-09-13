import React from 'react';
import Link from 'next/link';

const BtnPromo = React.memo(() => {
    const btnPromo = `${process.env.URL==='azyk.store'?'https://':'http://'}${process.env.URL}/clientIndex/btnPromo.svg`
    return <Link href={'/organizations?path=ads&title=Акции'} as={'/organizations?path=ads&title=Акции'}>
        <div style={{
            width: '50%', aspectRatio: '1/0.342', background: 'linear-gradient(to right, #FB4C36, #F9493A, #E0286E)', borderRadius: 12,
            paddingLeft: 20, paddingRight: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
        }}>
            <div style={{fontWeight: '500', fontSize: '1.125rem', color: 'white'}}>
                Акции
            </div>
            <img src={btnPromo} style={{width: 40, height: 40}}/>
        </div>
    </Link>
})

export default BtnPromo;

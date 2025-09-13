import React from 'react';
import Link from 'next/link';

const BtnComplaint = React.memo(() => {
    const btnComplaint = `${process.env.URL==='azyk.store'?'https://':'http://'}${process.env.URL}/clientIndex/btnComplaint.svg`
    return <Link href='/reviews'>
        <div style={{
            width: '50%', aspectRatio: '1/0.342', background: 'linear-gradient(to right, #51C3F1, #3D9DEF, #3388ED)', borderRadius: 12,
            paddingLeft: 20, paddingRight: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
        }}>
            <div style={{fontWeight: '500', fontSize: '1.125rem', color: 'white'}}>
                Оставить отзыв
            </div>
            <img src={btnComplaint} style={{width: 40, height: 40}}/>
        </div>
    </Link>
})

export default BtnComplaint;

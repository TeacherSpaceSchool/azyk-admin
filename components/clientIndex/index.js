import React from 'react';
import clientIndexStyle from '../../src/styleMUI/clientIndex'
import Carousel from './carousel';
import BtnPhone from './btnPhone';
import BtnPromo from './btnPromo';
import BtnComplaint from './btnComplaint';
import Brand from './brand';

const Index = React.memo(({banners, list, pagination}) => {
    const classes = clientIndexStyle();
    return <div className={classes.page} style={{padding: 5, display: 'flex', flexDirection: 'column', gap: '5px'}}>
        <Carousel banners={banners&&banners.images}/>
        <BtnPhone/>
        <div style={{display: 'flex', gap: '5px'}}>
            <BtnComplaint/>
            <BtnPromo/>
        </div>
        {list?list.map((element, idx) => {
                    if(idx<pagination)
                        return <Brand key={element._id} element={element} idx={idx}/>
                })
            :null}
    </div>
})

export default Index;

import React, {useEffect, useState} from 'react';
import '../../src/styleMUI/clientIndex/carousel.css'
import ChevronRight from '@material-ui/icons/ArrowForwardIos';
import ChevronLeft from '@material-ui/icons/ArrowBackIos';

const Carousel = React.memo(({banners}) => {
    const [index, setIndex] = useState(0);
    // Автопрокрутка
    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % banners.length);
        }, 3000); // каждые 3 секунды
        return () => clearInterval(interval);
    }, []);

    const nextBanner = () => {
        setIndex((prev) => (prev + 1) % banners.length);
    };

    const prevBanner = () => {
        setIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };
    return banners&&banners.length?<div className='carousel'>
        <div
            className='carousel-track'
            style={{ transform: `translateX(-${index * 100}%)` }}
        >
            {banners.map((banner, idx) => (
                <img key={`banner${idx}`} src={banner} className='carousel-image' />
            ))}
        </div>
        {banners.length>1?<>
            <button className='carousel-btn left' onClick={prevBanner}>
                <ChevronLeft size={24} />
            </button>
            <button className='carousel-btn right' onClick={nextBanner}>
                <ChevronRight size={24} />
            </button>
            <div className='carousel-dots'>
                {banners.map((banner, idx) => (
                    <div
                        key={`dot${idx}`}
                        className={`dot ${idx === index ? 'active' : ''}`}
                        onClick={() => setIndex(idx)}
                    />
                ))}
            </div>
        </>:null}
    </div>:null
})

export default Carousel;

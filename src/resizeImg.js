import Resizer from 'react-image-file-resizer';
// eslint-disable-next-line no-undef
export const resizeImg = (file) => new Promise(resolve => {
    Resizer.imageFileResizer(file, 800, 800, 'JPEG', 30, 0,
        uri => {
            resolve(uri);
        },
        'base64'
    );
});
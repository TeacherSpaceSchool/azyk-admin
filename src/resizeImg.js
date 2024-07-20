import Resizer from 'react-image-file-resizer';
export const resizeImg = (file) => new Promise(resolve => {
    Resizer.imageFileResizer(file, 800, 800, 'JPEG', 60, 0,
        uri => {
            resolve(uri);
        },
        'base64'
    );
});
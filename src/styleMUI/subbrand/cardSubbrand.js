import { makeStyles } from '@material-ui/core/styles';
export default makeStyles({
    cardM: {
        width: 'calc(100vw - 20px)',
        marginBottom: 10
    },
    cardD: {
        width: 400,
        margin: 10
    },
    media: {
        objectFit: 'cover',
        height: '60px',
        width: '60px',
        marginRight: 10
    },
    avatar: {
        borderRadius: '50px',
        objectFit: 'cover',
        height: '100px',
        width: '100px',
        margin: 10
    },
    text: {
        fontWeight: 'bold',
        fontSize: '16px',
        fontFamily: 'Roboto'
    },
    inputM: {
        marginBottom: 5,
        width: 'calc(100vw - 82px)',
        fontSize: '16px',
        fontFamily: 'Roboto'
    },
    inputD: {
        marginBottom: 5,
        width: 400-82,
        fontSize: '16px',
        fontFamily: 'Roboto'
    },
    input: {
        marginBottom: 15,
        width: 368,
        fontSize: '16px',
        fontFamily: 'Roboto'
    },
    line: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
})
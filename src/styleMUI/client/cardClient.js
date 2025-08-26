import { makeStyles } from '@material-ui/core/styles';
export default makeStyles({
    cardM: {
        position: 'relative',
        width: 'calc(100vw - 20px)',
        marginBottom: 10
    },
    cardD: {
        position: 'relative',
        width: 400,
        margin: 10
    },
    media: {
        borderRadius: '30px',
        objectFit: 'cover',
        height: '60px',
        width: '60px',
        marginRight: 10
    },
    notification: {
        position: 'absolute',
        top: 5,
        right: 5,
        fontSize: 15
    },
    line: {
        display: 'flex',
        alignItems: 'start',
        justifyContent: 'start',
        flexDirection: 'row',
    },
    nameField: {
        marginBottom: 10,
        fontWeight: 'bold',
        fontSize: '0.875rem',
        fontFamily: 'Roboto',
        color: '#A0A0A0'
    },
    value: {
        marginBottom: 10,
        fontWeight: '500',
        fontSize: '0.875rem',
        fontFamily: 'Roboto',
        wordBreak: 'break-all'
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline'
    },
})
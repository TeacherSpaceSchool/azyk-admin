import { makeStyles } from '@material-ui/core/styles';
export default makeStyles({
    cardM: {
        width: 'calc(100vw - 20px)',
        marginBottom: 10,
        position: 'relative'
    },
    cardD: {
        width: 400,
        margin: 10,
        position: 'relative'
    },
    input: {
        width: '100%',
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline'
    },
    status: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 4,
        borderRadius: 10,
        fontSize: '0.815rem',
        fontWeight: 'bold',
        color: 'white',
        fontFamily: 'Roboto',

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
})
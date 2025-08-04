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
    column: {
        display: 'flex',
        flexDirection: 'column',
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline'
    },
    number: {
        marginBottom: 10,
        fontWeight: 'bold',
        fontSize: '1rem',
        fontFamily: 'Roboto',
    },
    date: {
        marginBottom: 10,
        fontSize: '0.875rem',
        fontFamily: 'Roboto',
        color: '#A0A0A0'
    },
    status: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 4,
        width: 45,
        borderRadius: 10,
        fontSize: '0.815rem',
        fontWeight: 'bold',
        color: 'white',
        fontFamily: 'Roboto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'

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
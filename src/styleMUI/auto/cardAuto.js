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
    input: {
        width: '100%',
        marginBottom: 10
    },
    media: {
        objectFit: 'cover',
        height: '60px',
        width: '60px',
        marginRight: 10
    },
    column: {
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
    line: {
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    mediaO: {
        borderRadius: 10,
        objectFit: 'cover',
        height: '110px',
        width: '110px',
        marginRight: 10
    },
})
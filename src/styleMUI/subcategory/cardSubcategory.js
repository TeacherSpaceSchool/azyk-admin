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
    },
    inputHalf: {
        width: '50%',
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
    row:{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        flexWrap: 'wrap'
    },
    line: {
        margin: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
})
import { makeStyles } from '@material-ui/core/styles';
export default makeStyles({
    page: {
        margin: '10px'
    },
    row:{
        display: 'flex',
        flexDirection: 'row',
    },
    column:{
        display: 'flex',
        flexDirection: 'column',
    },
    geo: {
        width: 50,
        textAlign: 'center',
        marginTop: -10,
        marginBottom: 20,
        fontSize: '1rem',
        fontFamily: 'Roboto',
        whiteSpace: 'pre-wrap',
        cursor: 'pointer',
        borderBottom: '1px dashed #ffb300'
    },
    mediaM: {
        objectFit: 'cover',
        height: 'calc(100vw - 72px)',
        width: 'calc(100vw - 72px)',
        marginBottom: 10,
    },
    mediaD: {
        objectFit: 'cover',
        height: 300,
        width: 300,
        marginRight: 10,
        marginBottom: 10,
        cursor: 'pointer'
    },
    name: {
        marginBottom: 10,
        fontWeight: 'bold',
        fontSize: '1.25rem',
        fontFamily: 'Roboto'
    },
    value: {
        marginBottom: 10,
        fontWeight: '500',
        fontSize: '1rem',
        fontFamily: 'Roboto',
        wordBreak: 'break-all'
    },
    nameField: {
        width: 80,
        marginBottom: 10,
        fontWeight: 'bold',
        fontSize: '1rem',
        fontFamily: 'Roboto',
        color: '#A0A0A0'
    },
    info: {
        color: '#455A64',
        marginBottom: 10,
        fontSize: '1rem',
        fontFamily: 'Roboto',
        whiteSpace: 'pre-wrap'
    },
    input: {
        marginBottom: 10,
        width: '100%',
    },
    mediaSocial: {
        objectFit: 'cover',
        height: 32,
        width: 32,
        margin: 10,
    },
    scrollDown: {
        cursor: 'pointer',
        padding: 10,
        borderRadius: 5,
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        position: 'fixed',
        right: 10,
        zIndex: 1500,
        bottom: 10,
        fontSize: '1rem',
        fontWeight: 'bold',
        userSelect: 'none',
        '-webkit-user-select': 'none',
        '-khtml-user-select': 'none',
        '-moz-user-select': 'none',
        '-ms-user-select': 'none',
        background: '#ffb300'
    },
    scrollDownContainer: {
        width: '100%',
        height: '100%',
        position: 'relative'
    },
    scrollDownDiv: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
        height: '100%',
    }
})
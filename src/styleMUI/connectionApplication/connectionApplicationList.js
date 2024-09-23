import { makeStyles } from '@material-ui/core/styles';

export default makeStyles({
    page: {
        paddingTop: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap'
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
    },
})
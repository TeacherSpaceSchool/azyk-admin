import { makeStyles } from '@material-ui/core/styles';

export default makeStyles({
    shorobanDiv: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shoroban: {
        width: '100%',
        maxWidth: 800
    },
    page: {
        paddingTop: 10,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    populars: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        overflowX: 'scroll',
        flex: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    fab: {
        position: 'fixed!important',
        bottom: '20px',
        right: '20px'
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
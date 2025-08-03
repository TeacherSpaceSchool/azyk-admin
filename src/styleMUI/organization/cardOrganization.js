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
    mediaO: {
        borderRadius: 10,
        objectFit: 'cover',
        height: '60px',
        width: '60px',
        marginRight: 10
    },
    avatar: {
        borderRadius: 50,
        objectFit: 'cover',
        height: '100px',
        width: '100px',
        margin: 10
    },
    text: {
        fontWeight: 'bold',
        fontSize: '1rem',
        fontFamily: 'Roboto'
    },
    input: {
        marginBottom: 5,
        fontSize: '1rem',
        fontFamily: 'Roboto',
        width: '100%'
    },
    line: {
        margin: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    column:{
        display: 'flex',
        flexDirection: 'column',
        width: 'calc(100% - 70px)',
    },
    value: {
        fontSize: '0.875rem',
        fontFamily: 'Roboto',
        wordBreak: 'break-all'
    },
    cardBrand: {
        width: 'calc(100vw / 3 - 10px)',
        margin: /*5*/3,
        padding: 3,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        //height: /*135*/122
    },
    mediaBrand: {
        borderRadius: /*30*/10,
        objectFit: 'cover',
        height: /*67*/80,
        width: /*67*/80,
        //margin: 5,
    },
    nameBrand: {
        width: 'calc(100vw / 3 - 15px)',
        fontWeight: 'bold',
        fontSize: '0.81rem',
        fontFamily: 'Roboto',
        overflow: 'hidden',
        //height: 15,
        marginBottom: 3,
        textAlign: 'center'
    },
    textBrand: {
        width: 'calc(100vw / 3 - 15px)',
        fontSize: /*'0.6875rem'*/'0.75rem',
        fontFamily: 'Roboto',
        overflow: 'hidden',
        //height: /*45*/36,
        lineHeight: '11px',
        marginTop: 3,
        textAlign: 'center'
    }
})
export default theme => ({
    main:{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    },
    addPackaging: {
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        fontSize: '0.8125rem',
        fontFamily: 'Roboto',
        whiteSpace: 'pre-wrap',
        cursor: 'pointer',
        borderBottom: '1px dashed #ffb300',
        userSelect: 'none',
    },
    showAds: {
        fontWeight: 'bold',
        marginBottom: 10,
        padding: 10,
        background: 'red',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        textAlign: 'center',
        fontSize: '1rem',
        fontFamily: 'Roboto',
        cursor: 'pointer',
        border: '1px solid #ffb300',
        userSelect: 'none',
        boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)'
},
    mainLine:{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    button: {
        margin: theme.spacing(1),
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    message: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        textAlign: 'center',
        color: 'indigo',
        fontWeight: 'bold',
        cursor: 'pointer',
        overflowWrap: 'break-word',
        fontSize: '1rem'
    },
    itogo: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        textAlign: 'left',
        fontSize: '1rem',
    },
    error_message: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        color: 'red',
        fontWeight: 'bold'
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
    fabGeo: {
        position: 'fixed',
        bottom: 70,
        right: 35
    },
    fabNavigation: {
        position: 'fixed',
        bottom: 136,
        right: 35
    },
    geo: {
        width: 170,
        textAlign: 'center',
        marginTop: -5,
        marginBottom: 10,
        fontSize: '0.875rem',
        fontFamily: 'Roboto',
        whiteSpace: 'pre-wrap',
        cursor: 'pointer',
        userSelect: 'none',
        borderBottom: '1px dashed #ffb300'
    },
    counterbtn: {
        marginRight: 10,
        marginLeft: 10,
        userSelect: 'none',
        cursor: 'pointer',
        width: 16,
        height: 16,
        fontSize: '0.875rem',
        fontWeight: 700,
        background: '#e6e6e6',
        color: '#212121',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    minibtn: {
        marginRight: 20,
        marginBottom: 10,
        userSelect: 'none',
        cursor: 'pointer',
        width: 50,
        height: 20,
        fontSize: '0.875rem',
        fontWeight: 700,
        background: '#e6e6e6',
        color: '#212121',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    chip: {
        margin: theme.spacing(0.5),
        cursor: 'pointer',
    }
});
import { makeStyles } from '@material-ui/core/styles';
export default makeStyles({
    page: {
        overflowX: 'auto'
    },
    row:{
        display: 'flex',
        flexDirection: 'row'
    },
    unit:{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 30,
    },
    column:{
        display: 'flex',
        flexDirection: 'column',
    },
    valuecons: {
        marginTop: 5,
        marginBottom: -5,
        fontWeight: '500',
        fontSize: '0.875rem',
        fontFamily: 'Roboto',
        wordBreak: 'break-all'
    },
    counterbtncons: {
        marginTop: 5,
        marginBottom: -5,
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
    input: {
        width: '100%',
    },
    nameM: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: '1.125rem',
        fontFamily: 'Roboto'
    },
    nameField: {
        marginBottom: 10,
        fontWeight: 'bold',
        fontSize: '0.875rem',
        fontFamily: 'Roboto',
        color: '#A0A0A0'
    },
    valueField: {
        marginBottom: 10,
        fontWeight: '500',
        fontSize: '0.875rem',
        fontFamily: 'Roboto',
        wordBreak: 'break-all'
    },
    value: {
        marginBottom: 5,
        fontSize: '1rem',
        fontFamily: 'Roboto',
        wordBreak: 'break-all'
    },
    bottomBasketM: {
        width: '100vw',
        borderTop: '1px #aeaeae solid',
        background: '#fff',
        height: 70,
        position: 'fixed',
        bottom: 0,
        right: 0,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 10000
    },
    buyM:{
        width: 140,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '1.125rem',
        fontFamily: 'Roboto',
        background: '#ffb300',
        marginRight: 15

    },
    allPriceM:{
        marginLeft: 10,
        width: 'calc(100vw - 100px)',
    },
    bottomBasketD: {
        width: 'calc(100vw - 300px)',
        background: '#fff',
        borderTop: '1px #aeaeae solid',
        height: 44,
        position: 'fixed',
        bottom: 0,
        right: 0,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 10000
    },
    allPriceD:{
        marginLeft: 20,
        width: '100%',
    },
    buyD:{
        width: 140,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '1rem',
        fontFamily: 'Roboto',
        background: '#ffb300',

    },
    priceAll:{
        fontWeight: 'bold',
        fontSize: '1rem',
        fontFamily: 'Roboto'

    },
    priceAllText:{
        fontSize: '1rem',
        fontFamily: 'Roboto',
        width: 'fit-content'
    },
    line: {
        display: 'flex',
        alignItems: 'start',
        justifyContent: 'start',
        flexDirection: 'row',
    },
    media: {
        width: '100px!important',
        height: '100px!important',
        objectFit: 'contain',
        marginRight: 10
    },
    counter: {
        borderRadius: 5,
        overflow: 'hidden',
        border: '1px solid #e6e6e6',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    counterbtn: {
        userSelect: 'none',
        cursor: 'pointer',
        width: 40,
        height: 30,
        fontSize: '1rem',
        fontWeight: 700,
        background: '#e6e6e6',
        color: '#212121',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    counternmbr: {
        width: 77,
        height: 30,
        outline: 'none',
        border: 'none',
        fontSize: '1rem',
        textAlign: 'center',
    },
    addPackaging: {
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'center',
        fontSize: '0.875rem',
        fontFamily: 'Roboto',
        whiteSpace: 'pre-wrap',
        cursor: 'pointer',
        borderBottom: '1px dashed #ffb300',
        userSelect: 'none',
        width: 140
    },
    stock: {
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'center',
        fontSize: '0.875rem',
        fontFamily: 'Roboto',
        whiteSpace: 'pre-wrap',
        cursor: 'pointer',
        userSelect: 'none',
        width: 140
    }
})
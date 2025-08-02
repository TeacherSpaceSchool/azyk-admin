import { makeStyles } from '@material-ui/core/styles';
export default makeStyles({
    page: {
        overflowX: 'auto',
        marginBottom: 8,
    },
    row:{
        display: 'flex',
        flexDirection: 'row'
    },
    addPackaging: {
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center',
        fontSize: '0.8125rem',
        fontFamily: 'Roboto',
        whiteSpace: 'pre-wrap',
        cursor: 'pointer',
        borderBottom: '1px dashed #ffb300',
        userSelect: 'none',
        width: 125
    },
    addPackagingM: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: '0.875rem',
        fontFamily: 'Roboto',
        whiteSpace: 'pre-wrap',
        cursor: 'pointer',
        borderBottom: '1px dashed #ffb300',
        userSelect: 'none',
        width: 145
    },
    itemM:{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    cancelM: {
        position: 'absolute',
        top: 0,
        right: 0,
        cursor: 'pointer'
    },
    column:{
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        width: '100%',
    },
    divImage: {
        position: 'relative',
        width: '100%'
    },
    mediaM: {
        width: 'calc(100vw / 4)',
        height: 'calc(100vw / 4)',
        maxWidth: 100,
        maxHeight: 100,
        objectFit: 'contain',
        marginRight: 10
    },
    mediaD: {
        objectFit: 'contain',
        width: 70,
        height: 70
    },
    nameD: {
        height: 80,
        width: 200,
        overflow: 'hidden',
        wordWrap: 'break-word',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        fontWeight: 500,
        fontFamily: 'Roboto'
    },
    nameM: {
        width: 'calc(100% - 20px)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: '1rem',
        fontFamily: 'Roboto'
    },
    priceAllM: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: '1.125rem',
        fontFamily: 'Roboto'
    },
    value: {
        marginBottom: 5,
        fontSize: '1rem',
        fontFamily: 'Roboto',
        wordBreak: 'break-all'
    },
    nameField: {
        width: 100,
        marginBottom: 5,
        fontWeight: 'bold',
        fontSize: '1rem',
        fontFamily: 'Roboto',
        color: '#A0A0A0'
    },
    counter: {
        width: 145,
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
        width: 34,
        height: 34,
        fontSize: 20,
        fontWeight: 700,
        background: '#e6e6e6',
        color: '#212121',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    counternmbr: {
        width: 77,
        height: 34,
        outline: 'none',
        border: 'none',
        fontSize: 20,
        textAlign: 'center',
    },
    counterM: {
        width: 127,
        borderRadius: 5,
        overflow: 'hidden',
        border: '1px solid #e6e6e6',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    counterbtnM: {
        userSelect: 'none',
        cursor: 'pointer',
        width: 25,
        height: 25,
        fontSize: 20,
        fontWeight: 700,
        background: '#e6e6e6',
        color: '#212121',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    counternmbrM: {
        width: 77,
        height: 25,
        outline: 'none',
        border: 'none',
        fontSize: 20,
        textAlign: 'center',
    },
    hrA: {
        width: '100%',
        background: 'black',
        height: 1,
        marginBottom: 5,
        marginTop: 5

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
    allPriceD:{
        marginLeft: 20,
        width: 'calc(100vw - 500px)',
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
        marginRight: 15

    },
    priceAll:{
        fontWeight: 'bold',
        fontSize: '1rem',
        fontFamily: 'Roboto'

    },
    priceAllText:{
        fontSize: '1rem',
        fontFamily: 'Roboto'

    },

    counterD: {
        height: 28,
        width: 113,
        borderRadius: 5,
        overflow: 'hidden',
        border: '1px solid #e6e6e6',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    counterbtnD: {
        fontSize: '1rem',
        userSelect: 'none',
        cursor: 'pointer',
        width: 28,
        height: 28,
        fontWeight: 700,
        background: '#e6e6e6',
        color: '#212121',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    counternmbrD: {
        fontSize: '0.875rem',
        width: 57,
        height: 28,
        outline: 'none',
        border: 'none',
        textAlign: 'center',
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
    }
})
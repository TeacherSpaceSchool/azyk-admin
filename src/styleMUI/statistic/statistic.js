import { makeStyles } from '@material-ui/core/styles';
export default makeStyles({
    listInvoices: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%'
    },
    page: {
        overflowX: 'auto',
        marginBottom: 8,
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
    column:{
        display: 'flex',
        flexDirection: 'column',
    },
    row1:{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    column1:{
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        width: 'calc(100% - 5px)',
        margin: 5
    },
    inputHalf: {
        width: 'calc(50% - 10px)',
        margin: 5
    },
    inputThird: {
        width: 'calc((100% / 3) - 10px)',
        margin: 5
    },
    inputFour: {
        width: 'calc((100% / 4) - 10px)',
        margin: 5
    },
    rowStatic: {
        margin: 5
    },
    dateStatistic: {
        width: 5,
        height: 5,
        margin: 5
    },
    fab: {
        position: 'fixed!important',
        bottom: '20px',
        right: '20px'
    },
    fab2: {
        position: 'fixed!important',
        right: '86px',
        bottom: '28px'
    },

})
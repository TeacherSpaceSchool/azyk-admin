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
    fab: {
        position: 'fixed!important',
        bottom: '20px',
        right: '20px'
    },
})
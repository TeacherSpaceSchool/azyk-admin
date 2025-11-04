import React from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as snackbarActions from '../../redux/actions/snackbar'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import {useRouter} from 'next/router';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Link from 'next/link';
import Button from '@material-ui/core/Button';

const QuickTransition = React.memo(({fab2}) => {
    const router = useRouter()
    //speedDial
    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    //render
    return (
        <>
            <Button style={{position: 'fixed', right: fab2?86:20, bottom: 28}} variant='contained' color='primary' onClick={handleClick}>
                Переход
            </Button>
            <Menu
                id='simple-menu'
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {!router.asPath.includes('logistic/financereport')?<Link href={'/logistic/financereport/[id]'} as={`/logistic/financereport/${router.query.id}`}>
                    <MenuItem onClick={handleClose}>Отчет по деньгам</MenuItem>
                </Link>:null}
                {!router.asPath.includes('logistic/changelogistic')?<Link href={'/logistic/changelogistic/[id]'} as={`/logistic/changelogistic/${router.query.id}`}>
                    <MenuItem onClick={handleClose}>Редактирование логистики</MenuItem>
                </Link>:null}
                {!router.asPath.includes('logistic/summaryinvoice')?<Link href={'/logistic/summaryinvoice/[id]'} as={`/logistic/summaryinvoice/${router.query.id}`}>
                    <MenuItem onClick={handleClose}>Сводная накладная</MenuItem>
                </Link>:null}
            </Menu>
        </>

    );
})

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(QuickTransition)
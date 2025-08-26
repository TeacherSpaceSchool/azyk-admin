import Head from 'next/head';
import React, {useCallback, useState} from 'react';
import App from '../../../layouts/App';
import CardError from '../../../components/card/CardError';
import pageListStyle from '../../../src/styleMUI/error/errorList'
import {getErrors, clearAllErrors} from '../../../src/gql/error'
import { connect } from 'react-redux'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import initialApp from '../../../src/initialApp'
import Router from 'next/router'
import Fab from '@material-ui/core/Fab';
import RemoveIcon from '@material-ui/icons/Clear';
import Confirmation from '../../../components/dialog/Confirmation'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import {formatAmount} from '../../../src/lib';
import {viewModes} from '../../../src/enum';
import Table from '../../../components/table/errors';

const Errors = React.memo((props) => {
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const classes = pageListStyle();
    const {data} = props;
    const {viewMode} = props.app;
    let [list, setList] = useState(data.errors);
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [pagination, list])
    return (
        <App checkPagination={checkPagination} pageName='Сбои'>
            <Head>
                <title>Сбои</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                {list?viewMode===viewModes.card?
                        list.map((element, idx) => {
                            if(idx<pagination)
                                return <CardError element={element}/>
                        })
                        :
                        <Table list={list} pagination={pagination}/>
                    :null}
                <div className='count'>
                    Всего: {formatAmount(list.length)}
                </div>
            </div>
            {list.length?<Fab onClick={() => {
                const action = async () => {
                    await clearAllErrors()
                    setList([])
                }
                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                showMiniDialog(true)
            }} color='primary' className={classes.fab}>
                <RemoveIcon/>
            </Fab>:null}
        </App>
    )
})

Errors.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(ctx.store.getState().user.profile.role!=='admin')
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            errors: await getErrors(getClientGqlSsr(ctx.req))
        },
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Errors);
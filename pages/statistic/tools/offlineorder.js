import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import App from '../../../layouts/App';
import CardOfflineOrder from '../../../components/card/CardOfflineOrder';
import pageListStyle from '../../../src/styleMUI/offlineorder/offlineOrderList'
import { connect } from 'react-redux'
import initialApp from '../../../src/initialApp'
import Router from 'next/router'
import Fab from '@material-ui/core/Fab';
import RemoveIcon from '@material-ui/icons/Clear';
import Confirmation from '../../../components/dialog/Confirmation'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import { clearAllOfflineOrders, getAllOfflineOrders } from '../../../src/service/idb/offlineOrders';
import {formatAmount} from '../../../src/lib';

const OfflineOrder = React.memo((props) => {
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const classes = pageListStyle();
    let [list, setList] = useState([]);
    useEffect(() => {
        (() => {
            if(process.browser) {
                setTimeout(async () => {
                    setList(await getAllOfflineOrders())
                }, 1000)
            }
        })()
    }, [process.browser])
    return (
        <App pageName='Оффлайн заказы'>
            <Head>
                <title>Оффлайн заказы</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                {list?
                    <>
                    <div className='count'>
                        Всего: {formatAmount(list.length)}
                    </div>
                    {
                        list.map((element, idx) =>
                            <CardOfflineOrder idx={idx} element={element} list={list} setList={setList}/>
                        )
                    }
                    </>
                    :
                    null}
            </div>
            <Fab onClick={() => {
                    const action = async () => {
                        await clearAllOfflineOrders()
                        setList([])
                    }
                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                    showMiniDialog(true)
                }} color='primary' className={classes.fab}>
                <RemoveIcon />
            </Fab>
        </App>
    )
})

OfflineOrder.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!ctx.store.getState().user.profile.role.includes('агент'))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {};
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

export default connect(mapStateToProps, mapDispatchToProps)(OfflineOrder);
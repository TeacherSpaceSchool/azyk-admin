import Head from 'next/head';
import React, { useState } from 'react';
import App from '../../layouts/App';
import CardError from '../../components/error/CardError';
import pageListStyle from '../../src/styleMUI/error/errorList'
import {getErrors, clearAllErrors} from '../../src/gql/error'
import { connect } from 'react-redux'
import { urlMain } from '../../redux/constants/other'
import LazyLoad from 'react-lazyload';
import CardErrorPlaceholder from '../../components/error/CardErrorPlaceholder'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import Router from 'next/router'
import Fab from '@material-ui/core/Fab';
import RemoveIcon from '@material-ui/icons/Clear';
import Confirmation from '../../components/dialog/Confirmation'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'

const Error = React.memo((props) => {
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    const classes = pageListStyle();
    const { data } = props;
    let [list, setList] = useState(data.errors);
    return (
        <App pageName='Сбои'>
            <Head>
                <title>Сбои</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                <div className='count'>
                    {`Всего: ${list.length}`}
                </div>
                {list?list.map((element)=>
                    <LazyLoad scrollContainer={'.App-body'} key={element._id} height={120} offset={[120, 0]} debounce={0} once={true}  placeholder={<CardErrorPlaceholder/>}>
                        <CardError element={element}/>
                    </LazyLoad>
                ):null}
            </div>
            <Fab onClick={async()=>{
                    const action = async() => {
                        await clearAllErrors()
                        setList([])
                    }
                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                    showMiniDialog(true)
                }} color='primary' aria-label='add' className={classes.fab}>
                <RemoveIcon />
            </Fab>
        </App>
    )
})

Error.getInitialProps = async function(ctx) {
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
            ...await getErrors(ctx.req?await getClientGqlSsr(ctx.req):undefined)
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

export default connect(mapStateToProps, mapDispatchToProps)(Error);
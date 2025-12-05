import Head from 'next/head';
import React from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import initialApp from '../../../src/initialApp'
import {getStatisticRAM} from '../../../src/gql/statistic'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import Button from '@material-ui/core/Button';
import {forceUpdate} from '../../../src/gql/versionControl';
import {bindActionCreators} from 'redux';
import * as appActions from '../../../redux/actions/app';
import * as snackbarActions from '../../../redux/actions/snackbar';

const ForceUpdate = React.memo((props) => {
    const classes = pageListStyle();
    const {showLoad} = props.appActions;
    const {showSnackBar} = props.snackbarActions;
    return (
        <App dates cityShow pageName='Принудительное обновление'>
            <Head>
                <title>Принудительное обновление</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column}>
                    <Button onClick={async () => {
                        showLoad(true)
                        const res = await forceUpdate()
                        showLoad(false)
                        if(res==='OK')
                            showSnackBar('Успешно')
                        else
                            showSnackBar('Ошибка')
                    }} color='primary'>
                        Принудительно обновить
                    </Button>
                </CardContent>
            </Card>
        </App>
    )
})

ForceUpdate.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            statisticRAM: await getStatisticRAM(getClientGqlSsr(ctx.req))
        },
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ForceUpdate);
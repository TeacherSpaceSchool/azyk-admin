import Head from 'next/head';
import React, { useEffect } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import { urlMain } from '../../redux/constants/other'
import initialApp from '../../src/initialApp'
import {getStatisticRAM} from '../../src/gql/statistic'
import { getClientGqlSsr } from '../../src/getClientGQL'

const RAM = React.memo((props) => {
    const classes = pageListStyle();
    const { isMobileApp } = props.app;
    const { data } = props;
    useEffect(()=>{
        if(process.browser){
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    },[process.browser])
    return (
        <App dates cityShow pageName='Статистика RAM'>
            <Head>
                <title>Статистика RAM</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        <div className={classes.nameField}>totalmem:&nbsp;</div>
                        <div className={classes.value}>{data.statisticRAM[0]}</div>
                    </div>
                    <div className={classes.row}>
                        <div className={classes.nameField}>usemem:&nbsp;</div>
                        <div className={classes.value}>{data.statisticRAM[1]}</div>
                    </div>
                    <div className={classes.row}>
                        <div className={classes.nameField}>freemem:&nbsp;</div>
                        <div className={classes.value}>{data.statisticRAM[2]}</div>
                    </div>
                </CardContent>
            </Card>
        </App>
    )
})

RAM.getInitialProps = async function(ctx) {
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
            ...await getStatisticRAM(ctx.req?await getClientGqlSsr(ctx.req):undefined)
        },
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
    }
}

export default connect(mapStateToProps)(RAM);
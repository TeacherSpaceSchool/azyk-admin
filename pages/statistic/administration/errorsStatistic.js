import Head from 'next/head';
import React, {useEffect} from 'react';
import App from '../../../layouts/App';
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import initialApp from '../../../src/initialApp'
import Table from '../../../components/app/Table'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import {getErrorsStatistic} from '../../../src/gql/error';

const ErrorsStatistic = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    useEffect(() => {
        if(process.browser) {
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    }, [process.browser])
    return (
        <App cityShow pageName='Статистика сбоев'>
            <Head>
                <title>Статистика сбоев</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column}>
                    <Table filterHeight={0} type='item' row={(data.errorsStatistic.row).slice(1)} columns={data.errorsStatistic.columns}/>
                </CardContent>
            </Card>
            <div className='count'>
                {
                    data.errorsStatistic?
                        <>
                        <div className={classes.rowStatic}>{`Пути: ${data.errorsStatistic.row[0].data[0]}`}</div>
                        <div className={classes.rowStatic}>{`Количество: ${data.errorsStatistic.row[0].data[1]}`}</div>
                        </>
                        :null
                }
            </div>
        </App>
    )
})

ErrorsStatistic.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    ctx.store.getState().app.filter = false
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
            errorsStatistic: await getErrorsStatistic(getClientGqlSsr(ctx.req)),
        }
    };
};

export default (ErrorsStatistic);
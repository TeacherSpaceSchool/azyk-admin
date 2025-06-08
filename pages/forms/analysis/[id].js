import initialApp from '../../../src/initialApp'
import Head from 'next/head';
import React from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import {getTemplateForm, getAnalysisForms} from '../../../src/gql/form'
import organizationStyle from '../../../src/styleMUI/form/form'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { useRouter } from 'next/router'
import Router from 'next/router'
import { urlMain } from '../../../redux/constants/other'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import Divider from '@material-ui/core/Divider';

const AnalysisForms = React.memo((props) => {
    const { profile } = props.user;
    const classes = organizationStyle();
    const { data } = props;
    const { isMobileApp } = props.app;
    const router = useRouter()
    return (
        <App pageName={data.templateForm.title}>
            <Head>
                <title>{data.templateForm.title}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                {
                    data.templateForm!==null?
                        ['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                            <>
                            <div className={classes.question}>
                                <h3>
                                    Анкет
                                </h3>
                                <br/>
                                <Divider/>
                                {
                                    data.analysisForms.editor.map((element, idx) =>
                                        <div style={{width: '100%', marginTop: 10}} key={`${element._id}${idx}`}>
                                            <div className={classes.row}>
                                                <div className={classes.nameField}>{element._id}:&nbsp;</div>
                                                <div className={classes.value}>{element.count}</div>
                                            </div>
                                            {
                                                (idx!==data.analysisForms.editor.length-1)?
                                                    <Divider/>
                                                    :
                                                    null
                                            }
                                        </div>
                                    )
                                }
                            </div>
                            <br/>
                            <div className={classes.question}>
                                <h3>
                                    Ответы
                                </h3>
                                <br/>
                                <Divider/>
                                {
                                    data.analysisForms.questions.map((element, idx) =>
                                        <div style={{width: '100%', marginTop: 10}}  key={`${element._id}${idx}`}>
                                            <div className={classes.row}>
                                                <div className={classes.nameField}>{element._id}:&nbsp;</div>
                                                <div>
                                                    {
                                                        element.answers.map((element1, idx1) =>
                                                            <div className={classes.value} key={`${element1._id}${idx1}`}>
                                                                {`${element1._id}: ${element1.count}`}
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            {
                                                (idx!==data.analysisForms.questions.length-1)?
                                                    <Divider/>
                                                    :
                                                    null
                                            }
                                        </div>
                                    )
                                }
                            </div>
                            </>
                            :
                            'Ничего не найдено'
                        :
                        'Ничего не найдено'
                }
                </CardContent>
                </Card>
        </App>
    )
})

AnalysisForms.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['суперорганизация', 'организация', 'admin'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            ...await getAnalysisForms({templateForm: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
            ...await getTemplateForm({_id: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined)
        }
    };
};

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app
    }
}

export default connect(mapStateToProps)(AnalysisForms);
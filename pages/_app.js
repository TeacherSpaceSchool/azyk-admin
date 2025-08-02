import React from 'react';
import App  from 'next/app';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../src/theme';
import withRedux from 'next-redux-wrapper';
import configureStore from '../redux/configureStore'
import { Provider } from 'react-redux';
import { SingletonApolloClient } from '../src/singleton/client'
import { SingletonStore } from '../src/singleton/store'
import { register, checkDisableSubscribe } from '../src/subscribe'
import { getClientGqlSsr } from '../src/getClientGQL'
import { ApolloProvider } from '@apollo/react-hooks';

export default withRedux(configureStore, { debug: false })(
    class MyApp extends App {
        static async getInitialProps({ Component, ctx }) {
            const pageProps = Component.getInitialProps
                ? await Component.getInitialProps(ctx)
                : {};
            return { pageProps, ...ctx.req?{req: {ctx: {headers: {cookie: ctx.req.headers.cookie}}}}:{}};
        }
        static componentDidMount() {
            // Remove the server-side injected CSS.
            const jssStyles = document.querySelector('#jss-server-side');
            if(jssStyles) {
                jssStyles.parentNode.removeChild(jssStyles);
            }
        }

        render() {
            const {Component, pageProps, store, req} = this.props;
            new SingletonStore(store)
            if(process.browser) {
                checkDisableSubscribe()
                register(true)
            }
            let client = process.browser?new SingletonApolloClient().getClient():getClientGqlSsr(req)

            return (
                <React.Fragment>
                    <ApolloProvider client={client}>
                        <ThemeProvider theme={theme}>
                            <CssBaseline />
                            <Provider store={store}>
                                    <Component {...pageProps} />
                            </Provider>
                        </ThemeProvider>
                    </ApolloProvider>
                </React.Fragment>
            );
        }
    }
)

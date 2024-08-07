import Head from 'next/head';
import React from 'react';
import App from '../../layouts/App';
import pageListStyle from '../../src/styleMUI/blog/blogList'
import { connect } from 'react-redux'
import LazyLoad from 'react-lazyload';
import initialApp from '../../src/initialApp'
import { urlMain } from '../../redux/constants/other'

const IOS = React.memo(() => {
    const classes = pageListStyle();
    return (
        <App pageName='Как установить?'>
            <Head>
                <title>Как установить?</title>
                <meta name='description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:title' content='Как установить?' />
                <meta property='og:description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:type' content='website' />
                <meta property='og:image' content={`${urlMain}/static/512x512.png`} />
                <meta property='og:url' content={`${urlMain}/howtoinstall/ios`} />
                <link rel='canonical' href={`${urlMain}/howtoinstall/ios`}/>
            </Head>
            <div className={classes.page}>
                <div>
                    <div
                        style={{
                            width: '100%',
                            marginBottom: 5,
                            display: 'flex',
                            justifyContent: 'center',
                            fontSize: 20,
                            fontWeight: 'bold'
                        }}
                    >
                        1
                    </div>
                    <img
                        style={{
                            width: 'calc(100% - 20px)',
                            marginLeft: 10,
                            border: '1px solid #8080805e'
                        }}
                        src={`${urlMain}/static/howtoinstall/IOS1.PNG`}
                    />
                    <div
                        style={{
                            width: '100%',
                            marginTop: 5,
                            marginBottom: 5,
                            display: 'flex',
                            justifyContent: 'center',
                            fontSize: 20,
                            fontWeight: 'bold'
                        }}
                    >
                        2
                    </div>
                    <img
                        style={{
                            width: 'calc(100% - 20px)',
                            marginLeft: 10,
                            border: '1px solid #8080805e'
                        }}
                        src={`${urlMain}/static/howtoinstall/IOS2.PNG`}
                    />
                    <div
                        style={{
                            width: '100%',
                            marginTop: 5,
                            marginBottom: 5,
                            display: 'flex',
                            justifyContent: 'center',
                            fontSize: 20,
                            fontWeight: 'bold'
                        }}
                    >
                        3
                    </div>
                    <img
                        style={{
                            width: 'calc(100% - 20px)',
                            marginLeft: 10,
                            marginBottom: 20,
                            border: '1px solid #8080805e'
                        }}
                        src={`${urlMain}/static/howtoinstall/IOS3.PNG`}
                    />
                </div>


            </div>
        </App>
    )
})

IOS.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    return {};
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(IOS);
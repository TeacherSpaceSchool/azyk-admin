import Router from 'next/router'
import Head from "next/head";
import React from "react";

const Landing = () => {
    return (
        <div>
            <Head>
                <title>Бренды</title>
                <meta name='robots' content='index, follow'/>
            </Head>
            Landing
        </div>
    )
}

Landing.getInitialProps = async function(ctx) {
    if(ctx.res) {
        ctx.res.writeHead(302, {
            Location: '/landing.html'
        })
        ctx.res.end()
    } else
        Router.push('/landing.html')
};

export default Landing;
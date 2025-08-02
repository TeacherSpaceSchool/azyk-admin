const withSass = require('@zeit/next-sass')
const withCSS = require('@zeit/next-css')
const withOffline = require('next-offline')
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports =
        withCSS(
            withSass(
                withOffline({
                    workboxOpts: {
                        importScripts: ['/sw-push-listener.js'],
                        runtimeCaching: [
                            {
                                urlPattern: /^http?.*\/images\/.*/,
                                handler: 'NetworkOnly',
                            },
                            /*{
                                urlPattern: /^https?.*\.!(png|gif|jpg|jpeg|svg)/,
                                handler: 'NetworkFirst',
                                options: {
                                    cacheName: 'cache',
                                    expiration: {
                                        maxAgeSeconds: 5*24*60*60
                                    }
                                },
                            },*/
                            {
                                urlPattern: /^https?.*/,
                                handler: 'NetworkFirst',
                                options: {
                                    cacheName: 'cache',
                                    expiration: {
                                        maxAgeSeconds: 5*24*60*60
                                    }
                                },
                            }
                        ]
                    },
                    ...(process.env.URL==='azyk.store'?{
                        onDemandEntries : {
                            maxInactiveAge :  1000*60*60*24*10,
                            pagesBufferLength: 2,
                        }
                    }:{}),
                    env: {
                        URL: process.env.URL
                    },
                    webpack: (config) => {
                        const originalEntry = config.entry;
                        config.entry = async () => {
                            const entries = await originalEntry();
                            if(entries['main.js']) {
                                entries['main.js'].unshift('./src/polyfills.js');
                            }
                            return entries;
                        };
                        config.plugins.push(new CopyWebpackPlugin(['./public/sw-push-listener.js']));
                        return config
                    }
                })
            )
        )

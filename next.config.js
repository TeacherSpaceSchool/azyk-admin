const withSass = require('@zeit/next-sass')
const withCSS = require('@zeit/next-css')
const withOffline = require('next-offline')
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports =
        withCSS(
            withSass(
                withOffline({
                    dontAutoRegister: false,
                    generateInDevMode: false,
                    // Workbox настройки
                    workboxOpts: {
                        skipWaiting: true,
                        clientsClaim: true,
                        importScripts: ['/sw-push-listener.js'],
                        // Очень важно — НИЧЕГО кроме изображений больше не кэшируем
                        exclude: [
                            /\/_next\/static\/.*/,   // Next.js JS бандлы
                            /\/_next\/data\/.*/,     // Data JSON
                            /\.js$/,                 // Скрипты
                            /\.json$/,               // JSON
                            /graphql/                // GraphQL POST
                        ],
                        runtimeCaching: [
                            // Кэшируем только картинки
                            {
                                urlPattern: /\.(?:png|jpg|jpeg|gif|svg|ico)$/,
                                handler: 'CacheFirst',
                                options: {
                                    cacheName: 'static-images',
                                    expiration: {
                                        maxEntries: 200,
                                        maxAgeSeconds: 30 * 24 * 60 * 60
                                    }
                                }
                            },
                            // Все остальное — всегда только сеть
                            {
                                urlPattern: /^https?.*/,
                                handler: 'NetworkOnly'
                            }
                        ]
                    },
                    ...(process.env.URL==='azyk.store'?{
                        onDemandEntries : {
                            maxInactiveAge :  1000*60*60*24*10,
                            pagesBufferLength: 2
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

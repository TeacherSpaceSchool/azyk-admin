/* eslint-disable no-extra-boolean-cast */
import { urlGQLSSR } from '../redux/constants/other';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import fetch from 'node-fetch';
import { getJWT } from './lib'
import { setContext } from 'apollo-link-context';
import { ApolloLink  } from 'apollo-link';
import { createUploadLink } from 'apollo-upload-client'
//import { urlGQL, urlGQLws } from '../redux/constants/other';

export const getClientGqlSsr = (req) => {
    if(req) {
        const uploadLink = createUploadLink({
            uri: urlGQLSSR,
            fetch: fetch,
            credentials: 'include'
        });
        const authLink = setContext((_, {headers}) => {
            let jwt = getJWT(req.headers.cookie)
            return {
                headers: {
                    ...headers,
                    authorization: jwt ? `Bearer ${jwt}` : '',
                }
            }
        });
        const link = ApolloLink.from([
            authLink,
            uploadLink
        ]);
        return new ApolloClient({
            ssrMode: true,
            link: link,
            cache: new InMemoryCache(),
            defaultOptions: {
                watchQuery: {
                    fetchPolicy: 'cache-and-network',
                    errorPolicy: 'ignore',
                },
                query: {
                    fetchPolicy: 'network-only',
                    errorPolicy: 'all',
                },
                mutate: {
                    errorPolicy: 'all',
                },
            },

        })
    }
    else return null
}
/*
export const getClientGqlWs = () => {
    if(document&&document.cookie) {
        let jwt = getJWT(document.cookie)
        const wsLink = new WebSocketLink({
            uri: urlGQLws,
            options: {
                reconnect: true,
                connectionParams: {
                    authorization: this.jwt ? `Bearer ${this.jwt}` : ''
                }
            },
            webSocketImpl: WebSocket
        });
    }

    const uploadLink = createUploadLink({
        uri: urlGQL,
        fetch: fetch,
        credentials: 'include'
    });
    const authLink = setContext((_, { headers }) => {
        return {
            headers: {
                ...headers,
                authorization: getJWT(req.headers.cookie) ? `Bearer ${getJWT(req.headers.cookie)}` : '',
            }
        }
    });
    const link = ApolloLink.from([
        authLink,
        uploadLink
    ]);
    return new ApolloClient({
        ssrMode: true,
        link: link,
        cache: new InMemoryCache(),
        defaultOptions: {
            watchQuery: {
                fetchPolicy: 'cache-and-network',
                errorPolicy: 'ignore',
            },
            query: {
                fetchPolicy: 'network-only',
                errorPolicy: 'all',
            },
            mutate: {
                errorPolicy: 'all',
            },
        },

    })
}*/
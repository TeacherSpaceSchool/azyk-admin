/* eslint-disable no-extra-boolean-cast */
import { urlGQL, urlGQLws } from '../../redux/constants/other';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import fetch from 'node-fetch';
import { getJWT } from '../lib'
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { ApolloLink, split  } from 'apollo-link';
import { createUploadLink } from 'apollo-upload-client'
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import * as ws from 'ws';
import { SingletonStore } from '../singleton/store';
import {
    showSnackBar
} from '../../redux/actions/snackbar'

export class SingletonApolloClient {
    constructor(req) {
        if (!!SingletonApolloClient.instance) {
            return SingletonApolloClient.instance;
        }
        SingletonApolloClient.instance = this;
        this.jwt = getJWT(req?req.headers.cookie:document&&document.cookie?document.cookie:'')
        const uploadLink = createUploadLink({
            uri: urlGQL,
            fetch: fetch,
            credentials: 'include'
        });
        const authLink = setContext((_, { headers }) => {
            return {
                headers: {
                    ...headers,
                    authorization: this.jwt ? `Bearer ${this.jwt}` : '',
                }
            }
        });
        const linkError = onError((ctx) => {
            if (ctx.graphQLErrors)
                ctx.graphQLErrors.map(({ message, locations, path }) =>{
                    let snackBarMsg = 'Ошибка'
                    if(message&&message.includes('Error, expected `login` to be unique')) {
                        snackBarMsg = 'Логин уже используется'
                    }
                    new SingletonStore().getStore().dispatch(showSnackBar(snackBarMsg))
                    console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
                });
            if (ctx.networkError) console.log(`[Network error]: ${ctx.networkError}`);
        });
        let mainLink;
        if(this.jwt) {
            const wsLink = new WebSocketLink({
                uri: urlGQLws,
                options: {
                    reconnect: true,
                    connectionParams: {
                        authorization: this.jwt ? `Bearer ${this.jwt}` : ''
                    }
                },
                webSocketImpl: process.browser ? WebSocket : ws
            });
            mainLink = split(
                ({query}) => {
                    const definition = getMainDefinition(query);
                    return (
                        definition.kind === 'OperationDefinition' &&
                        definition.operation === 'subscription'
                    );
                },
                wsLink,
                uploadLink,
            );
        }
        else
            mainLink = uploadLink
        const link = ApolloLink.from([
            linkError,
            authLink,
            mainLink
        ]);
        this.client = new ApolloClient({
            link: link,
            cache: new InMemoryCache(),
            defaultOptions: {
                watchQuery: {
                    fetchPolicy: 'no-cache',
                    errorPolicy: 'ignore',
                },
                query: {
                    fetchPolicy: 'no-cache',
                    errorPolicy: 'all',
                },
                mutate: {
                    errorPolicy: 'all',
                },
            },

        });
        return this;
    }

    getClient() {
        return this.client;
    }
}
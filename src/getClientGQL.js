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
                    fetchPolicy: 'no-cache',
                    errorPolicy: 'ignore',
                },
                query: {
                    fetchPolicy: 'no-cache',
                    errorPolicy: 'all',
                },
                mutate: {
                    fetchPolicy: 'no-cache',
                    errorPolicy: 'all',
                },
            },

        })
    }
    else return null
}
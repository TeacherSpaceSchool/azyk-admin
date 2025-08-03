import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getErrors = async (client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                query: gql`
                    query {
                        errors {
                            _id
                            createdAt
                            err
                            path
                          }
                    }`,
            })
        return res.data.errors
    } catch(err) {
        console.error(err)
    }
}

export const clearAllErrors = async () => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            mutation : gql`
                    mutation {
                        clearAllErrors
                    }`})
        return res.data.clearAllErrors
    } catch(err) {
        console.error(err)
    }
}

export const getErrorsStatistic = async (client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                query: gql`
                    query {
                        errorsStatistic {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data.errorsStatistic
    } catch(err) {
        console.error(err)
    }
}

let lastError, lastPath;
export const addError = async ({err, path}, client) => {
    if(lastError!==err&&lastPath!==path) {
        lastError = err
        lastPath = path
        try {
            client = client? client : new SingletonApolloClient().getClient()
            const res = await client.mutate({
                variables: {err, path},
                mutation: gql`
                    mutation ($err: String!, $path: String!) {
                        addError(err: $err, path: $path)
                    }`
            })
            return res.data.addError
        } catch (err) {
            console.error(err)
        }
    }
}
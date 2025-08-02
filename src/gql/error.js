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
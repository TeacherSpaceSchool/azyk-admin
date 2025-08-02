import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const File = `
    name
    url
    size
    createdAt
    active
    owner
`

export const getFiles = async (client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                query: gql`
                    query {
                        files {${File}}
                    }`,
            })
        return res.data.files
    } catch(err) {
        console.error(err)
    }
}

export const clearAllDeactiveFiles = async () => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            mutation : gql`
                    mutation {
                        clearAllDeactiveFiles
                    }`})
        return res.data.clearAllDeactiveFiles
    } catch(err) {
        console.error(err)
    }
}

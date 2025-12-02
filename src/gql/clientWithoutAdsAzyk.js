import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getClientsWithoutAds = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID) {
                        clientsWithoutAds(organization: $organization)
                    }`,
            })
        return res.data.clientsWithoutAds
    } catch(err) {
        console.error(err)
    }
}

export const setClientWithoutAds = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($client: ID!, $organization: ID!) {
                        setClientWithoutAds(client: $client, organization: $organization)
                    }`})
        return res.data.setClientWithoutAds
    } catch(err) {
        console.error(err)
    }
}
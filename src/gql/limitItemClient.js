import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const LimitItemClient = `
    _id
    createdAt
    client {_id name address}
    limit
    organization {_id name}
    item {_id name}
`

export const getLimitItemClients = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($client: ID!, $organization: ID) {
                        limitItemClients(client: $client, organization: $organization) {${LimitItemClient}}
                    }`,
            })
        return res.data.limitItemClients
    } catch(err) {
        console.error(err)
    }
}

export const getItemsForLimitItemClients = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($client: ID!, $organization: ID) {
                        itemsForLimitItemClients(client: $client, organization: $organization) {
                            _id
                            name
                          }
                    }`,
            })
        return res.data.itemsForLimitItemClients
    } catch(err) {
        console.error(err)
    }
}

export const deleteLimitItemClient = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteLimitItemClient(_id: $_id)
                    }`})
        return res.data.deleteLimitItemClient
    } catch(err) {
        console.error(err)
    }
}

export const addLimitItemClient = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($client: ID!, $organization: ID!, $limit: Int!, $item: ID!) {
                        addLimitItemClient(client: $client, organization: $organization, limit: $limit, item: $item) {${LimitItemClient}}
                    }`})
        return res.data.addLimitItemClient
    } catch(err) {
        console.error(err)
    }
}

export const setLimitItemClient = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $limit: Int!) {
                        setLimitItemClient(_id: $_id, limit: $limit)
                    }`})
        return res.data.setLimitItemClient
    } catch(err) {
        console.error(err)
    }
}
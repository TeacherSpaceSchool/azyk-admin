import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const ClientNetwork = `
    _id
    createdAt
    name
`

export const getClientNetworks = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!) {
                        clientNetworks(search: $search) {${ClientNetwork}}
                    }`,
            })
        return res.data.clientNetworks
    } catch(err) {
        console.error(err)
    }
}

export const addClientNetwork = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($name: String!) {
                        addClientNetwork(name: $name) {${ClientNetwork}}
                    }`})
        return res.data.addClientNetwork
    } catch(err) {
        console.error(err)
    }
}

export const setClientNetwork = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $name: String!) {
                        setClientNetwork(_id: $_id, name: $name)
                    }`})
        return res.data.setClientNetwork
    } catch(err) {
        console.error(err)
    }
}

export const deleteClientNetwork = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteClientNetwork(_id: $_id)
                    }`})
    } catch(err) {
        console.error(err)
    }
}
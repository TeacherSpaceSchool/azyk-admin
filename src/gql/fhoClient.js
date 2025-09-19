import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const FhoClient = `
    _id
    createdAt
    organization {_id name}
    client {_id name address}
    images
    history {date editor}
    required
`

export const getFhoClients = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $client: ID, $search: String!, $filter: String!, $skip: Int) {
                        fhoClients(organization: $organization, client: $client, search: $search, filter: $filter, skip: $skip) {${FhoClient}}
                    }`,
            })
        return res.data.fhoClients
    } catch(err) {
        console.error(err)
    }
}

export const getFhoClient = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($_id: ID!, $organization: ID) {
                        fhoClient(_id: $_id, organization: $organization) {${FhoClient}}
                    }`,
            })
        return res.data.fhoClient
    } catch(err) {
        console.error(err)
    }
}

export const getClientsFhoClients = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $organization: ID!, $district: ID) {
                        clientsForFhoClient(search: $search, organization: $organization, district: $district) {
                            _id
                            createdAt
                            name
                            address
                          }
                    }`,
            })
        return res.data.clientsForFhoClient
    }
    catch(err) {
        console.error(err)
    }
}

export const addFhoClient = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($organization: ID!, $client: ID!) {
                        addFhoClient(organization: $organization, client: $client)
                    }`})
        return res.data.addFhoClient
    } catch(err) {
        console.error(err)
    }
}

export const setFhoClient = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $deletedImages: [Upload]!, $uploads: [Upload]!) {
                        setFhoClient(_id: $_id, deletedImages: $deletedImages, uploads: $uploads)
                    }`})
        return res.data.setFhoClient
    } catch(err) {
        console.error(err)
    }
}

export const deleteFhoClient = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteFhoClient(_id: $_id)
                    }`})
        return res.data.deleteFhoClient
    } catch(err) {
        console.error(err)
    }
}

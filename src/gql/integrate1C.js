import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const Integrate = `
    _id
    createdAt
    guid
    forwarder {_id name}
    organization {_id name}
    client {_id name city}
    agent {_id name}
    item {_id name city}
`

export const getIntegrate1Cs = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $organization: ID!, $filter: String!, $skip: Int) {
                        integrate1Cs(search: $search, organization: $organization, filter: $filter, skip: $skip) {${Integrate}}
                    }`,
            })
        return res.data.integrate1Cs
    } catch(err) {
        console.error(err)
    }
}

export const getIntegrate1CsSimpleStatistic = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $organization: ID!, $filter: String!) {
                        integrate1CsSimpleStatistic(search: $search, organization: $organization, filter: $filter)
                    }`,
            })
        return res.data.integrate1CsSimpleStatistic
    } catch(err) {
        console.error(err)
    }
}

export const getForwardersIntegrate1C = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $organization: ID!) {
                        forwardersIntegrate1C(search: $search, organization: $organization) {
                            _id 
                            name
                        }
                    }`,
            })
        return res.data.forwardersIntegrate1C
    } catch(err) {
        console.error(err)
    }
}

export const downloadIntegrate1C = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .mutate({
                variables,
                mutation: gql`
                    mutation ($document: Upload!, $organization: ID!) {
                        downloadIntegrate1C(document: $document, organization: $organization)
                    }`,
            })
        return res.data.downloadIntegrate1C
    } catch(err) {
        console.error(err)
    }
}

export const getAgentsIntegrate1C = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $organization: ID!) {
                        agentsIntegrate1C(search: $search, organization: $organization) {
                            _id 
                            name
                        }
                    }`,
            })
        return res.data.agentsIntegrate1C
    } catch(err) {
        console.error(err)
    }
}

export const getItemsIntegrate1C = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $organization: ID!) {
                        itemsIntegrate1C(search: $search, organization: $organization) {
                            _id 
                            name
                            city
                        }
                    }`,
            })
        return res.data.itemsIntegrate1C
    } catch(err) {
        console.error(err)
    }
}

export const getClientsIntegrate1C = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $organization: ID!) {
                        clientsIntegrate1C(search: $search, organization: $organization) {
                            _id 
                            name
                            city
                        }
                    }`,
            })
        return res.data.clientsIntegrate1C
    } catch(err) {
        console.error(err)
    }
}

export const deleteIntegrate1C = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteIntegrate1C(_id: $_id)
                    }`})
        return res.data.deleteIntegrate1C
    } catch(err) {
        console.error(err)
    }
}

export const addIntegrate1C = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($organization: ID!, $item: ID, $client: ID, $guid: String, $agent: ID, $forwarder: ID) {
                        addIntegrate1C(organization: $organization, item: $item, client: $client, guid: $guid, agent: $agent, forwarder: $forwarder) {${Integrate}}
                    }`})
        return res.data.addIntegrate1C
    } catch(err) {
        console.error(err)
    }
}

export const setIntegrate1C = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $guid: String) {
                        setIntegrate1C(_id: $_id, guid: $guid)
                    }`})
        return res.data.setIntegrate1C
    } catch(err) {
        console.error(err)
    }
}
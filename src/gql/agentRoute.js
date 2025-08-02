import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const AgentRoute = `
    _id
    createdAt
    organization {_id name}
    district {_id name client {_id image createdAt name address lastActive category device notification city phone user {status}}}
    clients
`

export const getAgentRoutes = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID, $search: String!) {
                        agentRoutes(organization: $organization, search: $search) {${AgentRoute}}
                    }`,
            })
        return res.data.agentRoutes
    } catch(err) {
        console.error(err)
    }
}

export const getDistrictsWithoutAgentRoutes = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID) {
                        districtsWithoutAgentRoutes(organization: $organization) {
                            _id name client {_id image createdAt name address lastActive category device notification city phone user {status}}
                        }
                    }`,
            })
        return res.data.districtsWithoutAgentRoutes
    } catch(err) {
        console.error(err)
    }
}

export const getAgentRoute = async (_id, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {_id},
                query: gql`
                    query ($_id: ID!) {
                        agentRoute(_id: $_id) {${AgentRoute}}
                    }`,
            })
        return res.data.agentRoute
    } catch(err) {
        console.error(err)
    }
}

export const addAgentRoute = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($organization: ID, $clients: [[ID]]!, $district: ID) {
                        addAgentRoute(organization: $organization, clients: $clients, district: $district)
                    }`})
        return res.data.addAgentRoute
    } catch(err) {
        console.error(err)
    }
}

export const setAgentRoute = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $clients: [[ID]]) {
                        setAgentRoute(_id: $_id, clients: $clients)
                    }`})
        return res.data.setAgentRoute
    } catch(err) {
        console.error(err)
    }
}

export const deleteAgentRoute = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteAgentRoute(_id: $_id)
                    }`})
        return res.data.deleteAgentRoute
    } catch(err) {
        console.error(err)
    }
}
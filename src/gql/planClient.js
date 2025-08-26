import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const PlanClient = `
    _id
    createdAt
    client {_id name address}
    current
    month
    visit
`

export const getUnloadPlanClients = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $city: String, $district: ID) {
                        unloadPlanClients(organization: $organization, city: $city, district: $district)
                    }`,
            })
        return res.data.unloadPlanClients
    }
    catch(err) {
        console.error(err)
    }
}

export const getClientsForPlanClients = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $organization: ID!, $district: ID) {
                        clientsForPlanClients(search: $search, organization: $organization, district: $district) {
                            _id
                            createdAt
                            name
                            address
                          }
                    }`,
            })
        return res.data.clientsForPlanClients
    }
    catch(err) {
        console.error(err)
    }
}

export const getPlanClients = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $city: String, $organization: ID!, $district: ID, $skip: Int!) {
                        planClients (search: $search, city: $city, organization: $organization, district: $district, skip: $skip) {${PlanClient}}
                    }`,
            })
        return res.data.planClients
    } catch(err) {
        console.error(err)
    }
}

export const getPlanClientsCount = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $city: String, $organization: ID!, $district: ID) {
                        planClientsCount (search: $search, city: $city, organization: $organization, district: $district)
                    }`,
            })
        return res.data.planClientsCount
    } catch(err) {
        console.error(err)
    }
}

export const getPlanClient = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($client: ID!, $organization: ID!) {
                        planClient(client: $client, organization: $organization) {${PlanClient}}
                    }`,
            })
        return res.data.planClient
    } catch(err) {
        console.error(err)
    }
}

export const setPlanClient = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($client: ID!, $organization: ID!, $month: Int!, $visit: Int!) {
                        setPlanClient(client: $client, organization: $organization, month: $month, visit: $visit)
                    }`})
        return res.data.setPlanClient
    } catch(err) {
        console.error(err)
    }
}

export const deletePlanClient = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!) {
                        deletePlanClient(_id: $_id)
                    }`})
        return res.data.deletePlanClient
    } catch(err) {
        console.error(err)
    }
}

export const uploadPlanClients = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($document: Upload!, $organization: ID!) {
                        uploadPlanClients(document: $document, organization: $organization)
                    }`})
        return res.data.uploadPlanClients
    } catch(err) {
        console.error(err)
    }
}
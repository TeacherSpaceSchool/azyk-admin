import {SingletonApolloClient} from '../singleton/client';
import {gql} from 'apollo-boost';

export const downloadAdsOrders = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $dateStart: Date!) {
                        downloadAdsOrders(organization: $organization, dateStart: $dateStart)
                    }`,
            })
        return res.data.downloadAdsOrders
    } catch(err) {
        console.error(err)
    }
}

export const downloadEmployments = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!) {
                        downloadEmployments(organization: $organization)
                    }`,
            })
        return res.data.downloadEmployments
    } catch(err) {
        console.error(err)
    }
}

export const downloadDistricts = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!) {
                        downloadDistricts(organization: $organization)
                    }`,
            })
        return res.data.downloadDistricts
    } catch(err) {
        console.error(err)
    }
}

export const downloadAgentRoutes = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!) {
                        downloadAgentRoutes(organization: $organization)
                    }`,
            })
        return res.data.downloadAgentRoutes
    } catch(err) {
        console.error(err)
    }
}

export const downloadClients = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!) {
                        downloadClients(organization: $organization)
                    }`,
            })
        return res.data.downloadClients
    } catch(err) {
        console.error(err)
    }
}

export const downloadOrders = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $dateStart: Date!, $filter: String!) {
                        downloadOrders(organization: $organization, dateStart: $dateStart, filter: $filter)
                    }`,
            })
        return res.data.downloadOrders
    } catch(err) {
        console.error(err)
    }
}

export const downloadInvoices = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $dateStart: Date!, $all: Boolean) {
                        downloadInvoices(organization: $organization, dateStart: $dateStart, all: $all)
                    }`,
            })
        return res.data.downloadInvoices
    } catch(err) {
        console.error(err)
    }
}

export const uploadAgentRoute = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .mutate({
                variables,
                mutation: gql`
                    mutation ($document: Upload!, $agentRoute: ID!) {
                        uploadAgentRoute(document: $document, agentRoute: $agentRoute)
                    }`,
            })
        return res.data.uploadAgentRoute
    } catch(err) {
        console.error(err)
    }
}

export const uploadClients = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .mutate({
                variables,
                mutation: gql`
                    mutation ($document: Upload!, $organization: ID!, $city: String!) {
                        uploadClients(document: $document, organization: $organization, city: $city)
                    }`,
            })
        return res.data.uploadClients
    } catch(err) {
        console.error(err)
    }
}

export const uploadItems = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .mutate({
                variables,
                mutation: gql`
                    mutation ($document: Upload!, $organization: ID!, $city: String!) {
                        uploadItems(document: $document, organization: $organization, city: $city)
                    }`,
            })
        return res.data.uploadItems
    } catch(err) {
        console.error(err)
    }
}

export const uploadDistricts = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .mutate({
                variables,
                mutation: gql`
                    mutation ($document: Upload!, $organization: ID!) {
                        uploadDistricts(document: $document, organization: $organization)
                    }`,
            })
        return res.data.uploadDistricts
    } catch(err) {
        console.error(err)
    }
}
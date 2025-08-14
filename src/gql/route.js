import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const Delivery = `
        legs
        lengthInMeters
        orders{
            _id
            agent 
                {_id name}
            createdAt
            updatedAt
            allTonnage
            client 
                { 
                    _id
                    name
                    email
                    phone
                    user 
                        {_id }
                }
            allPrice
            returnedPrice
            info
            address
            paymentMethod
            discount
            adss
                { 
                    _id
                    title
                }
            editor
            number
            confirmationForwarder
            confirmationClient
            cancelClient
            district
            track
            forwarder
                {_id name}
            organization
                {_id name}
            cancelForwarder
            taken
            sync
            dateDelivery
        }
        tonnage
`

const Route = `
    _id
    createdAt
    deliverys {${Delivery}}
    provider {_id name}
    selectProdusers {_id name}
    selectDistricts {_id name}
    selectEcspeditor {_id name}
    selectAuto {_id number}
    selectedOrders {
            _id
            agent 
                {_id name}
            createdAt
            updatedAt
            allTonnage
            client 
                { 
                    _id
                    name
                    email
                    phone
                    user 
                        {_id }
                }
            allPrice
            returnedPrice
            info
            address
            paymentMethod
            discount
            adss
                { 
                    _id
                    title
                }
            editor
            number
            confirmationForwarder
            confirmationClient
            cancelClient
            district
            track
            forwarder
                {_id name}
            organization
                {_id name}
            cancelForwarder
            taken
            sync
            dateDelivery
        }
    dateDelivery
    status
    number
    allTonnage
`

export const getRoutes = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID, $search: String!, $sort: String!, $filter: String!, $date: String!, $skip: Int) {
                        routes(organization: $organization, search: $search, sort: $sort, filter: $filter, date: $date, skip: $skip) {${Route}}
                    }`,
            })
        return res.data.routes
    } catch(err) {
        console.error(err)
    }
}

export const getRoute = async (_id, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {_id},
                query: gql`
                    query ($_id: ID!) {
                        route(_id: $_id) {${Route}}
                    }`,
            })
        return res.data.route
    } catch(err) {
        console.error(err)
    }
}

export const listDownload = async (orders, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {orders},
                query: gql`
                    query ($orders: [ID]!) {
                        listDownload(orders: $orders) 
                    }`,
            })
        return res.data.listDownload
    } catch(err) {
        console.error(err)
    }
}

export const listUnload = async (orders, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {orders},
                query: gql`
                    query ($orders: [ID]!) {
                        listUnload(orders: $orders) 
                    }`,
            })
        return res.data.listUnload
    } catch(err) {
        console.error(err)
    }
}

export const getUnloadingInvoicesFromRouting = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $orders: [ID]!) {
                        unloadingInvoicesFromRouting(organization: $organization, orders: $orders)
                    }`,
            })
        return res.data.unloadingInvoicesFromRouting
    } catch(err) {
        console.error(err)
    }
}

export const buildRoute = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($autoTonnage: Int!, $orders: [ID]!, $provider: ID!, $length: Int) {
                        buildRoute(autoTonnage: $autoTonnage, orders: $orders, provider: $provider, length: $length) {${Delivery}}
                    }`})
        return res.data.buildRoute
    } catch(err) {
        console.error(err)
    }
}

export const deleteRoute = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $selectedOrders: [ID]!) {
                        deleteRoute(_id: $_id, selectedOrders: $selectedOrders)
                    }`})
        return res.data.deleteRoute
    } catch(err) {
        console.error(err)
    }
}

export const addRoute = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($deliverys: [DeliveryInput]!, $provider: ID!, $selectProdusers: [ID]!, $selectDistricts: [ID]!, $selectEcspeditor: ID!, $selectAuto: ID!, $selectedOrders: [ID]!, $dateDelivery: Date!, $allTonnage: Int!) {
                        addRoute(deliverys: $deliverys, provider: $provider, selectProdusers: $selectProdusers, selectDistricts: $selectDistricts, selectEcspeditor: $selectEcspeditor, selectAuto: $selectAuto, selectedOrders: $selectedOrders, dateDelivery: $dateDelivery, allTonnage: $allTonnage)
                    }`})
        return res.data.addRoute
    } catch(err) {
        console.error(err)
    }
}

export const setRoute = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($route: ID!, $deletedOrders: [ID]!) {
                        setRoute(route: $route, deletedOrders: $deletedOrders)
                    }`})
        return res.data.setRoute
    } catch(err) {
        console.error(err)
    }
}
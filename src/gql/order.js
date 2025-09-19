import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const Order = `
    _id
    createdAt
    updatedAt
    allTonnage
    item {_id image name apiece unit priotiry packaging weight price}
    count
    allPrice
    returned
    status
`

const Invoice = `
    _id
    createdAt
    updatedAt
    agent {_id name}
    allTonnage
    city
    orders {${Order}}
    client { _id name email phone user {_id}}
    allPrice
    returnedPrice
    info
    address
    paymentMethod
    discount
    adss {_id title}
    editor
    number
    confirmationForwarder
    cancelClient
    district
    track
    forwarder {_id name}
    organization {_id name refusal minimumOrder}
    cancelForwarder
    confirmationClient
    taken
    sync
    inv
    dateDelivery
`

export const getOrders = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $sort: String!, $filter: String!, $date: String!, $skip: Int, $organization: ID, $city: String, $agent: ID, $district: ID) {
                        invoices(search: $search, sort: $sort, filter: $filter, date: $date, skip: $skip, organization: $organization, city: $city, agent: $agent, district: $district) {${Invoice}}
                    }`,
            })
        return res.data.invoices
    } catch(err) {
        console.error(err)
    }
}

export const getOrdersFromDistrict = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $district: ID!, $date: String!) {
                        invoicesFromDistrict(organization: $organization, district: $district, date: $date) {${Invoice}}
                    }`,
            })
        return res.data.invoicesFromDistrict
    } catch(err) {
        console.error(err)
    }
}

export const getInvoicesSimpleStatistic = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $filter: String!, $date: String!, $organization: ID, $city: String, $agent: ID, $district: ID) {
                        invoicesSimpleStatistic(search: $search, filter: $filter, date: $date, organization: $organization, city: $city, agent: $agent, district: $district) 
                    }`,
            })
        return res.data.invoicesSimpleStatistic
    } catch(err) {
        console.error(err)
    }
}

export const getOrderHistorys = async (invoice, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {invoice},
                query: gql`
                    query ($invoice: ID!) {
                        orderHistorys(invoice: $invoice) {
                            createdAt
                            editor
                            status
                            orders {item count returned}
                        }
                    }`,
            })
        return res.data.orderHistorys
    } catch(err) {
        console.error(err)
    }
}

export const getOrdersForRouting = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient();
        const res = await client
            .query({
                variables,
                query: gql`
                    query($produsers: [ID]!, $clients: [ID]!, $dateDelivery: Date, $dateStart: Date, $dateEnd: Date) {
                        invoicesForRouting(produsers: $produsers, clients: $clients, dateDelivery: $dateDelivery, dateStart: $dateStart, dateEnd: $dateEnd) {${Invoice}}
                    }`,
            })
        return res.data.invoicesForRouting
    } catch(err) {
        console.error(err)
    }
}

export const getOrder = async (_id, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {_id},
                query: gql`
                    query ($_id: ID!) {
                        invoice(_id: $_id) {${Invoice}}
                    }`,
            })
        return res.data.invoice
    } catch(err) {
        console.error(err)
    }
}

export const addOrders = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($dateDelivery: Date!, $info: String, $inv: Boolean, $unite: Boolean, $paymentMethod: String, $organization: ID!, $client: ID!) {
                        addOrders(dateDelivery: $dateDelivery, inv: $inv, unite: $unite, info: $info, paymentMethod: $paymentMethod, organization: $organization, client: $client)
                    }`})
        return res.data.addOrders
    } catch(err) {
        console.error(err)
    }
}
export const acceptOrders = async () => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            mutation : gql`
                    mutation {
                        acceptOrders
                    }`})
        return res.data.acceptOrders
    } catch(err) {
        console.error(err)
    }
}


export const deleteOrders = async (ids) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {ids},
            mutation : gql`
                    mutation ($ids: [ID]!) {
                        deleteOrders(ids: $ids)
                    }`})
        return res.data.deleteOrders
    } catch(err) {
        console.error(err)
    }
}

export const setInvoicesLogic = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($track: Int, $forwarder: ID, $invoices: [ID]!) {
                        setInvoicesLogic(track: $track, forwarder: $forwarder, invoices: $invoices)
                    }`})
        return res.data.setInvoicesLogic
    } catch(err) {
        console.error(err)
    }
}

export const setInvoice = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($adss: [ID], $taken: Boolean, $invoice: ID!, $confirmationClient: Boolean, $confirmationForwarder: Boolean, $cancelClient: Boolean, $cancelForwarder: Boolean) {
                        setInvoice(adss: $adss, taken: $taken, invoice: $invoice, confirmationClient: $confirmationClient, confirmationForwarder: $confirmationForwarder, cancelClient: $cancelClient, cancelForwarder: $cancelForwarder)
                    }`})
        return res.data.setInvoice
    } catch(err) {
        console.error(err)
    }
}

export const setOrder = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($orders: [OrderInput], $invoice: ID) {
                        setOrder(orders: $orders, invoice: $invoice) {${Invoice}}
                    }`})
        return res.data.setOrder
    } catch(err) {
        console.error(err)
    }
}

export const deleteOrder = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteOrder(_id: $_id)
                    }`})
        return res.data.deleteOrder
    } catch(err) {
        console.error(err)
    }
}

export const subscriptionOrder = gql`
  subscription  {
    reloadOrder {
      who
      invoice {${Invoice}}
      type
    }
  }
`
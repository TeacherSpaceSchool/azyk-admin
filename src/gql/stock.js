import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const Stock = `
    _id
    createdAt
    item {_id name}
    warehouse {_id name}
    count
    unlimited
`

export const getItemsForStocks = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $warehouse: ID) {
                        itemsForStocks(organization: $organization, warehouse: $warehouse) {
                            _id
                            createdAt
                            name
                        }
                    }`,
            })
        return res.data.itemsForStocks
    } catch(err) {
        console.error(err)
    }
}

export const getStocks = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $client: ID, $organization: ID!, $unlimited: Boolean) {
                        stocks(search: $search, client: $client, organization: $organization, unlimited: $unlimited) {${Stock}}
                    }`,
            })
        return res.data.stocks
    } catch(err) {
        console.error(err)
    }
}

export const deleteStock = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteStock(_id: $_id)
                    }`})
        return res.data.deleteStock
    } catch(err) {
        console.error(err)
    }
}

export const addStock = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($unlimited: Boolean, $item: ID!, $count: Float!, $organization: ID!, $warehouse: ID) {
                        addStock(unlimited: $unlimited, item: $item, count: $count, organization: $organization, warehouse: $warehouse) {${Stock}}
                    }`})
        return res.data.addStock
    } catch(err) {
        console.error(err)
    }
}

export const setStock = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $count: Float, $unlimited: Boolean) {
                        setStock(_id: $_id, count: $count, unlimited: $unlimited)
                    }`})
        return res.data.setStock
    } catch(err) {
        console.error(err)
    }
}
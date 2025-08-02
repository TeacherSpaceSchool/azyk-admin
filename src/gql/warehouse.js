import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const Warehouse = `
    _id
    createdAt
    name
    guid
`

export const getWarehouses = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $organization: ID!) {
                        warehouses(search: $search, organization: $organization) {${Warehouse}}
                    }`,
            })
        return res.data.warehouses
    } catch(err) {
        console.error(err)
    }
}

export const deleteWarehouse = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteWarehouse(_id: $_id)
                    }`})
        return res.data.deleteWarehouse
    } catch(err) {
        console.error(err)
    }
}

export const addWarehouse = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($organization: ID!, $guid: String, $name: String!) {
                        addWarehouse(organization: $organization, guid: $guid, name: $name) {${Warehouse}}
                    }`})
        return res.data.addWarehouse
    } catch(err) {
        console.error(err)
    }
}

export const setWarehouse = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $guid: String, $name: String) {
                        setWarehouse(_id: $_id, guid: $guid, name: $name)
                    }`})
        return res.data.setWarehouse
    } catch(err) {
        console.error(err)
    }
}
import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getWarehouses = async(args, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: args,
                query: gql`
                    query ($search: String!, $organization: ID!) {
                        warehouses(search: $search, organization: $organization) {
                            _id
                            createdAt
                            name
                            guid
                          }
                    }`,
            })
        return res.data.warehouses
    } catch(err){
        console.error(err)
    }
}

export const deleteWarehouse = async(_id)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteWarehouse(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const addWarehouse = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        let res = await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($organization: ID!, $guid: String, $name: String!) {
                        addWarehouse(organization: $organization, guid: $guid, name: $name) {
                            _id
                            createdAt
                            guid
                            name
                        }
                    }`})
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const setWarehouse = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($_id: ID!, $guid: String, $name: String) {
                        setWarehouse(_id: $_id, guid: $guid, name: $name) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}
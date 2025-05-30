import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getItemsForStocks = async({organization}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization},
                query: gql`
                    query ($organization: ID!) {
                        itemsForStocks(organization: $organization) {
                            _id
                            createdAt
                            name
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStocks = async(variables, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: variables,
                query: gql`
                    query ($search: String!, $client: ID, $organization: ID!) {
                        stocks(search: $search, client: $client, organization: $organization) {
                            _id
                            createdAt
                            item {_id name}
                            organization {_id name}
                            warehouse {_id name}
                            count
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const deleteStock = async(_id)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteStock(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const addStock = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        let res = await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($item: ID!, $count: Float!, $organization: ID!, $warehouse: ID) {
                        addStock(item: $item, count: $count, organization: $organization, warehouse: $warehouse) {
                            _id
                            createdAt
                            item {_id name}
                            warehouse {_id name}
                            count
                          }
                    }`})
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const setStock = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($_id: ID!, $count: Float!) {
                        setStock(_id: $_id, count: $count) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}
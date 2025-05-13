import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getLimitItemClients = async({client, organization}, _client)=>{
    try{
        _client = _client? _client : new SingletonApolloClient().getClient()
        let res = await _client
            .query({
                variables: {client, organization},
                query: gql`
                    query ($client: ID!, $organization: ID) {
                        limitItemClients(client: $client, organization: $organization) {
                            _id
                            createdAt
                            client {_id name address}
                            limit
                            organization {_id name}
                            item {_id name}
                          }
                    }`,
            })
        return res.data.limitItemClients
    } catch(err){
        console.error(err)
    }
}

export const getItemsForLimitItemClients = async({client, organization}, _client)=>{
    try{
        _client = _client? _client : new SingletonApolloClient().getClient()
        let res = await _client
            .query({
                variables: {client, organization},
                query: gql`
                    query ($client: ID!, $organization: ID) {
                        itemsForLimitItemClients(client: $client, organization: $organization) {
                            _id
                            name
                          }
                    }`,
            })
        return res.data.itemsForLimitItemClients
    } catch(err){
        console.error(err)
    }
}

export const deleteLimitItemClient = async(_id)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteLimitItemClient(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const addLimitItemClient = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        let res = await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($client: ID!, $organization: ID!, $limit: Int!, $item: ID!) {
                        addLimitItemClient(client: $client, organization: $organization, limit: $limit, item: $item) {
                            _id
                            createdAt
                            client {_id name address}
                            limit
                            organization {_id name}
                            item {_id name}
                        }
                    }`})
        return res.data.addLimitItemClient
    } catch(err){
        console.error(err)
    }
}

export const setLimitItemClient = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($_id: ID!, $limit: Int!) {
                        setLimitItemClient(_id: $_id, limit: $limit) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}
import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const SpecialPriceClient = `
    _id
    createdAt
    client {_id name address}
    price
    organization {_id name}
    item {_id name}
`

export const getSpecialPriceClients = async (variables, _client) => {
    try{
        _client = _client? _client : new SingletonApolloClient().getClient()
        const res = await _client
            .query({
                variables,
                query: gql`
                    query ($client: ID!, $organization: ID) {
                        specialPriceClients(client: $client, organization: $organization) {${SpecialPriceClient}}
                    }`,
            })
        return res.data.specialPriceClients
    } catch(err) {
        console.error(err)
    }
}

export const getItemsForSpecialPriceClients = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($client: ID!, $organization: ID) {
                        itemsForSpecialPriceClients(client: $client, organization: $organization) {
                            _id
                            name
                          }
                    }`,
            })
        return res.data.itemsForSpecialPriceClients
    } catch(err) {
        console.error(err)
    }
}

export const deleteSpecialPriceClient = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteSpecialPriceClient(_id: $_id)
                    }`})
        return res.data.setSpecialPriceClient
    } catch(err) {
        console.error(err)
    }
}

export const addSpecialPriceClient = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($client: ID!, $organization: ID!, $price: Float!, $item: ID!) {
                        addSpecialPriceClient(client: $client, organization: $organization, price: $price, item: $item) {${SpecialPriceClient}}
                    }`})
        return res.data.addSpecialPriceClient
    } catch(err) {
        console.error(err)
    }
}

export const setSpecialPriceClient = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $price: Float!) {
                        setSpecialPriceClient(_id: $_id, price: $price)
                    }`})
        return res.data.setSpecialPriceClient
    } catch(err) {
        console.error(err)
    }
}
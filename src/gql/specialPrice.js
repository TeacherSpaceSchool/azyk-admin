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

export const setSpecialPriceClient = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($client: ID!, $organization: ID!, $price: String, $item: ID!) {
                        setSpecialPriceClient(client: $client, organization: $organization, price: $price, item: $item)
                    }`})
        return res.data.setSpecialPriceClient
    } catch(err) {
        console.error(err)
    }
}
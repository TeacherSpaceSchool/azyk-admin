import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const SpecialPriceCategory = `
    _id
    createdAt
    category
    price
    organization {_id name}
    item {_id name}
`

export const getSpecialPriceCategories = async (variables, _client) => {
    try{
        _client = _client? _client : new SingletonApolloClient().getClient()
        const res = await _client
            .query({
                variables,
                query: gql`
                    query ($category: String, $client: ID, $organization: ID) {
                        specialPriceCategories(category: $category, client: $client, organization: $organization) {${SpecialPriceCategory}}
                    }`,
            })
        return res.data.specialPriceCategories
    } catch(err) {
        console.error(err)
    }
}

export const setSpecialPriceCategory = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($category: String!, $organization: ID!, $price: String, $item: ID!) {
                        setSpecialPriceCategory(category: $category, organization: $organization, price: $price, item: $item)
                    }`})
        return res.data.setSpecialPriceCategory
    } catch(err) {
        console.error(err)
    }
}
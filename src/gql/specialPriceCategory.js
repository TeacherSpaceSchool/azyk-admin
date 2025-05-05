import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getSpecialPriceCategories = async(variables, _client)=>{
    try{
        _client = _client? _client : new SingletonApolloClient().getClient()
        let res = await _client
            .query({
                variables,
                query: gql`
                    query ($category: String, $client: ID, $organization: ID) {
                        specialPriceCategories(category: $category, client: $client, organization: $organization) {
                            _id
                            createdAt
                            category
                            price
                            organization {_id name}
                            item {_id name}
                          }
                    }`,
            })
        return res.data.specialPriceCategories
    } catch(err){
        console.error(err)
    }
}

export const getItemsForSpecialPriceCategories = async({category, organization}, _client)=>{
    try{
        _client = _client? _client : new SingletonApolloClient().getClient()
        let res = await _client
            .query({
                variables: {category, organization},
                query: gql`
                    query ($category: String!, $organization: ID!) {
                        itemsForSpecialPriceCategories(category: $category, organization: $organization) {
                            _id
                            name
                          }
                    }`,
            })
        return res.data.itemsForSpecialPriceCategories
    } catch(err){
        console.error(err)
    }
}

export const deleteSpecialPriceCategory = async(_id)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteSpecialPriceCategory(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const addSpecialPriceCategory = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        let res = await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($category: String!, $organization: ID!, $price: Float!, $item: ID!) {
                        addSpecialPriceCategory(category: $category, organization: $organization, price: $price, item: $item) {
                            _id
                            createdAt
                            category
                            price
                            organization {_id name}
                            item {_id name}
                        }
                    }`})
        return res.data.addSpecialPriceCategory
    } catch(err){
        console.error(err)
    }
}

export const setSpecialPriceCategory = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($_id: ID!, $price: Float!) {
                        setSpecialPriceCategory(_id: $_id, price: $price) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}
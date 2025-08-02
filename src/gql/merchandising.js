import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const Merchandising = `
    _id
    date
    employment {_id name}
    organization {_id name}
    client {_id name address}
    productAvailability
    productInventory
    type
    productConditions
    productLocation
    images
    geo
    fhos {type images layout state foreignProducts filling}
    needFho
    check
    stateProduct
    comment
    reviewerScore
    reviewerComment
`

export const getMerchandisings = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $agent: ID, $client: ID, $search: String!, $date: String, $sort: String!, $filter: String!, $skip: Int) {
                        merchandisings(organization: $organization, agent: $agent, client: $client, date: $date, search: $search, sort: $sort, filter: $filter, skip: $skip) {${Merchandising}}
                    }`,
            })
        return res.data.merchandisings
    } catch(err) {
        console.error(err)
    }
}

export const getMerchandising = async (_id, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {_id},
                query: gql`
                    query ($_id: ID!) {
                        merchandising(_id: $_id) {${Merchandising}}
                    }`,
            })
        return res.data.merchandising
    } catch(err) {
        console.error(err)
    }
}

export const deleteMerchandising = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteMerchandising(_id: $_id)
                    }`})
        return res.data.deleteMerchandising
    } catch(err) {
        console.error(err)
    }
}

export const checkMerchandising = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $reviewerScore: Int, $reviewerComment: String) {
                        checkMerchandising(_id: $_id, reviewerScore: $reviewerScore, reviewerComment: $reviewerComment)
                    }`})
        return res.data.checkMerchandising
    } catch(err) {
        console.error(err)
    }
}

export const addMerchandising = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($organization: ID!, $client: ID!, $type: String!, $geo: String, $productAvailability: [String]!, $productInventory: Boolean!, $productConditions: Int!, $productLocation: Int!, $images: [Upload]!, $fhos: [InputFho]!, $needFho: Boolean!, $stateProduct: Int!, $comment: String!) {
                        addMerchandising(organization: $organization, type: $type, geo: $geo, client: $client, productAvailability: $productAvailability, productInventory: $productInventory, productConditions: $productConditions, productLocation: $productLocation, images: $images, fhos: $fhos, needFho: $needFho, stateProduct: $stateProduct, comment: $comment)
                    }`})
        return res.data.addMerchandising
    } catch(err) {
        console.error(err)
    }
}

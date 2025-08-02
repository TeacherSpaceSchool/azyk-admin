import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const Review = `
    _id
    createdAt
    organization {_id name}
    client {_id name}
    taken
    type
    text
`

export const getReviews = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID, $skip: Int, $filter: String) {
                        reviews(organization: $organization, skip: $skip, filter: $filter) {${Review}}
                    }`,
            })
        return res.data.reviews
    } catch(err) {
        console.error(err)
    }
}

export const addReview = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($organization: ID!, $text: String!, $type: String!) {
                        addReview(organization: $organization, text: $text, type: $type) {${Review}}
                    }`})
        return res.data.addReview
    } catch(err) {
        console.error(err)
    }
}

export const acceptReview = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!) {
                        acceptReview(_id: $_id)
                    }`})
        return res.data.acceptReview
    } catch(err) {
        console.error(err)
    }
}

export const deleteReview = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteReview(_id: $_id)
                    }`})
        return res.data.deleteReview
    } catch(err) {
        console.error(err)
    }
}
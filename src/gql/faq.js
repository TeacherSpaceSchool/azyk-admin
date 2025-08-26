import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const Faq = `
    _id
    title
    video
    createdAt
    typex
`

export const getFaqs = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!) {
                        faqs(search: $search) {${Faq}}
                    }`,
            })
        return res.data.faqs
    } catch(err) {
        console.error(err)
    }
}

export const deleteFaq = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteFaq(_id: $_id)
                    }`})
        return res.data.deleteFaq
    } catch(err) {
        console.error(err)
    }
}

export const addFaq = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($title: String!, $video: String!, $typex: String!) {
                        addFaq(title: $title, video: $video, typex: $typex) {${Faq}}
                    }`})
        return res.data.addFaq
    } catch(err) {
        console.error(err)
    }
}

export const setFaq = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $title: String, $video: String, $typex: String) {
                        setFaq(_id: $_id, title: $title, video: $video, typex: $typex)
                    }`})
        return res.data.setFaq
    } catch(err) {
        console.error(err)
    }
}
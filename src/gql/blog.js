import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const Blog = `
    _id
    image
    text
    title
    createdAt
`

export const getBlogs = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!) {
                        blogs(search: $search) {${Blog}}
                    }`,
            })
        return res.data.blogs
    } catch(err) {
        console.error(err)
    }
}

export const addBlog = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($image: Upload!, $text: String!, $title: String!) {
                        addBlog(image: $image, text: $text, title: $title) {${Blog}}
                    }`})
        return res.data.addBlog
    } catch(err) {
        console.error(err)
    }
}

export const setBlog = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $image: Upload, $text: String, $title: String) {
                        setBlog(_id: $_id, image: $image, text: $text, title: $title)
                    }`})
        return res.data.setBlog
    } catch(err) {
        console.error(err)
    }
}

export const deleteBlog = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteBlog(_id: $_id)
                    }`})
        return res.data.deleteBlog
    } catch(err) {
        console.error(err)
    }
}
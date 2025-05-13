import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getBlogs = async({search}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {search},
                query: gql`
                    query ($search: String!) {
                        blogs(search: $search) {
                            _id
                            image
                            text
                            title
                            createdAt
                          }
                    }`,
            })
        return res.data.blogs
    } catch(err){
        console.error(err)
    }
}

export const deleteBlog = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        deleteBlog(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const addBlog = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        let res = await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($image: Upload!, $text: String!, $title: String!) {
                        addBlog(image: $image, text: $text, title: $title) {
                            _id
                            image
                            text
                            title
                            createdAt
                        }
                    }`})
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const setBlog = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($_id: ID!, $image: Upload, $text: String, $title: String) {
                        setBlog(_id: $_id, image: $image, text: $text, title: $title) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}
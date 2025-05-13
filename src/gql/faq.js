import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getFaqs = async({search}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {search},
                query: gql`
                    query ($search: String!) {
                        faqs(search: $search) {
                            _id
                            url
                            title
                            video
                            createdAt
                            typex
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const deleteFaq = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        deleteFaq(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const addFaq = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        let res = await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($file: Upload, $title: String!, $video: String, $typex: String!) {
                        addFaq(file: $file, title: $title, video: $video, typex: $typex) {
                            _id
                            url
                            title
                            video
                            createdAt
                            typex
                        }
                    }`})
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const setFaq = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($_id: ID!, $file: Upload, $title: String, $video: String, $typex: String) {
                        setFaq(_id: $_id, file: $file, title: $title, video: $video, typex: $typex) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}
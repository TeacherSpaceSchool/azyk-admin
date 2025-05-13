import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';
import { SingletonStore } from '../singleton/store';

export const getNotifications = async({search})=>{
    try{
        const client = new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {search},
                query: gql`
                    query ($search: String!) {
                        notifications(search: $search) {
                            _id
                            text
                            title
                            createdAt
                          }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getNotification = async({_id: _id})=>{
    try{
        const client = new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {_id: _id},
                query: gql`
                    query ($_id: ID!) {
                        notification(_id: $_id) {
                            _id
                            text
                            title
                            createdAt
                          }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const deleteNotification = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        deleteNotification(_id: $_id) {
                             data
                        }
                    }`})
        return await getNotifications(new SingletonStore().getStore().getState().app)
    } catch(err){
        console.error(err)
    }
}

export const addNotification = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($title: String!, $text: String!) {
                        addNotification(text: $text, title: $title) {
                             data
                        }
                    }`})
        let list = await getNotifications(new SingletonStore().getStore().getState().app)
        return list
    } catch(err){
        console.error(err)
    }
}
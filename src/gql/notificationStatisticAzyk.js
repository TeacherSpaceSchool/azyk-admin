import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';
import { SingletonStore } from '../singleton/store';

export const getNotificationStatistics = async({search}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {search},
                query: gql`
                    query ($search: String!){
                        notificationStatistics(search: $search) {
                            _id
                            createdAt
                            title
                            text
                            delivered
                            failed
                            tag
                            url
                            icon
                            click
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const addNotificationStatistic = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($text: String!, $title: String!, $tag: String, $url: String, $icon: Upload) {
                        addNotificationStatistic(text: $text, title: $title, tag: $tag, url: $url, icon: $icon) {
                             data
                        }
                    }`})
        return await getNotificationStatistics(new SingletonStore().getStore().getState().app)
    } catch(err){
        console.error(err)
    }
}
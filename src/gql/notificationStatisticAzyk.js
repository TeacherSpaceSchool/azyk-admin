import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const NotificationStatistic = `
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
`

export const getNotificationStatistics = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!) {
                        notificationStatistics(search: $search) {${NotificationStatistic}}
                    }`,
            })
        return res.data.notificationStatistics
    } catch(err) {
        console.error(err)
    }
}

export const addNotificationStatistic = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($text: String!, $title: String!, $tag: String, $url: String, $icon: Upload) {
                        addNotificationStatistic(text: $text, title: $title, tag: $tag, url: $url, icon: $icon) {${NotificationStatistic}}
                    }`})
        return res.data.addNotificationStatistic
    } catch(err) {
        console.error(err)
    }
}
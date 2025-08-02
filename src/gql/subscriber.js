import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getSubscribers = async (client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                query: gql`
                    query {
                        subscribers {
                            _id
                            createdAt
                            user
                            number
                            status
                          }
                    }`,
            })
        return res.data.subscribers
    } catch(err) {
        console.error(err)
    }
}
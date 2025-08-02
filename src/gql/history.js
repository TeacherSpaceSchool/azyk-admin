import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getHistories = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String, $filter: String, $skip: Int!) {
                        histories(search: $search, filter: $filter, skip: $skip) {
                            _id createdAt user {role} employment {_id name} client {_id name} object type model name data
                        }
                    }`,
            })
        return res.data.histories
    } catch(err) {
        console.error(err)
    }
}
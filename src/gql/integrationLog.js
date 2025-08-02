import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getIntegrationLogs = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($filter: String, $organization: ID!, $skip: Int!) {
                        integrationLogs(filter: $filter, organization: $organization, skip: $skip) {
                            _id createdAt path xml
                        }
                    }`,
            })
        return res.data.integrationLogs
    } catch(err) {
        console.error(err)
    }
}
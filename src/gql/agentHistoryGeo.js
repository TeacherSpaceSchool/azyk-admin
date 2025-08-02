import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getAgentHistoryGeos = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID, $agent: ID, $date: String) {
                        agentHistoryGeos(organization: $organization, agent: $agent, date: $date) {
                            columns
                            row {_id data}
                          }
                    }`,
            })
        return res.data.agentHistoryGeos
    } catch(err) {
        console.error(err)
    }
}

export const addAgentHistoryGeo = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($client: ID!, $geo: String!) {
                        addAgentHistoryGeo(client: $client, geo: $geo)
                    }`})
        return res.data.addAgentHistoryGeo
    } catch(err) {
        console.error(err)
    }
}
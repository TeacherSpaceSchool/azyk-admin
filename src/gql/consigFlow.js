import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const ConsigFlow = `
    _id
    createdAt
    invoice {_id number}
    client {name _id address}
    amount
    cancel
    sign
`

export const getConsigFlows = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($skip: Int!, $client: ID, $district: ID, $invoice: ID, $organization: ID!, $search: String) {
                        consigFlows(skip: $skip, client: $client, district: $district, invoice: $invoice, organization: $organization, search: $search) {${ConsigFlow}}
                    }`,
            })
        return res.data.consigFlows
    } catch(err) {
        console.error(err)
    }
}

export const getConsigFlowStatistic = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($date: Date!, $district: ID, $organization: ID!, $search: String) {
                        consigFlowStatistic(date: $date, district: $district, organization: $organization, search: $search) 
                    }`,
            })
        return res.data.consigFlowStatistic
    } catch(err) {
        console.error(err)
    }
}

export const addConsigFlow = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($client: ID!, $sign: Int!, $amount: Float!) {
                        addConsigFlow(client: $client, sign: $sign, amount: $amount) {${ConsigFlow}}
                    }`})
        return res.data.addConsigFlow
    } catch(err) {
        console.error(err)
    }
}

export const setConsigFlow = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $cancel: Boolean!) {
                        setConsigFlow(_id: $_id, cancel: $cancel)
                    }`})
        return res.data.setConsigFlow
    } catch(err) {
        console.error(err)
    }
}
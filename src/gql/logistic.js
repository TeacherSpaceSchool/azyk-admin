import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';
import {Invoice} from './order';
import {Returned} from './returned';

export const getFinanceReport = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $track: Int, $forwarder: ID!, $dateDelivery: Date!) {
                        financeReport(organization: $organization, track: $track, forwarder: $forwarder, dateDelivery: $dateDelivery) {
                            invoices {${Invoice}}
                            returneds {${Returned}}
                        }
                    }`,
            })
        return res.data.financeReport
    } catch(err) {
        console.error(err)
    }
}

export const getSummaryInvoice = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $track: Int!, $forwarder: ID!, $dateDelivery: Date!) {
                        summaryInvoice(organization: $organization, track: $track, forwarder: $forwarder, dateDelivery: $dateDelivery)
                    }`,
            })
        return res.data.summaryInvoice
    } catch(err) {
        console.error(err)
    }
}

export const getSummaryAdss = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $track: Int, $agent: ID, $forwarder: ID, $dateDelivery: Date!) {
                        summaryAdss(organization: $organization, track: $track, agent: $agent, forwarder: $forwarder, dateDelivery: $dateDelivery)
                    }`,
            })
        return res.data.summaryAdss
    } catch(err) {
        console.error(err)
    }
}

export const setSettedSummaryAds = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables,
            mutation : gql`
                    mutation ($item: ID!, $count: Int!, $forwarder: ID!, $organization: ID!, $dateDelivery: Date!) {
                        setSettedSummaryAds(item: $item, count: $count, forwarder: $forwarder, organization: $organization, dateDelivery: $dateDelivery)
                    }`})
    } catch(err) {
        console.error(err)
    }
}
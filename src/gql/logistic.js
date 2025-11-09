import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';
import {Invoice} from './order';

export const getFinanceReport = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $track: Int, $forwarder: ID!, $dateDelivery: Date!) {
                        financeReport(organization: $organization, track: $track, forwarder: $forwarder, dateDelivery: $dateDelivery) {${Invoice}}
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
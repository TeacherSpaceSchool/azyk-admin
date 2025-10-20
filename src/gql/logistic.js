import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getFinanceReport = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $track: Int, $forwarder: ID!, $dateDelivery: Date!, $excel: Boolean) {
                        financeReport(organization: $organization, track: $track, forwarder: $forwarder, dateDelivery: $dateDelivery, excel: $excel)
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
                    query ($organization: ID!, $track: Int!, $forwarder: ID!, $dateDelivery: Date!, $excel: Boolean) {
                        summaryInvoice(organization: $organization, track: $track, forwarder: $forwarder, dateDelivery: $dateDelivery, excel: $excel)
                    }`,
            })
        return res.data.summaryInvoice
    } catch(err) {
        console.error(err)
    }
}
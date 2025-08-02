import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';
import { SingletonStore } from '../singleton/store';
import { getReceiveDataByIndex, putReceiveDataByIndex } from '../service/idb/receiveData';

const DiscountClient = `
    client
    discount
    organization
`

export const getDiscountClients = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                     query ($clients: [ID]!, $organization: ID!) {
                        discountClients(clients: $clients, organization: $organization) {${DiscountClient}}
                    }`,
            })
        return res.data.discountClients
    } catch(err) {
        console.error(err)
    }
}

export const getDiscountClient = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                     query ($client: ID!, $organization: ID!) {
                        discountClient(client: $client, organization: $organization) {
                            client
                            discount
                            organization
                         }
                    }`,
            })
        if(new SingletonStore().getStore()&&new SingletonStore().getStore().getState().user.profile.role&&new SingletonStore().getStore().getState().user.profile.role.includes('агент'))
            await putReceiveDataByIndex(`discountClient(client: ${variables.client}, organization: ${variables.organization})`, res.data.discountClient)
        return res.data.discountClient
    } catch(err) {
        console.error(err)
        if(new SingletonStore().getStore()&&new SingletonStore().getStore().getState().user.profile.role&&new SingletonStore().getStore().getState().user.profile.role.includes('агент'))
            return await getReceiveDataByIndex(`discountClient(client: ${variables.client}, organization: ${variables.organization})`)
    }
}

export const saveDiscountClients = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($clients: [ID]!, $organization: ID!, $discount: Int!) {
                        setDiscountClients(clients: $clients, organization: $organization, discount: $discount)
                    }`})
        return res.data.setDiscountClients
    } catch(err) {
        console.error(err)
    }
}
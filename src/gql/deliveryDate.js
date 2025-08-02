import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';
import { SingletonStore } from '../singleton/store';
import { getReceiveDataByIndex, putReceiveDataByIndex } from '../service/idb/receiveData';

const DeliveryDate = `
    client
    days
    organization
    priority
`

export const getDeliveryDates = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                     query ($clients: [ID]!, $organization: ID!) {
                        deliveryDates(clients: $clients, organization: $organization) {${DeliveryDate}}
                    }`,
            })
        return res.data.deliveryDates
    } catch(err) {
        console.error(err)
    }
}

export const getDeliveryDate = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                     query ($client: ID!, $organization: ID!) {
                        deliveryDate(client: $client, organization: $organization) {${DeliveryDate}}
                    }`,
            })
        if(new SingletonStore().getStore()&&new SingletonStore().getStore().getState().user.profile.role&&new SingletonStore().getStore().getState().user.profile.role.includes('агент'))
            await putReceiveDataByIndex(`deliveryDate(client: ${variables.client}, organization: ${variables.organization})`, res.data.deliveryDate)
        return res.data.deliveryDate
    } catch(err) {
        console.error(err)
        if(new SingletonStore().getStore()&&new SingletonStore().getStore().getState().user.profile.role&&new SingletonStore().getStore().getState().user.profile.role.includes('агент'))
            return await getReceiveDataByIndex(`deliveryDate(client: ${variables.client}, organization: ${variables.organization})`)
    }
}

export const saveDeliveryDates = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($clients: [ID]!, $organization: ID!, $days: [Boolean]!, $priority: Int!) {
                        setDeliveryDates(clients: $clients, organization: $organization, days: $days, priority: $priority)
                    }`})
        return res.data.setDeliveryDates
    } catch(err) {
        console.error(err)
    }
}
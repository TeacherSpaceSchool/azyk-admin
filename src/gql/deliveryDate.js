import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';
import { SingletonStore } from '../singleton/store';
import { getReceiveDataByIndex, putReceiveDataByIndex } from '../service/idb/receiveData';

const DeliveryDate = `
    days
    organization
`

export const getDeliveryDate = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                     query ($organization: ID!) {
                        deliveryDate(organization: $organization) {${DeliveryDate}}
                    }`,
            })
        if(new SingletonStore().getStore()&&new SingletonStore().getStore().getState().user.profile.role&&new SingletonStore().getStore().getState().user.profile.role.includes('агент'))
            await putReceiveDataByIndex(`deliveryDate(organization: ${variables.organization})`, res.data.deliveryDate)
        return res.data.deliveryDate
    } catch(err) {
        console.error(err)
        if(new SingletonStore().getStore()&&new SingletonStore().getStore().getState().user.profile.role&&new SingletonStore().getStore().getState().user.profile.role.includes('агент'))
            return await getReceiveDataByIndex(`deliveryDate(organization: ${variables.organization})`)
    }
}

export const setDeliveryDate = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($organization: ID!, $days: [Boolean]!) {
                        setDeliveryDate(organization: $organization, days: $days)
                    }`})
        return res.data.setDeliveryDate
    } catch(err) {
        console.error(err)
    }
}
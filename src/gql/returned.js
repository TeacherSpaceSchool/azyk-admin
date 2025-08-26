import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const Returned = `
    _id
    createdAt
    dateDelivery
    updatedAt
    items {_id item count allPrice allTonnage weight price}
    allTonnage
    client {_id name email phone user {_id}}
    allPrice
    info
    address
    editor
    number
    confirmationForwarder
    track
    forwarder {_id name}
    district
    agent {_id name}
    organization {_id name}
    cancelForwarder
    sync
`

export const getReturneds = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $sort: String!, $date: String!, $skip: Int, $city: String) {
                        returneds(search: $search, sort: $sort, date: $date, skip: $skip, city: $city) {${Returned}}
                    }`,
            })
        return res.data.returneds
    } catch(err) {
        console.error(err)
    }
}

export const getReturnedsFromDistrict = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $district: ID!, $date: String!) {
                        returnedsFromDistrict(organization: $organization, date: $date, district: $district) {${Returned}}
                    }`,
            })
        return res.data.returnedsFromDistrict
    } catch(err) {
        console.error(err)
    }
}

export const setReturnedLogic = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($track: Int, $forwarder: ID, $returneds: [ID]!) {
                        setReturnedLogic(track: $track, forwarder: $forwarder, returneds: $returneds)
                    }`})
        return res.data.setReturnedLogic
    } catch(err) {
        console.error(err)
    }
}

export const getReturnedsSimpleStatistic = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $date: String!, $city: String) {
                        returnedsSimpleStatistic(search: $search, date: $date, city: $city) 
                    }`,
            })
        return res.data.returnedsSimpleStatistic
    } catch(err) {
        console.error(err)
    }
}

export const addReturned = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($dateDelivery: Date!, $unite: Boolean, $info: String, $inv: Boolean, $address: [[String]], $organization: ID!, $client: ID!, $items: [ReturnedItemsInput]) {
                        addReturned(dateDelivery: $dateDelivery, unite: $unite, info: $info, inv: $inv, address: $address, organization: $organization, client: $client, items: $items)
                    }`})
        return res.data.addReturned
    } catch(err) {
        console.error(err)
    }
}

export const deleteReturneds = async (_ids) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_ids},
            mutation : gql`
                    mutation ($_ids: [ID]!) {
                        deleteReturneds(_ids: $_ids)
                    }`})
        return res.data.deleteReturneds
    } catch(err) {
        console.error(err)
    }
}

export const setReturned = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($items: [ReturnedItemsInput], $returned: ID, $confirmationForwarder: Boolean, $cancelForwarder: Boolean) {
                        setReturned(items: $items, returned: $returned, confirmationForwarder: $confirmationForwarder, cancelForwarder: $cancelForwarder) {${Returned}}
                    }`})
        return res.data.setReturned
    } catch(err) {
        console.error(err)
    }
}
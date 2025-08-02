import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const Equipment = `
    _id
    createdAt
    image
    number
    model
    client {name _id address}
    agent {_id name}
    agentsHistory {agent {_id name} date}
    organization {_id name}
`

export const getUnloadEquipments = async (organization, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {organization},
                query: gql`
                    query ($organization: ID!) {
                        unloadEquipments(organization: $organization)
                    }`,
            })
        return res.data.unloadEquipments
    } catch(err) {
        console.error(err)
    }
}

export const getEquipments = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $search: String!, $agent: ID, $skip: Int) {
                        equipments(organization: $organization, search: $search, agent: $agent, skip: $skip) {${Equipment}}
                    }`,
            })
        return res.data.equipments
    } catch(err) {
        console.error(err)
    }
}

export const getEquipmentsCount = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $search: String!, $agent: ID) {
                        equipmentsCount(organization: $organization, search: $search, agent: $agent) 
                    }`,
            })
        return res.data.equipmentsCount
    } catch(err) {
        console.error(err)
    }
}

export const deleteEquipment = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteEquipment(_id: $_id)
                    }`})
        return res.data.deleteEquipment
    } catch(err) {
        console.error(err)
    }
}

export const setEquipment = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $client: ID, $number: String, $model: String, $agent: ID, $image: Upload) {
                        setEquipment(_id: $_id, client: $client, number: $number, model: $model, agent: $agent, image: $image)
                    }`})
        return res.data.setEquipment
    } catch(err) {
        console.error(err)
    }
}

export const addEquipment = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($organization: ID, $client: ID, $number: String!, $model: String!, $agent: ID) {
                        addEquipment(organization: $organization, client: $client, number: $number, model: $model, agent: $agent) {${Equipment}}
                    }`})
        return res.data.addEquipment
    } catch(err) {
        console.error(err)
    }
}
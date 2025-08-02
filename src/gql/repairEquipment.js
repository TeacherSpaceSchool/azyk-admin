import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const RepairEquipment = `
    _id
    createdAt
    number
    status
    equipment
    client {name _id address}
    repairMan {_id name}
    agent {_id name}
    organization {_id name}
    accept
    done
    cancel
    defect
    repair
    dateRepair
`

export const getRepairEquipments = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $search: String!, $filter: String!) {
                        repairEquipments(organization: $organization, search: $search, filter: $filter) {${RepairEquipment}}
                    }`,
            })
        return res.data.repairEquipments
    } catch(err) {
        console.error(err)
    }
}

export const getRepairEquipment = async (_id, client)=> {
    try {
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {_id},
                query: gql`
                    query ($_id: ID!) {
                        repairEquipment(_id: $_id) {${RepairEquipment}}
                    }`,
            })
        return res.data.repairEquipment
    } catch (err) {
        console.error(err)
    }
}

export const deleteRepairEquipment = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteRepairEquipment(_id: $_id)
                    }`})
        return res.data.deleteRepairEquipment
    } catch(err) {
        console.error(err)
    }
}

export const setRepairEquipment = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $client: ID, $equipment: String, $accept: Boolean, $done: Boolean, $cancel: Boolean, $defect: [String], $repair: [String]) {
                        setRepairEquipment(_id: $_id, equipment: $equipment, client: $client, accept: $accept, done: $done, cancel: $cancel, defect: $defect, repair: $repair)
                    }`})
        return res.data.setRepairEquipment
    } catch(err) {
        console.error(err)
    }
}

export const addRepairEquipment = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($organization: ID, $client: ID!, $equipment: String!, $defect: [String]!) {
                        addRepairEquipment(organization: $organization, equipment: $equipment, client: $client, defect: $defect)
                    }`})
        return res.data.addRepairEquipment
    } catch(err) {
        console.error(err)
    }
}
import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const District = `
    _id
    createdAt
    name
    organization {_id name cities}
    client {_id image createdAt lastActive name email address city category phone user {_id role status login}}
    ecspeditor {_id name phone}
    agent {_id name phone}
    manager {_id name phone}
    warehouse {_id name}
`

export const getDistricts = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID, $search: String!, $sort: String!) {
                        districts(organization: $organization, search: $search, sort: $sort) {${District}}
                    }`,
            })
        return res.data.districts
    } catch(err) {
        console.error(err)
    }
}

export const getDistrict = async (_id, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {_id},
                query: gql`
                    query ($_id: ID) {
                        district(_id: $_id) {${District}}
                    }`,
            })
        return res.data.district
    } catch(err) {
        console.error(err)
    }
}

export const getСlientDistrict = async (organization, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {organization},
                query: gql`
                    query ($organization: ID!) {
                        clientDistrict(organization: $organization) {${District}}
                    }`,
            })
        return res.data.clientDistrict
    } catch(err) {
        console.error(err)
    }
}

export const deleteDistrict = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteDistrict(_id: $_id)
                    }`})
        return res.data.deleteDistrict
    } catch(err) {
        console.error(err)
    }
}

export const addDistrict = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($organization: ID, $client: [ID]!, $name: String!, $agent: ID, $ecspeditor: ID, $manager: ID, $warehouse: ID) {
                        addDistrict(organization: $organization, client: $client, name: $name, agent: $agent, ecspeditor: $ecspeditor, manager: $manager, warehouse: $warehouse)
                    }`})
        return res.data.addDistrict
    } catch(err) {
        console.error(err)
    }
}

export const setDistrict = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $client: [ID], $name: String, $agent: ID, $ecspeditor: ID, $manager: ID, $warehouse: ID) {
                        setDistrict(_id: $_id, client: $client, name: $name, agent: $agent, ecspeditor: $ecspeditor, manager: $manager, warehouse: $warehouse) 
                    }`})
        return res.data.setDistrict
    } catch(err) {
        console.error(err)
    }
}
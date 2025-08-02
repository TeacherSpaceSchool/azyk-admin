import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const Auto = `
    _id 
    number
    tonnage 
    createdAt 
    employment {_id name}
    organization {_id name}
`

export const getAutos = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $search: String!, $sort: String!) {
                        autos(organization: $organization, search: $search, sort: $sort) {${Auto}}
                    }`,
            })
        return res.data.autos
    } catch(err) {
        console.error(err)
    }
}

export const setAuto = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $tonnage: Float, $number: String, $employment: ID) {
                        setAuto(_id: $_id, tonnage: $tonnage, number: $number, employment: $employment)
                    }`})
        return res.data.setAuto
    } catch(err) {
        console.error(err)
    }
}

export const addAuto = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($tonnage: Float!, $number: String!, $organization: ID, $employment: ID) {
                        addAuto(tonnage: $tonnage, number: $number, organization: $organization, employment: $employment) {${Auto}}
                    }`})
        return res.data.addAuto
    } catch(err) {
        console.error(err)
    }
}

export const deleteAuto = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteAuto(_id: $_id)
                    }`})
        return res.data.deleteAuto
    } catch(err) {
        console.error(err)
    }
}
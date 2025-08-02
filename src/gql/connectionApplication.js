import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const ConnectionApplication = `
    _id
    createdAt
    name
    phone
    address
    whereKnow
    taken
`

export const getConnectionApplications = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($skip: Int, $filter: String) {
                        connectionApplications(skip: $skip, filter: $filter) {${ConnectionApplication}}
                    }`,
            })
        return res.data.connectionApplications
    } catch(err) {
        console.error(err)
    }
}

export const getConnectionApplicationsSimpleStatistic = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($filter: String) {
                        connectionApplicationsSimpleStatistic(filter: $filter) 
                    }`,
            })
        return res.data.connectionApplicationsSimpleStatistic
    } catch(err) {
        console.error(err)
    }
}

export const addConnectionApplication = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($name: String!, $phone: String!, $address: String!, $whereKnow: String!) {
                        addConnectionApplication(name: $name, phone: $phone, address: $address, whereKnow: $whereKnow) {${ConnectionApplication}}
                    }`})
        return res.data.addConnectionApplication
    } catch(err) {
        console.error(err)
    }
}

export const acceptConnectionApplication = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!) {
                        acceptConnectionApplication(_id: $_id)
                    }`})
        return res.data.acceptConnectionApplication
    } catch(err) {
        console.error(err)
    }
}

export const deleteConnectionApplication = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteConnectionApplication(_id: $_id)
                    }`})
        return res.data.deleteConnectionApplication
    } catch(err) {
        console.error(err)
    }
}
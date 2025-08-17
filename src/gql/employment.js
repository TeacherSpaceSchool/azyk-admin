import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const Employment = `
    _id
    createdAt
    name
    email
    phone
    user {_id role status login}
    organization {_id name}
`

export const getEmployments = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID, $search: String!, $filter: String!, $skip: Int) {
                        employments(organization: $organization, search: $search, filter: $filter, skip: $skip) {${Employment}}
                    }`,
            })
        return res.data.employments
    } catch(err) {
        console.error(err)
    }
}

export const getEmploymentsCount = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID, $search: String!, $filter: String!) {
                        employmentsCount(organization: $organization, search: $search, filter: $filter)
                    }`,
            })
        return res.data.employmentsCount
    } catch(err) {
        console.error(err)
    }
}

export const getEmployment = async (_id, client) => {
    try {
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {_id},
                query: gql`
                    query ($_id: ID!) {
                        employment(_id: $_id) {${Employment}}
                    }`,
            })
        return res.data.employment
    } catch (err) {
        console.error(err)
    }
}

export const getManagers = async (organization, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {organization},
                query: gql`
                    query ($organization: ID) {
                        managers(organization: $organization) {${Employment}}
                    }`,
            })
        return res.data.managers
    } catch(err) {
        console.error(err)
    }
}

export const getEcspeditors = async (organization, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {organization},
                query: gql`
                    query ($organization: ID) {
                        ecspeditors(organization: $organization) {${Employment}}
                    }`,
            })
        return res.data.ecspeditors
    } catch(err) {
        console.error(err)
    }
}

export const getAgents = async (organization, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {organization},
                query: gql`
                    query ($organization: ID) {
                        agents(organization: $organization) {${Employment}}
                    }`,
            })
        return res.data.agents
    } catch(err) {
        console.error(err)
    }
}

export const onoffEmployment = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        onoffEmployment(_id: $_id)
                    }`})
        return res.data.onoffEmployment
    } catch(err) {
        console.error(err)
    }
}

export const deleteEmployment = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteEmployment(_id: $_id)
                    }`})
        return res.data.deleteEmployment
    } catch(err) {
        console.error(err)
    }
}

export const setEmployments = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $name: String, $email: String, $newPass: String, $role: String, $phone: [String], $login: String) {
                        setEmployment(_id: $_id, name: $name, email: $email, newPass: $newPass, role: $role, phone: $phone, login: $login)
                    }`})
        return res.data.setEmployment
    } catch(err) {
        console.error(err)
    }
}

export const addEmployment = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($name: String!, $email: String!, $phone: [String]!, $login: String!, $password: String!, $role: String!, $organization: ID) {
                        addEmployment(name: $name, email: $email, phone: $phone, login: $login, password: $password, role: $role, organization: $organization)
                    }`})
        return res.data.addEmployment
    } catch(err) {
        console.error(err)
    }
}
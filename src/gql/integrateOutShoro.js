import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const OutXMLShoro = `
    _id
    createdAt
    guid
    date
    number
    client
    agent
    forwarder
    status
    exc
`

export const getOutXMLShoros = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $filter: String!, $skip: Int, $organization: ID!) {
                        outXMLShoros(search: $search, filter: $filter, skip: $skip, organization: $organization) {${OutXMLShoro}}
                    }`,
            })
        return res.data.outXMLShoros
    } catch(err) {
        console.error(err)
    }
}

export const getStatisticOutXMLShoros = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query($organization: ID!) {
                        statisticOutXMLShoros(organization: $organization)
                    }`,
            })
        return res.data.statisticOutXMLShoros
    } catch(err) {
        console.error(err)
    }
}

export const getStatisticOutXMLReturnedShoros = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query($organization: ID!) {
                        statisticOutXMLReturnedShoros(organization: $organization)
                    }`,
            })
        return res.data.statisticOutXMLReturnedShoros
    } catch(err) {
        console.error(err)
    }
}

export const getOutXMLReturnedShoros = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $filter: String!, $skip: Int, $organization: ID!) {
                        outXMLReturnedShoros(search: $search, filter: $filter, skip: $skip, organization: $organization) {${OutXMLShoro}}
                    }`,
            })
        return res.data.outXMLReturnedShoros
    } catch(err) {
        console.error(err)
    }
}

export const deleteOutXMLShoro = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteOutXMLShoro(_id: $_id)
                    }`})
        return res.data.deleteOutXMLShoro
    } catch(err) {
        console.error(err)
    }
}

export const deleteOutXMLShoroAll = async (organization) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {organization},
            mutation : gql`
                    mutation ($organization: ID!) {
                        deleteOutXMLShoroAll(organization: $organization)
                    }`})
        return res.data.deleteOutXMLShoroAll
    } catch(err) {
        console.error(err)
    }
}

export const deleteOutXMLReturnedShoro = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteOutXMLReturnedShoro(_id: $_id)
                    }`})
        return res.data.deleteOutXMLReturnedShoro
    } catch(err) {
        console.error(err)
    }
}

export const deleteOutXMLReturnedShoroAll = async (organization) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {organization},
            mutation : gql`
                    mutation($organization: ID!) {
                        deleteOutXMLReturnedShoroAll(organization: $organization)
                    }`})
        return res.data.deleteOutXMLReturnedShoroAll
    } catch(err) {
        console.error(err)
    }
}
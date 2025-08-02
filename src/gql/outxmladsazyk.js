import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const OutXMLAdsShoro = `
    _id
    createdAt
    guid
    district {_id name}
    organization {_id name}
`

export const districtsOutXMLAdsShoros = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query($organization: ID!) {
                        districtsOutXMLAdsShoros(organization: $organization) {
                            _id
                            name
                          }
                    }`,
            })
        return res.data.districtsOutXMLAdsShoros
    } catch(err) {
        console.error(err)
    }
}

export const outXMLAdsShoros = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $search: String!) {
                        outXMLAdsShoros(organization: $organization, search: $search) {${OutXMLAdsShoro}}
                    }`,
            })
        return res.data.outXMLAdsShoros
    } catch(err) {
        console.error(err)
    }
}

export const deleteOutXMLAdsShoro = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteOutXMLAdsShoro(_id: $_id)
                    }`})
        return res.data.deleteOutXMLAdsShoro
    } catch(err) {
        console.error(err)
    }
}

export const addOutXMLAdsShoro = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($organization: ID!, $district: ID!, $guid: String!) {
                        addOutXMLAdsShoro(organization: $organization, district: $district, guid: $guid) {${OutXMLAdsShoro}}
                    }`})
        return res.data.addOutXMLAdsShoro
    } catch(err) {
        console.error(err)
    }
}

export const setOutXMLAdsShoro = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $guid: String) {
                        setOutXMLAdsShoro(_id: $_id, guid: $guid)
                    }`})
        return res.data.setOutXMLAdsShoro
    } catch(err) {
        console.error(err)
    }
}
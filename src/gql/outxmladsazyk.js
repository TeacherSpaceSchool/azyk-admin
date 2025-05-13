import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';
import { SingletonStore } from '../singleton/store';

export const districtsOutXMLAdsShoros = async({organization}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization: organization},
                query: gql`
                    query($organization: ID!) {
                        districtsOutXMLAdsShoros(organization: $organization){
                            _id
                            name
                          }
                    }`,
            })
        return res.data.districtsOutXMLAdsShoros
    } catch(err){
        console.error(err)
    }
}

export const outXMLAdsShoros = async({search, sort, organization}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {search, sort, organization: organization},
                query: gql`
                    query ($organization: ID!, $search: String!) {
                        outXMLAdsShoros(organization: $organization, search: $search) {
                            _id
                            guid
                            district
                                {_id name}
                            organization
                                {_id name}
                            createdAt
                          }
                    }`,
            })
        return res.data.outXMLAdsShoros
    } catch(err){
        console.error(err)
    }
}

export const deleteOutXMLAdsShoro = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        deleteOutXMLAdsShoro(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const addOutXMLAdsShoro = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        let res = await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($organization: ID!, $district: ID!, $guid: String!) {
                        addOutXMLAdsShoro(organization: $organization, district: $district, guid: $guid) {
                            _id
                            guid
                            district
                                {_id name}
                            organization
                                {_id name}
                            createdAt
                        }
                    }`})
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const setOutXMLAdsShoro = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($_id: ID!, $district: ID, $guid: String) {
                        setOutXMLAdsShoro(_id: $_id, district: $district, guid: $guid) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}
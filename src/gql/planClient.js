import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getUnloadPlanClients = async({organization, city, district}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization, city, district},
                query: gql`
                    query ($organization: ID!, $city: String, $district: ID) {
                        unloadPlanClients(organization: $organization, city: $city, district: $district)  {
                             data
                        }
                    }`,
            })
        return res.data
    }
    catch(err){
        console.error(err)
    }
}

export const getClientsForPlanClients = async({search, organization, city, district}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {search, organization, city, district},
                query: gql`
                    query ($search: String!, $organization: ID!, $city: String, $district: ID) {
                        clientsForPlanClients(search: $search, organization: $organization, city: $city, district: $district) {
                            _id
                            createdAt
                            name
                            address
                          }
                    }`,
            })
        return res.data
    }
    catch(err){
        console.error(err)
    }
}

export const getPlanClients = async({search, district, city, organization, skip}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {search, district, city, organization, skip},
                query: gql`
                    query ($search: String!, $city: String, $organization: ID!, $district: ID, $skip: Int!) {
                        planClients (search: $search, city: $city, organization: $organization, district: $district, skip: $skip) {
                            _id
                            createdAt
                            client {_id name address}
                            current
                            month
                            visit
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getPlanClientsCount = async({search, district, city, organization}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {search, district, city, organization},
                query: gql`
                    query ($search: String!, $city: String, $organization: ID!, $district: ID) {
                        planClientsCount (search: $search, city: $city, organization: $organization, district: $district)
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getPlanClient = async({client, organization}, client_)=>{
    try{
        client_ = client_? client_ : new SingletonApolloClient().getClient()
        let res = await client_
            .query({
                variables: {client, organization},
                query: gql`
                    query ($client: ID!, $organization: ID!) {
                        planClient(client: $client, organization: $organization) {
                            _id
                            createdAt
                            client {_id name address}
                            current
                            month
                            visit
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const setPlanClient = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {...element},
            mutation : gql`
                    mutation ($client: ID!, $organization: ID!, $month: Int!, $visit: Int!) {
                        setPlanClient(client: $client, organization: $organization, month: $month, visit: $visit) {
                            data
                        }
                    }`})
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const deletePlanClient = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {...element},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deletePlanClient(_id: $_id) {
                             data
                        }
                    }`})
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const uploadPlanClients = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {...element},
            mutation : gql`
                    mutation ($document: Upload!, $organization: ID!) {
                        uploadPlanClients(document: $document, organization: $organization) {
                             data
                        }
                    }`})
        return res.data
    } catch(err){
        console.error(err)
    }
}
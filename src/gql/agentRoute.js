import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getAgentRoutes = async({search, organization}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {search, organization: organization},
                query: gql`
                    query ($organization: ID, $search: String!) {
                        agentRoutes(organization: $organization, search: $search) {
                            _id
                            createdAt
                            organization
                                {_id name}
                            district
                                {_id name}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getDistrictsWithoutAgentRoutes = async({organization}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization: organization},
                query: gql`
                    query ($organization: ID) {
                        districtsWithoutAgentRoutes(organization: $organization) {
                            _id
                            createdAt
                            name
                            organization
                                {_id name}
                            client
                                { 
                                    _id
                                    image
                                    createdAt
                                    name
                                    address
                                    lastActive
                                    category
                                    device
                                    notification
                                    city
                                    phone
                                    user 
                                        {status}
                                }
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getAgentRoute = async({_id}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {_id: _id},
                query: gql`
                    query ($_id: ID!) {
                        agentRoute(_id: $_id) {
                            _id
                            createdAt
                            organization
                                {_id name}
                            district
                                {
                                    _id 
                                    name
                                    client
                                        { 
                                            _id
                                            image
                                            createdAt
                                            name
                                            address
                                            lastActive
                                            category
                                            device
                                            notification
                                            city
                                            phone
                                            user 
                                                {status}
                                        }
                                }
                            clients
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const deleteAgentRoute = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        deleteAgentRoute(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const addAgentRoute = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($organization: ID, $clients: [[ID]]!, $district: ID) {
                        addAgentRoute(organization: $organization, clients: $clients, district: $district) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const setAgentRoute = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($_id: ID!, $clients: [[ID]]) {
                        setAgentRoute(_id: $_id, clients: $clients) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}
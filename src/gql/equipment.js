import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getUnloadEquipments = async({organization}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization},
                query: gql`
                    query ($organization: ID!) {
                        unloadEquipments(organization: $organization) {
                            data
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getEquipments = async({organization, search, agent}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization, search, agent},
                query: gql`
                    query ($organization: ID!, $search: String!, $agent: ID) {
                        equipments(organization: $organization, search: $search, agent: $agent) {
                            _id
                            createdAt
                            number
                            model
                            client 
                                {name _id address}
                            agent
                                {_id name}
                            organization
                                {_id name}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const deleteEquipment = async(_id)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteEquipment(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const setEquipment = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($_id: ID!, $client: ID, $number: String, $model: String, $agent: ID) {
                        setEquipment(_id: $_id, client: $client, number: $number, model: $model, agent: $agent) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const addEquipment = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($organization: ID, $client: ID, $number: String!, $model: String!, $agent: ID) {
                        addEquipment(organization: $organization, client: $client, number: $number, model: $model, agent: $agent) {
                            _id
                            createdAt
                            number
                            model
                            client 
                                {name _id address}
                            agent
                                {_id name}
                            organization
                                {_id name}
                        }
                    }`})
        return res.data
    } catch(err){
        console.error(err)
    }
}
import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getAutos = async({search, sort, organization: organization}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {search, sort, organization: organization},
                query: gql`
                    query ($organization: ID!, $search: String!, $sort: String!) {
                        autos(organization: $organization, search: $search, sort: $sort) {
                            _id
                            number
                            tonnage
                            size
                            createdAt
                            employment 
                                {_id name}
                            organization 
                                {_id name}
                          }
                          sortAuto {
                           name
                            field
                          }
                          filterAuto {
                           name
                           value
                          }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getAuto = async({_id: _id}, client)=> {
    try {
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {_id: _id},
                query: gql`
                    query ($_id: ID!) {
                        auto(_id: $_id) {
                            _id
                            number
                            tonnage
                            size
                            createdAt
                            employment 
                                {_id name}
                            organization 
                                {_id name}
                        }
                    }`,
            })
        return res.data
    } catch (err) {
        console.error(err)
    }
}

export const deleteAuto = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        deleteAuto(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const setAuto = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($_id: ID!, $tonnage: Float, $size: Float, $number: String, $employment: ID) {
                        setAuto(_id: $_id, tonnage: $tonnage, size: $size, number: $number, employment: $employment) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const addAuto = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        let res = await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($tonnage: Float!, $size: Float!, $number: String!, $organization: ID, $employment: ID) {
                        addAuto(tonnage: $tonnage, size: $size, number: $number, organization: $organization, employment: $employment) {
                            _id
                            number
                            tonnage
                            size
                            createdAt
                            employment 
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
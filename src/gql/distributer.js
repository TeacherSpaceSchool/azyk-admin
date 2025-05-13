import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';
import { SingletonStore } from '../singleton/store';

export const getDistributers = async({search, sort}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {search, sort},
                query: gql`
                    query ($sort: String!, $search: String!) {
                        distributers(sort: $sort, search: $search) {
                            _id
                            createdAt
                            distributer
                                {_id name}
                            sales
                                {_id name}
                            provider
                                {_id name}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getDistributer = async({_id}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {_id: _id},
                query: gql`
                    query ($_id: ID!) {
                        distributer(_id: $_id) {
                            _id
                            createdAt
                            distributer
                                {_id name}
                            sales
                                {_id name}
                            provider
                                {_id name}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const deleteDistributer = async(ids, distributer)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        deleteDistributer(_id: $_id) {
                             data
                        }
                    }`})
        return await getDistributers({distributer: distributer, ...(new SingletonStore().getStore().getState().app)})
    } catch(err){
        console.error(err)
    }
}

export const addDistributer = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($distributer: ID!, $sales: [ID], $provider: [ID]) {
                        addDistributer(distributer: $distributer, sales: $sales, provider: $provider) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const setDistributer = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($_id: ID!, $sales: [ID], $provider: [ID]) {
                        setDistributer(_id: $_id, sales: $sales, provider: $provider) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}
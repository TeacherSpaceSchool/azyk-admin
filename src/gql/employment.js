import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';
import { SingletonStore } from '../singleton/store';

export const getEmploymentsTrash = async({search}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {search},
                query: gql`
                    query ($search: String!) {
                        employmentsTrash(search: $search) {
                            _id
                            createdAt
                            name
                            email
                            del
                            phone
                            user 
                                {_id role status login}
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

export const getEmployments = async({organization, search, sort, filter: filter}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization: organization, search, sort, filter: filter},
                query: gql`
                    query ($organization: ID, $search: String!, $sort: String!, $filter: String!) {
                        employments(organization: $organization, search: $search, sort: $sort, filter: $filter) {
                            _id
                            createdAt
                            name
                            email
                            phone
                            user 
                                {_id role status login}
                            organization 
                                {_id name}
                          }
                          sortEmployment {
                           name
                            field
                          }
                          filterEmployment {
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

export const getEmployment = async({_id: _id}, client)=> {
    try {
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {_id: _id},
                query: gql`
                    query ($_id: ID!) {
                        employment(_id: $_id) {
                            _id
                            createdAt
                            name
                            email
                            phone
                            user 
                                {_id role status login}
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

export const getManagers = async({_id: _id}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {_id: _id},
                query: gql`
                    query ($_id: ID) {
                        managers(_id: $_id) {
                            _id
                            createdAt
                            name
                            email
                            phone
                            user 
                                {_id role status login}
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

export const getEcspeditors = async({_id: _id}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {_id: _id},
                query: gql`
                    query ($_id: ID) {
                        ecspeditors(_id: $_id) {
                            _id
                            createdAt
                            name
                            email
                            phone
                            user 
                                {_id role status login}
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

export const getAgents = async({_id: _id}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {_id: _id},
                query: gql`
                    query ($_id: ID) {
                        agents(_id: $_id) {
                            _id
                            createdAt
                            name
                            email
                            phone
                            user 
                                {_id role status login}
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

export const onoffEmployment = async(ids, organization)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        onoffEmployment(_id: $_id) {
                             data
                        }
                    }`})
        if(organization)
            return await getEmployments({organization: organization, ...(new SingletonStore().getStore().getState().app)})
    } catch(err){
        console.error(err)
    }
}

export const restoreEmployment = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        restoreEmployment(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const deleteEmployment = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        deleteEmployment(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const setEmployments = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($_id: ID!, $name: String, $email: String, $newPass: String, $role: String, $phone: [String], $login: String) {
                        setEmployment(_id: $_id, name: $name, email: $email, newPass: $newPass, role: $role, phone: $phone, login: $login) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const addEmployment = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($name: String!, $email: String!, $phone: [String]!, $login: String!, $password: String!, $role: String!, $organization: ID) {
                        addEmployment(name: $name, email: $email, phone: $phone, login: $login, password: $password, role: $role, organization: $organization) {
                             data
                        }
                    }`})
        //return await getEmployments(new SingletonStore().getStore().getState().app)
    } catch(err){
        console.error(err)
    }
}
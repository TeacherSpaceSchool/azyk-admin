import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';
import { SingletonStore } from '../singleton/store';
import { getReceiveDataByIndex, putReceiveDataByIndex } from '../service/idb/receiveData';

const Client = `
    _id
    image
    createdAt
    updatedAt
    lastActive
    name
    inn
    email
    address
    info
    city
    category
    phone
    user {_id role status login}
    network {_id name}
`

export const getClientsSync = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $organization: ID!, $skip: Int!, $city: String) {
                        clientsSync(search: $search, organization: $organization, skip: $skip, city: $city) {${Client}}
                    }`,
            })
        return res.data.clientsSync
    } catch(err) {
        console.error(err)
    }
}

export const getClientsSyncStatistic = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $organization: ID!, $city: String) {
                        clientsSyncStatistic(search: $search, organization: $organization, city: $city) 
                    }`,
            })
        return res.data.clientsSyncStatistic
    } catch(err) {
        console.error(err)
    }
}

export const getClients = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $sort: String!, $filter: String!, $date: String, $skip: Int, $city: String, $catalog: Boolean, $district: ID, $network: ID) {
                        clients(search: $search, sort: $sort, filter: $filter, date: $date, skip: $skip, city: $city, catalog: $catalog, district: $district, network: $network) {${Client}}
                    }`,
            })
        if(new SingletonStore().getStore()&&new SingletonStore().getStore().getState().user.profile.role&&new SingletonStore().getStore().getState().user.profile.role.includes('агент'))
            await putReceiveDataByIndex(`clients(search: ${variables.search}, sort: ${variables.sort}, filter: ${variables.filter}, date: ${variables.date}, skip: ${variables.skip})`, res.data.clients)
        return res.data.clients
    } catch(err) {
        console.error(err)
        if(new SingletonStore().getStore()&&new SingletonStore().getStore().getState().user.profile.role&&new SingletonStore().getStore().getState().user.profile.role.includes('агент'))
            return await getReceiveDataByIndex(`clients(search: ${variables.search}, sort: ${variables.sort}, filter: ${variables.filter}, date: ${variables.date}, skip: ${variables.skip})`)
    }
}

export const getClientsSimpleStatistic = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $filter: String!, $date: String, $city: String, $network: ID) {
                        clientsSimpleStatistic(search: $search, filter: $filter, date: $date, city: $city, network: $network)
                    }`,
            })
        return res.data.clientsSimpleStatistic
    } catch(err) {
        console.error(err)
    }
}

export const getClientsWithoutDistrict = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID, $district: ID, $city: String) {
                        clientsWithoutDistrict(organization: $organization, district: $district, city: $city) {${Client}}
                    }`,
            })
        return res.data.clientsWithoutDistrict
    } catch(err) {
        console.error(err)
    }
}

export const getClient = async (_id, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {_id},
                query: gql`
                    query ($_id: ID!) {
                        client(_id: $_id) {${Client}}
                    }`,
            })
        if(new SingletonStore().getStore()&&new SingletonStore().getStore().getState().user.profile.role&&new SingletonStore().getStore().getState().user.profile.role.includes('агент'))
            await putReceiveDataByIndex(`client(_id: ${_id})`, res.data.client)
        return res.data.client
    } catch(err) {
        console.error(err)
        if(new SingletonStore().getStore()&&new SingletonStore().getStore().getState().user.profile.role&&new SingletonStore().getStore().getState().user.profile.role.includes('агент'))
            return await getReceiveDataByIndex(`client(_id: ${_id})`)
    }
}

export const setClient = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $network: ID, $phone: [String], $login: String, $device: String, $category: String, $city: String, $image: Upload, $name: String, $inn: String, $email: String, $address: [[String]], $info: String, $newPass: String) {
                        setClient(_id: $_id, network: $network, device: $device, phone: $phone, login: $login, category: $category, city: $city, image: $image, name: $name, inn: $inn, email: $email, address: $address, info: $info, newPass: $newPass)
                    }`})
        return res.data.setClient
    } catch(err) {
        console.error(err)
    }
}

export const addClient = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($image: Upload, $network: ID, $name: String!, $inn: String, $email: String, $category: String!, $city: String!, $address: [[String]]!, $phone: [String]!, $password: String!, $info: String, $login: String!) {
                        addClient(image: $image, network: $network, name: $name, inn: $inn, email: $email, category: $category, city: $city, address: $address, phone: $phone, password: $password, info: $info, login: $login)
                    }`})
        return res.data.addClient
    } catch(err) {
        console.error(err)
    }
}

export const onoffClient = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        onoffClient(_id: $_id)
                    }`})
        return res.data.onoffClient
    } catch(err) {
        console.error(err)
    }
}

export const clearClientsSync = async (organization) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {organization},
            mutation : gql`
                    mutation ($organization: ID!) {
                        clearClientsSync(organization: $organization)
                    }`})
        return res.data.clearClientsSync
    } catch(err) {
        console.error(err)
    }
}

export const deleteClient = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteClient(_id: $_id)
                    }`})
        return res.data.deleteClient
    } catch(err) {
        console.error(err)
    }
}
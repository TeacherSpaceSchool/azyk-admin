import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const Organization = `
    _id
    createdAt
    name
    dateDelivery
    image
    address
    email
    phone
    info
    miniInfo
    status
    minimumOrder
    agentHistory
    refusal
    catalog
    priotiry
    unite
    superagent
    onlyDistrict
    addedClient
    agentSubBrand
    clientSubBrand
    onlyIntegrate
    dateDelivery
    autoAcceptAgent
    autoAcceptNight
    calculateStock
    clientDuplicate
    divideBySubBrand
    warehouse
    pass
    cities
`

export const getOrganization = async (_id, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {_id},
                query: gql`
                    query ($_id: ID!) {
                        organization(_id: $_id) {${Organization}}
                    }`,
            })
        return res.data.organization
    } catch(err) {
        console.error(err)
    }
}

export const getOrganizations = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $filter: String!, $city: String) {
                        organizations(search: $search, filter: $filter, city: $city) {${Organization}}
                    }`,
            })
        return res.data.organizations
    } catch(err) {
        console.error(err)
    }
}

export const deleteOrganization = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteOrganization(_id: $_id)
                    }`})
        return res.data.deleteOrganization
    } catch(err) {
        console.error(err)
    }
}

export const onoffOrganization = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        onoffOrganization(_id: $_id)
                    }`})
        return res.data.onoffOrganization
    } catch(err) {
        console.error(err)
    }
}

export const addOrganization = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($cities: [String]!, $catalog: Upload, $miniInfo: String!, $image: Upload!, $priotiry: Int, $minimumOrder: Int, $agentHistory: Int, $name: String!, $address: [String]!, $email: [String]!, $phone: [String]!, $info: String!, $refusal: Boolean!, $unite: Boolean!, $superagent: Boolean!, $onlyDistrict: Boolean!, $addedClient: Boolean!, $agentSubBrand: Boolean!, $clientSubBrand: Boolean!, $onlyIntegrate: Boolean!, $autoAcceptAgent: Boolean!, $autoAcceptNight: Boolean!, $calculateStock: Boolean!, $clientDuplicate: Boolean!, $divideBySubBrand: Boolean!, $dateDelivery: Boolean!, $warehouse: String!, $pass: String) {
                        addOrganization(cities: $cities, catalog: $catalog, miniInfo: $miniInfo, image: $image, priotiry: $priotiry, minimumOrder: $minimumOrder,  agentHistory: $agentHistory, name: $name, address: $address, email: $email, phone: $phone, info: $info, refusal: $refusal, unite: $unite, superagent: $superagent, onlyDistrict: $onlyDistrict, addedClient: $addedClient, agentSubBrand: $agentSubBrand, clientSubBrand: $clientSubBrand, onlyIntegrate: $onlyIntegrate, autoAcceptAgent: $autoAcceptAgent, autoAcceptNight: $autoAcceptNight, calculateStock: $calculateStock, clientDuplicate: $clientDuplicate, divideBySubBrand: $divideBySubBrand, dateDelivery: $dateDelivery, warehouse: $warehouse, pass: $pass)
                    }`})
        return res.data.addOrganization
    } catch(err) {
        console.error(err)
    }
}

export const setOrganization = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($cities: [String], $catalog: Upload, $miniInfo: String, $_id: ID!, $refusal: Boolean, $priotiry: Int, $image: Upload, $minimumOrder: Int, $agentHistory: Int, $name: String, $address: [String], $email: [String], $phone: [String], $info: String, $unite: Boolean, $superagent: Boolean, $onlyDistrict: Boolean, $addedClient: Boolean, $agentSubBrand: Boolean, $clientSubBrand: Boolean, $onlyIntegrate: Boolean, $autoAcceptAgent: Boolean, $autoAcceptNight: Boolean, $calculateStock: Boolean, $clientDuplicate: Boolean, $divideBySubBrand: Boolean, $dateDelivery: Boolean, $warehouse: String, $pass: String) {
                        setOrganization(cities: $cities, catalog: $catalog, miniInfo: $miniInfo, _id: $_id, priotiry: $priotiry, refusal: $refusal, image: $image, minimumOrder: $minimumOrder, agentHistory: $agentHistory, name: $name, address: $address, unite: $unite, superagent: $superagent, email: $email, phone: $phone, info: $info, addedClient: $addedClient, agentSubBrand: $agentSubBrand, clientSubBrand: $clientSubBrand, onlyDistrict: $onlyDistrict, onlyIntegrate: $onlyIntegrate, divideBySubBrand: $divideBySubBrand, autoAcceptAgent: $autoAcceptAgent, autoAcceptNight: $autoAcceptNight, calculateStock: $calculateStock, clientDuplicate: $clientDuplicate, dateDelivery: $dateDelivery, warehouse: $warehouse, pass: $pass) 
                    }`})
        return res.data.setOrganization
    } catch(err) {
        console.error(err)
    }
}
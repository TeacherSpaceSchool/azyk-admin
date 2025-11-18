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
    calculateConsig
    clientDuplicate
    divideBySubBrand
    warehouse
    pass
    cities
    requisites
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

const args1 = (r) => `$cities: [String]${r?'!':''}, $catalog: Upload, $miniInfo: String${r?'!':''}, $image: Upload${r?'!':''}, $priotiry: Int, $minimumOrder: Int, `+
    `$agentHistory: Int, $name: String${r?'!':''}, $address: [String]${r?'!':''}, $email: [String]${r?'!':''}, $phone: [String]${r?'!':''}, $info: String${r?'!':''}, `+
    `$refusal: Boolean${r?'!':''}, $unite: Boolean${r?'!':''}, $superagent: Boolean${r?'!':''}, $onlyDistrict: Boolean${r?'!':''}, $addedClient: Boolean${r?'!':''}, `+
    `$agentSubBrand: Boolean${r?'!':''}, $clientSubBrand: Boolean${r?'!':''}, $onlyIntegrate: Boolean${r?'!':''}, $autoAcceptAgent: Boolean${r?'!':''}, `+
    `$autoAcceptNight: Boolean${r?'!':''}, $calculateStock: Boolean${r?'!':''}, $calculateConsig: Boolean${r?'!':''}, $clientDuplicate: Boolean${r?'!':''}, `+
    `$divideBySubBrand: Boolean${r?'!':''}, $dateDelivery: Boolean${r?'!':''}, $warehouse: String${r?'!':''}, $pass: String, $requisites: String`
const args2 = 'cities: $cities, catalog: $catalog, miniInfo: $miniInfo, image: $image, priotiry: $priotiry, minimumOrder: $minimumOrder,  agentHistory: $agentHistory, '+
    'name: $name, address: $address, email: $email, phone: $phone, info: $info, refusal: $refusal, unite: $unite, superagent: $superagent, onlyDistrict: $onlyDistrict, '+
    'addedClient: $addedClient, agentSubBrand: $agentSubBrand, clientSubBrand: $clientSubBrand, onlyIntegrate: $onlyIntegrate, autoAcceptAgent: $autoAcceptAgent, '+
    'autoAcceptNight: $autoAcceptNight, calculateStock: $calculateStock, calculateConsig: $calculateConsig, clientDuplicate: $clientDuplicate, '+
    'divideBySubBrand: $divideBySubBrand, dateDelivery: $dateDelivery, warehouse: $warehouse, pass: $pass, requisites: $requisites'

export const addOrganization = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation (${args1(true)}) {
                        addOrganization(${args2})
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
                    mutation ($_id: ID!, ${args1()}) {
                        setOrganization(_id: $_id, ${args2}) 
                    }`})
        return res.data.setOrganization
    } catch(err) {
        console.error(err)
    }
}
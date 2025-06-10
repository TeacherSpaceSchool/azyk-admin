import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getOrganization = async({_id: _id}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {_id: _id},
                query: gql`
                    query ($_id: ID!) {
                        organization(_id: $_id) {
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
                            accessToClient
                            consignation
                            refusal
                            catalog
                            priotiry
                            unite
                            superagent
                            onlyDistrict
                            addedClient
                            agentSubBrand
                            clientSubBrand
                            autoIntegrate
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
                          }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getOrganizations = async({search, filter, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {search, filter, city},
                query: gql`
                    query ($search: String!, $filter: String!, $city: String) {
                        organizations(search: $search, filter: $filter, city: $city) {
                            name
                            _id
                            image
                            miniInfo
                          }
                          filterOrganization {
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

export const getOrganizationsTrash = async({search}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {search},
                query: gql`
                    query ($search: String!) {
                        organizationsTrash(search: $search) {
                            name
                            _id
                            image
                            miniInfo
                          }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const deleteOrganization = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        deleteOrganization(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const restoreOrganization = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        restoreOrganization(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const onoffOrganization = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        onoffOrganization(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const addOrganization = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($cities: [String]!, $catalog: Upload, $miniInfo: String!, $image: Upload!, $priotiry: Int, $minimumOrder: Int, $agentHistory: Int, $name: String!, $address: [String]!, $email: [String]!, $phone: [String]!, $info: String!, $consignation: Boolean!, $refusal: Boolean!, $accessToClient: Boolean!, $unite: Boolean!, $superagent: Boolean!, $onlyDistrict: Boolean!, $addedClient: Boolean!, $agentSubBrand: Boolean!, $clientSubBrand: Boolean!, $autoIntegrate: Boolean!, $onlyIntegrate: Boolean!, $autoAcceptAgent: Boolean!, $autoAcceptNight: Boolean!, $calculateStock: Boolean!, $clientDuplicate: Boolean!, $divideBySubBrand: Boolean!, $dateDelivery: Boolean!, $warehouse: String!, $pass: String) {
                        addOrganization(cities: $cities, catalog: $catalog, miniInfo: $miniInfo, image: $image, priotiry: $priotiry, minimumOrder: $minimumOrder,  agentHistory: $agentHistory, name: $name, address: $address, email: $email, phone: $phone, info: $info, consignation: $consignation, refusal: $refusal, unite: $unite, superagent: $superagent, accessToClient: $accessToClient, onlyDistrict: $onlyDistrict, addedClient: $addedClient, agentSubBrand: $agentSubBrand, clientSubBrand: $clientSubBrand, autoIntegrate: $autoIntegrate, onlyIntegrate: $onlyIntegrate, autoAcceptAgent: $autoAcceptAgent, autoAcceptNight: $autoAcceptNight, calculateStock: $calculateStock, clientDuplicate: $clientDuplicate, divideBySubBrand: $divideBySubBrand, dateDelivery: $dateDelivery, warehouse: $warehouse, pass: $pass) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const setOrganization = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($cities: [String], $catalog: Upload, $miniInfo: String, $_id: ID!, $consignation: Boolean, $refusal: Boolean, $priotiry: Int, $accessToClient: Boolean, $image: Upload, $minimumOrder: Int, $agentHistory: Int, $name: String, $address: [String], $email: [String], $phone: [String], $info: String, $unite: Boolean, $superagent: Boolean, $onlyDistrict: Boolean, $addedClient: Boolean, $agentSubBrand: Boolean, $clientSubBrand: Boolean, $autoIntegrate: Boolean, $onlyIntegrate: Boolean, $autoAcceptAgent: Boolean, $autoAcceptNight: Boolean, $calculateStock: Boolean, $clientDuplicate: Boolean, $divideBySubBrand: Boolean, $dateDelivery: Boolean, $warehouse: String, $pass: String) {
                        setOrganization(cities: $cities, catalog: $catalog, miniInfo: $miniInfo, _id: $_id, priotiry: $priotiry, consignation: $consignation, refusal: $refusal, accessToClient: $accessToClient, image: $image, minimumOrder: $minimumOrder, agentHistory: $agentHistory, name: $name, address: $address, unite: $unite, superagent: $superagent, email: $email, phone: $phone, info: $info, addedClient: $addedClient, agentSubBrand: $agentSubBrand, clientSubBrand: $clientSubBrand, autoIntegrate: $autoIntegrate, onlyDistrict: $onlyDistrict, onlyIntegrate: $onlyIntegrate, divideBySubBrand: $divideBySubBrand, autoAcceptAgent: $autoAcceptAgent, autoAcceptNight: $autoAcceptNight, calculateStock: $calculateStock, clientDuplicate: $clientDuplicate, dateDelivery: $dateDelivery, warehouse: $warehouse, pass: $pass) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}
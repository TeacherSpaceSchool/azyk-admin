import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const SubBrand = `
    _id
    createdAt  
    image
    miniInfo
    priotiry
    status
    cities
    minimumOrder
    guid
    name
    organization {_id name}
`

export const getSubBrands = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID, $search: String!, $city: String) {
                        subBrands(organization: $organization, search: $search, city: $city) {${SubBrand}}
                    }`,
            })
        return res.data.subBrands
    } catch(err) {
        console.error(err)
    }
}

export const getSubBrand = async (_id, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {_id},
                query: gql`
                    query ($_id: ID!) {
                        subBrand(_id: $_id) {${SubBrand}}
                    }`,
            })
        return res.data.subBrand
    } catch(err) {
        console.error(err)
    }
}

export const deleteSubBrand = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteSubBrand(_id: $_id)
                    }`})
        return res.data.deleteSubBrand
    } catch(err) {
        console.error(err)
    }
}

export const onoffSubBrand = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        onoffSubBrand(_id: $_id)
                    }`})
        return res.data.onoffSubBrand
    } catch(err) {
        console.error(err)
    }
}

export const addSubBrand = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($minimumOrder: Int, $image: Upload!, $name: String!, $guid: String!, $miniInfo: String!, $priotiry: Int, $organization: ID!) {
                        addSubBrand(minimumOrder: $minimumOrder, image: $image, name: $name, guid: $guid, miniInfo: $miniInfo, priotiry: $priotiry, organization: $organization)
                    }`})
        return res.data.addSubBrand
    } catch(err) {
        console.error(err)
    }
}

export const setSubBrand = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($_id: ID!, $minimumOrder: Int, $image: Upload, $name: String, $guid: String, $miniInfo: String, $priotiry: Int) {
                        setSubBrand(_id: $_id, minimumOrder: $minimumOrder, image: $image, name: $name, guid: $guid, miniInfo: $miniInfo, priotiry: $priotiry) 
                    }`})
        return res.data.setSubBrand
    } catch(err) {
        console.error(err)
    }
}

export const setSubBrandForItems = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($subBrand: ID!, $selectedItems: [ID]!, $unselectedItems: [ID]!) {
                        setSubBrandForItems(subBrand: $subBrand, selectedItems: $selectedItems, unselectedItems: $unselectedItems) 
                    }`})
        return res.data.setSubBrandForItems
    } catch(err) {
        console.error(err)
    }
}
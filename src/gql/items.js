import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';
import { SingletonStore } from '../singleton/store';
import { getReceiveDataByIndex, putReceiveDataByIndex } from '../service/idb/receiveData';

const Item = `
    _id
    name
    status
    createdAt                  
    apiece
    unit
    priotiry
    image
    categorys
    price
    city
    subBrand {_id name}
    organization {_id name minimumOrder}
    hit
    latest
    packaging
    weight
`

export const getBrandOrganizations = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $filter: String!, $city: String) {
                        brandOrganizations(search: $search, filter: $filter, city: $city) {
                            name
                            _id
                            image
                            miniInfo
                            catalog
                            priotiry
                            type
                            unite
                            autoAcceptAgent
                            organization {_id}
                            createdAt
                            status
                        }
                    }`,
            })
        if(new SingletonStore().getStore()&&new SingletonStore().getStore().getState().user.profile.role&&new SingletonStore().getStore().getState().user.profile.role.includes('агент'))
            await putReceiveDataByIndex(`brandOrganizations(search: ${variables.search}, filter: ${variables.filter})`, res.data.brandOrganizations)
        return res.data.brandOrganizations
    } catch(err) {
        console.error(err)
        if(new SingletonStore().getStore()&&new SingletonStore().getStore().getState().user.profile.role&&new SingletonStore().getStore().getState().user.profile.role.includes('агент'))
            return await getReceiveDataByIndex(`brandOrganizations(search: ${variables.search}, filter: ${variables.filter})`)
    }
}

export const getItems = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID, $search: String!) {
                        items(organization: $organization, search: $search) {${Item}}
                    }`,
            })
        return res.data.items
    } catch(err) {
        console.error(err)
    }
}

export const getBrands = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!,$search: String!, $city: String) {
                        brands(organization: $organization, search: $search, city: $city) {${Item}}
                    }`,
            })
        if(new SingletonStore().getStore()&&new SingletonStore().getStore().getState().user.profile.role&&new SingletonStore().getStore().getState().user.profile.role.includes('агент'))
            await putReceiveDataByIndex(`brands(organization: ${variables.organization}, search: ${variables.search}, sort: ${variables.sort})`, res.data.brands)
        return res.data.brands
    } catch(err) {
        console.error(err)
        if(new SingletonStore().getStore()&&new SingletonStore().getStore().getState().user.profile.role&&new SingletonStore().getStore().getState().user.profile.role.includes('агент'))
            return await getReceiveDataByIndex(`brands(organization: ${variables.organization}, search: ${variables.search}, sort: ${variables.sort})`)
    }
}

export const getItem = async (_id, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {_id},
                query: gql`
                    query ($_id: ID!) {
                        item(_id: $_id) {${Item}}
                    }`,
            })
        return res.data.item
    } catch(err) {
        console.error(err)
    }
}

export const deleteItem = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteItem(_id: $_id)
                    }`})
        return res.data.deleteItem
    } catch(err) {
        console.error(err)
    }
}

export const onoffItem = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        onoffItem(_id: $_id)
                    }`})
        return res.data.onoffItem
    } catch(err) {
        console.error(err)
    }
}

export const addItem = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($subBrand: ID, $categorys: [String]!, $priotiry: Int, $city: String!, $unit: String, $apiece: Boolean, $weight: Float!, $packaging: Int!, $name: String!, $image: Upload, $price: Float!, $organization: ID!, $hit: Boolean!, $latest: Boolean!) {
                        addItem(subBrand: $subBrand, categorys: $categorys, priotiry: $priotiry, city: $city, unit: $unit, apiece: $apiece, weight: $weight, packaging: $packaging, name: $name, image: $image, price: $price, organization: $organization, hit: $hit, latest: $latest) 
                    }`})
        return res.data.addItem
    } catch(err) {
        console.error(err)
    }
}

export const setItem = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($categorys: [String], $subBrand: ID, $_id: ID!, $city: String, $priotiry: Int, $unit: String, $apiece: Boolean, $weight: Float, $packaging: Int, $name: String, $image: Upload, $price: Float, $organization: ID, $hit: Boolean, $latest: Boolean) {
                        setItem(categorys: $categorys, subBrand: $subBrand, _id: $_id, city: $city, priotiry: $priotiry, unit: $unit, apiece: $apiece, weight: $weight, packaging: $packaging, name: $name, image: $image, price: $price, organization: $organization, hit: $hit, latest: $latest)
                    }`})
        return res.data.setItem
    } catch(err) {
        console.error(err)
    }
}
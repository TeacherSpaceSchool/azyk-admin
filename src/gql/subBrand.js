import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getSubBrands = async({organization, search, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization, search, city},
                query: gql`
                    query ($organization: ID, $search: String!, $city: String) {
                        subBrands(organization: $organization, search: $search, city: $city) {
                            _id
                            createdAt  
                             image
                             miniInfo
                             priotiry
                             status
                             cities
                             minimumOrder
                             name
                            organization
                                {_id name consignation}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const deleteSubBrand = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        deleteSubBrand(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const onoffSubBrand = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        onoffSubBrand(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const addSubBrand = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        let res = await client.mutate({
            variables: {...element},
            mutation : gql`
                    mutation ($minimumOrder: Int, $image: Upload!, $name: String!, $miniInfo: String!, $priotiry: Int, $organization: ID!, $cities: [String]!) {
                        addSubBrand(minimumOrder: $minimumOrder, image: $image, name: $name, miniInfo: $miniInfo, priotiry: $priotiry, organization: $organization, cities: $cities) {
                             _id
                            createdAt  
                             image
                             miniInfo
                             minimumOrder
                             priotiry
                             status
                             cities
                             name
                            organization
                                {_id name consignation}
                        }
                    }`})
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const setSubBrand = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {...element},
            mutation : gql`
                    mutation ($_id: ID!, $minimumOrder: Int, $image: Upload, $name: String, $miniInfo: String, $priotiry: Int, $cities: [String]) {
                        setSubBrand(_id: $_id, minimumOrder: $minimumOrder, image: $image, name: $name, miniInfo: $miniInfo, priotiry: $priotiry, cities: $cities) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}
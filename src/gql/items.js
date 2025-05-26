import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';
import { SingletonStore } from '../singleton/store';
import { getReceiveDataByIndex, putReceiveDataByIndex } from '../service/idb/receiveData';

export const getBrandOrganizations = async({search, filter, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {search, filter, city},
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
                          }
                          filterOrganization {
                           name
                           value
                          }
                    }`,
            })
        if(new SingletonStore().getStore()&&new SingletonStore().getStore().getState().user.profile.role.includes('агент'))
            await putReceiveDataByIndex(`brandOrganizations(search: ${search}, filter: ${filter})`, res.data)
        return res.data
    } catch(err){
        console.error(err)
        if(new SingletonStore().getStore()&&new SingletonStore().getStore().getState().user.profile.role.includes('агент'))
            return await getReceiveDataByIndex(`brandOrganizations(search: ${search}, filter: ${filter})`)
    }
}

export const getPopularItems = async(client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                query: gql`
                    query {
                        popularItems {
                            _id
                            name    
                            image
                            organization
                                {_id}
                            hit
                            latest
                          }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getItems = async({organization, subCategory,  search,  sort}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization, subCategory, search, sort},
                query: gql`
                    query ($organization: ID, $subCategory: ID!,$search: String!, $sort: String!) {
                        items(organization: $organization, subCategory: $subCategory, search: $search, sort: $sort) {
                            _id
                            subCategory
                                {_id name}
                            name
                            status
                            createdAt                  
                            image
                            info
                            price
                            apiece
                            unit
                            priotiry
                            packaging
                            reiting
                            subBrand
                                {_id name}
                            organization
                                {_id name consignation}
                            hit
                            latest
                            costPrice
                        }
                        sortItem {
                            name
                            field
                        }
                        subCategory(_id: $subCategory) {
                           _id
                           name
                           category
                                {_id name}
                          }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getItemsTrash = async({search}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {search},
                query: gql`
                    query ($search: String!) {
                        itemsTrash( search: $search) {
                            _id
                            subCategory
                                {_id name}
                            name
                            status
                            createdAt                  
                            image
                            info
                            price
                            apiece
                            unit
                            priotiry
                            packaging
                            reiting
                            subBrand
                                {_id name}
                            organization
                                {_id name consignation}
                            hit
                            latest
                            del
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getBrands = async({organization,  search,  sort, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization: organization, search, sort, city},
                query: gql`
                    query ($organization: ID!,$search: String!, $sort: String!, $city: String) {
                        brands(organization: $organization, search: $search, sort: $sort, city: $city) {
                            _id
                            subCategory
                                {_id name}
                            name
                            status
                            createdAt                  
                            apiece
                            unit
                            priotiry
                            subBrand
                                {_id name}
                            packaging
                            image
                            info
                            price
                            reiting
                            organization
                                {_id name info image consignation}
                            hit
                            latest
                            costPrice
                        }
                        sortItem {
                            name
                            field
                        }
                    }`,
            })
        if(new SingletonStore().getStore()&&new SingletonStore().getStore().getState().user.profile.role.includes('агент'))
            await putReceiveDataByIndex(`brands(organization: ${organization}, search: ${search}, sort: ${sort})`, res.data)
        return res.data
    } catch(err){
        console.error(err)
        if(new SingletonStore().getStore()&&new SingletonStore().getStore().getState().user.profile.role.includes('агент'))
            return await getReceiveDataByIndex(`brands(organization: ${organization}, search: ${search}, sort: ${sort})`)
    }
}

export const getItem = async({_id}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {_id: _id},
                query: gql`
                    query ($_id: ID!) {
                        item(_id: $_id) {
                            _id
                            subCategory
                                {
                                    _id 
                                    name 
                                    category
                                        {_id name}
                                }
                            name
                            status
                            createdAt                  
                            apiece
                            unit
                            priotiry
                            image
                            categorys
                            info
                            price
                            city
                            costPrice
                            subBrand
                                {_id name}
                            reiting
                            organization
                                {_id name minimumOrder consignation}
                            hit
                            latest
                            packaging
                            weight
                            size
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const deleteItem = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        deleteItem(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const restoreItem = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        restoreItem(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const onoffItem = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        onoffItem(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const addItem = async(element, subCategory)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {...element, subCategory: subCategory},
            mutation : gql`
                    mutation ($costPrice: Float, $subBrand: ID, $categorys: [String]!, $priotiry: Int, $city: String!, $unit: String, $apiece: Boolean, $weight: Float!, $size: Float!, $packaging: Int!, $name: String!, $image: Upload, $info: String!, $price: Float!, $subCategory: ID!, $organization: ID!, $hit: Boolean!, $latest: Boolean!) {
                        addItem(costPrice: $costPrice, subBrand: $subBrand, categorys: $categorys, priotiry: $priotiry, city: $city, unit: $unit, apiece: $apiece, weight: $weight, size: $size, packaging: $packaging, name: $name, image: $image, info: $info, price: $price, subCategory: $subCategory, organization: $organization, hit: $hit, latest: $latest) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const setItem = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {...element},
            mutation : gql`
                    mutation ($costPrice: Float, $categorys: [String], $subBrand: ID, $_id: ID!, $city: String, $priotiry: Int, $unit: String, $apiece: Boolean, $weight: Float, $size: Float, $packaging: Int, $name: String, $image: Upload, $info: String, $price: Float, $subCategory: ID, $organization: ID, $hit: Boolean, $latest: Boolean) {
                        setItem(costPrice: $costPrice, categorys: $categorys, subBrand: $subBrand, _id: $_id, city: $city, priotiry: $priotiry, unit: $unit, apiece: $apiece, weight: $weight, size: $size, packaging: $packaging, name: $name, image: $image, info: $info, price: $price, subCategory: $subCategory, organization: $organization, hit: $hit, latest: $latest) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const setItemsCostPrice = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($itemsCostPrice: [InputItemCostPrice]!) {
                        setItemsCostPrice(itemsCostPrice: $itemsCostPrice) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}
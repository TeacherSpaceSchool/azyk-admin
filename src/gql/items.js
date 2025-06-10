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

export const getItems = async({organization,  search,  sort}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization, search, sort},
                query: gql`
                    query ($organization: ID, $search: String!, $sort: String!) {
                        items(organization: $organization, search: $search, sort: $sort) {
                            _id
                            name
                            status
                            createdAt                  
                            image
                            price
                            apiece
                            unit
                            priotiry
                            packaging
                            subBrand
                                {_id name}
                            organization
                                {_id name consignation}
                            hit
                            latest
                        }
                        sortItem {
                            name
                            field
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
                            name
                            status
                            createdAt                  
                            image
                            price
                            apiece
                            unit
                            priotiry
                            packaging
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
                            price
                            organization
                                {_id name info image consignation}
                            hit
                            latest
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
                            subBrand
                                {_id name}
                            organization
                                {_id name minimumOrder consignation}
                            hit
                            latest
                            packaging
                            weight
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

export const addItem = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {...element},
            mutation : gql`
                    mutation ($subBrand: ID, $categorys: [String]!, $priotiry: Int, $city: String!, $unit: String, $apiece: Boolean, $weight: Float!, $packaging: Int!, $name: String!, $image: Upload, $price: Float!, $organization: ID!, $hit: Boolean!, $latest: Boolean!) {
                        addItem(subBrand: $subBrand, categorys: $categorys, priotiry: $priotiry, city: $city, unit: $unit, apiece: $apiece, weight: $weight, packaging: $packaging, name: $name, image: $image, price: $price, organization: $organization, hit: $hit, latest: $latest) {
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
                    mutation ($categorys: [String], $subBrand: ID, $_id: ID!, $city: String, $priotiry: Int, $unit: String, $apiece: Boolean, $weight: Float, $packaging: Int, $name: String, $image: Upload, $price: Float, $organization: ID, $hit: Boolean, $latest: Boolean) {
                        setItem(categorys: $categorys, subBrand: $subBrand, _id: $_id, city: $city, priotiry: $priotiry, unit: $unit, apiece: $apiece, weight: $weight, packaging: $packaging, name: $name, image: $image, price: $price, organization: $organization, hit: $hit, latest: $latest) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}
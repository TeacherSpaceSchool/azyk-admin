import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getAdsOrganizations = async(client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                query: gql`
                    query {
                        adsOrganizations {
                            _id
                            image
                            name
                          }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getAds = async()=>{
    try{
        const client = new SingletonApolloClient().getClient()
        let res = await client
            .query({
                query: gql`
                    query {
                        ads {
                            _id
                            xid
                            xidNumber
                            image
                            count
                            item
                                {
                                    _id
                                    name    
                                }
                            url
                            title
                            targetItems
                                {
                                    xids
                                    count  
                                    sum 
                                    type
                                    targetPrice
                                }
                            targetPrice
                            multiplier
                            targetType
                          }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getAdss = async(args, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: args,
                query: gql`
                    query ($search: String!, $organization: ID!) {
                        adss(search: $search, organization: $organization) {
                            _id
                            image
                            url
                            xid
                            xidNumber
                            title
                            count
                            item
                                {
                                    _id
                                    name    
                                }
                            targetItems
                                {
                                    xids
                                    count   
                                    sum
                                    type
                                    targetPrice
                                }
                            targetPrice
                            multiplier
                            targetType
                          }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getAdssTrash = async({search: search, organization: organization}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {search: search, organization: organization},
                query: gql`
                    query ($search: String!) {
                        adssTrash(search: $search) {
                            _id
                            image
                            url
                            xid
                            xidNumber
                            title
                            del
                            count
                            item
                                {
                                    _id
                                    name    
                                }
                            targetItems
                                {
                                    xids
                                    count 
                                    sum  
                                    type
                                    targetPrice
                                }
                            targetPrice
                            multiplier
                            targetType
                          }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const deleteAds = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        deleteAds(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const restoreAds = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        restoreAds(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const addAds = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        let res = await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($image: Upload!, $url: String!, $xid: String, $xidNumber: Int, $title: String!, $organization: ID!, $item: ID, $count: Int, $targetItems: [TargetItemInput], $targetPrice: Int, $multiplier: Boolean, $targetType: String) {
                        addAds(image: $image, url: $url, xid: $xid, xidNumber: $xidNumber, title: $title, organization: $organization, item: $item, count: $count, targetItems: $targetItems, targetPrice: $targetPrice, multiplier: $multiplier, targetType: $targetType) {
                            _id
                            image
                            url
                            xid
                            xidNumber
                            title
                            count
                            item
                                {
                                    _id
                                    name    
                                }
                            targetItems
                                {
                                    xids
                                    count   
                                    sum
                                    type
                                    targetPrice
                                }
                            targetPrice
                            multiplier
                            targetType
                        }
                    }`})
        return(res.data)
    } catch(err){
        console.error(err)
    }
}

export const setAds = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($xid: String, $xidNumber: Int, $_id: ID!, $image: Upload, $url: String, $title: String, $item: ID, $count: Int, $targetItems: [TargetItemInput], $targetPrice: Int, $multiplier: Boolean, $targetType: String) {
                        setAds(xid: $xid, xidNumber: $xidNumber, _id: $_id, image: $image, url: $url, title: $title, item: $item, count: $count, targetItems: $targetItems, targetPrice: $targetPrice, multiplier: $multiplier, targetType: $targetType) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}
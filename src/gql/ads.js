import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const Ads = `
    _id
    image
    url
    xid
    xidNumber
    title
    count
    item {_id name}
    targetItems {xids count sum type targetPrice}
    targetPrice
    multiplier
    targetType
`

export const getAdsOrganizations = async (client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
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
        return res.data.adsOrganizations
    } catch(err) {
        console.error(err)
    }
}

export const getAdss = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($search: String!, $organization: ID!, $skip: Int) {
                        adss(search: $search, organization: $organization, skip: $skip) {${Ads}}
                    }`,
            })
        return res.data.adss
    } catch(err) {
        console.error(err)
    }
}

export const addAds = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($image: Upload!, $url: String!, $xid: String, $xidNumber: Int, $title: String!, $organization: ID!, $item: ID, $count: Int, $targetItems: [TargetItemInput], $targetPrice: Int, $multiplier: Boolean, $targetType: String) {
                        addAds(image: $image, url: $url, xid: $xid, xidNumber: $xidNumber, title: $title, organization: $organization, item: $item, count: $count, targetItems: $targetItems, targetPrice: $targetPrice, multiplier: $multiplier, targetType: $targetType) {${Ads}}
                    }`})
        return res.data.addAds
    } catch(err) {
        console.error(err)
    }
}

export const setAds = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($xid: String, $xidNumber: Int, $_id: ID!, $image: Upload, $url: String, $title: String, $item: ID, $count: Int, $targetItems: [TargetItemInput], $targetPrice: Int, $multiplier: Boolean, $targetType: String) {
                        setAds(xid: $xid, xidNumber: $xidNumber, _id: $_id, image: $image, url: $url, title: $title, item: $item, count: $count, targetItems: $targetItems, targetPrice: $targetPrice, multiplier: $multiplier, targetType: $targetType)
                    }`})
        return res.data.setAds
    } catch(err) {
        console.error(err)
    }
}

export const deleteAds = async (_id) => {
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id},
            mutation : gql`
                    mutation ($_id: ID!) {
                        deleteAds(_id: $_id)
                    }`})
    } catch(err) {
        console.error(err)
    }
}
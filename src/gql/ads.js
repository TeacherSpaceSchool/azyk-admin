import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const Ads = `
    _id
    createdAt
    image
    url
    xid
    title
    count
    item {_id name}
    targetPrice
    paymentMethods
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
                    mutation ($image: Upload!, $url: String!, $xid: String, $title: String!, $organization: ID!, $item: ID!, $count: Int!, $targetPrice: Int!, $paymentMethods: [String]!) {
                        addAds(image: $image, url: $url, xid: $xid, title: $title, organization: $organization, item: $item, count: $count, targetPrice: $targetPrice, paymentMethods: $paymentMethods) {${Ads}}
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
                    mutation ($xid: String, $_id: ID!, $image: Upload, $url: String, $title: String, $item: ID, $count: Int, $targetPrice: Int, $paymentMethods: [String]) {
                        setAds(xid: $xid, _id: $_id, image: $image, url: $url, title: $title, item: $item, count: $count, targetPrice: $targetPrice, paymentMethods: $paymentMethods)
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
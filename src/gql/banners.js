import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const Banners = `
    _id
    createdAt
    images
`

export const getBanners = async (client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                query: gql`
                    query {
                        banners {${Banners}}
                    }`,
            })
        return res.data.banners
    } catch(err) {
        console.error(err)
    }
}

export const setBanners = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($deletedImages: [Upload]!, $uploads: [Upload]!) {
                        setBanners(deletedImages: $deletedImages, uploads: $uploads)
                    }`})
        return res.data.setBanners
    } catch(err) {
        console.error(err)
    }
}
import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getMerchandisings = async(args, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: args,
                query: gql`
                    query ($organization: ID!, $agent: ID, $client: ID, $search: String!, $date: String, $sort: String!, $filter: String!, $skip: Int) {
                        merchandisings(organization: $organization, agent: $agent, client: $client, date: $date, search: $search, sort: $sort, filter: $filter, skip: $skip) {
                            client 
                                {_id name address}
                            employment 
                                {_id name}
                            date 
                            stateProduct 
                            check
                            _id
                            type
                            fhos
                                {state}
                          }
                        sortMerchandising {
                            name
                            field
                        }
                        filterMerchandising {
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

export const getMerchandising = async(args, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: args,
                query: gql`
                    query ($_id: ID!) {
                        merchandising(_id: $_id) {
                            _id
                            date
                            employment
                                {_id name}
                            organization
                                {_id name}
                            client
                                {_id name address}
                            productAvailability
                            productInventory
                            type
                            productConditions
                            productLocation
                            images
                            geo
                            fhos
                                {type images layout state foreignProducts filling}
                            needFho
                            check
                            stateProduct
                            comment
                              reviewerScore
                              reviewerComment
                          }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const deleteMerchandising = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        deleteMerchandising(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const checkMerchandising = async({ids, reviewerScore, reviewerComment })=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids, reviewerScore, reviewerComment},
            mutation : gql`
                    mutation ($_id: ID!, $reviewerScore: Int, $reviewerComment: String) {
                        checkMerchandising(_id: $_id, reviewerScore: $reviewerScore, reviewerComment: $reviewerComment) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const addMerchandising = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($organization: ID!, $client: ID!, $type: String!, $geo: String, $productAvailability: [String]!, $productInventory: Boolean!, $productConditions: Int!, $productLocation: Int!, $images: [Upload]!, $fhos: [InputFho]!, $needFho: Boolean!, $stateProduct: Int!, $comment: String!) {
                        addMerchandising(organization: $organization, type: $type, geo: $geo, client: $client, productAvailability: $productAvailability, productInventory: $productInventory, productConditions: $productConditions, productLocation: $productLocation, images: $images, fhos: $fhos, needFho: $needFho, stateProduct: $stateProduct, comment: $comment) {
                            data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

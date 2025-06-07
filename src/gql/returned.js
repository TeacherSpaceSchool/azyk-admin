import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getReturnedsTrash = async(args, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: args,
                query: gql`
                    query ($search: String!,  $skip: Int) {
                        returnedsTrash(search: $search, skip: $skip) {
                            _id
                            createdAt
                            dateDelivery
                            updatedAt
                            items
                                {
                                    _id
                                    item
                                    count
                                    allPrice
                                    allTonnage
                                    allSize
                                    weight
                                    size
                                    price
                                }
                            allTonnage
                            allSize
                            client 
                                { 
                                    _id
                                    name
                                    email
                                    phone
                                    user 
                                        {_id }
                                }
                            allPrice
                            info
                            address
                            editor
                            number
                            confirmationForwarder
                            track
                            forwarder
                                {_id name}
                            district
                            agent
                                {_id name}
                            organization
                                {_id name}
                            cancelForwarder
                            sync
                            del
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getReturneds = async(args, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: args,
                query: gql`
                    query ($search: String!, $sort: String!, $date: String!, $skip: Int, $city: String) {
                        returneds(search: $search, sort: $sort, date: $date, skip: $skip, city: $city) {
                            _id
                            createdAt
                            dateDelivery
                            updatedAt
                            inv
                            items
                                {
                                    _id
                                    item
                                    count
                                    allPrice
                                    allTonnage
                                    allSize
                                    weight
                                    size
                                    price
                                }
                            allTonnage
                            allSize
                            client 
                                { 
                                    _id
                                    name
                                    email
                                    phone
                                    user 
                                        {_id }
                                }
                            allPrice
                            info
                            address
                            editor
                            number
                            confirmationForwarder
                            track
                            forwarder
                                {_id name}
                            district
                            agent
                                {_id name}
                            organization
                                {_id name}
                            cancelForwarder
                            sync
                            city
                        }
                        sortReturned {
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

export const getReturnedsFromDistrict = async(args, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: args,
                query: gql`
                    query ($organization: ID!, $district: ID!, $date: String!) {
                        returnedsFromDistrict(organization: $organization, date: $date, district: $district) {
                            _id
                            createdAt
                            dateDelivery
                            updatedAt
                            items
                                {
                                    _id
                                    item
                                    count
                                    allPrice
                                    allTonnage
                                    allSize
                                    weight
                                    size
                                    price
                                }
                            allTonnage
                            allSize
                            client 
                                { 
                                    _id
                                    name
                                    email
                                    phone
                                    user 
                                        {_id }
                                }
                            allPrice
                            info
                            address
                            editor
                            number
                            confirmationForwarder
                            track
                            forwarder
                                {_id name}
                            district
                            agent
                                {_id name}
                            organization
                                {_id name}
                            cancelForwarder
                            sync
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const setReturnedLogic = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($track: Int, $forwarder: ID, $returneds: [ID]!) {
                        setReturnedLogic(track: $track, forwarder: $forwarder, returneds: $returneds) {
                             data
                        }
                    }`})
        //return await getOrders(new SingletonStore().getStore().getState().app)
    } catch(err){
        console.error(err)
    }
}

export const getReturnedsTrashSimpleStatistic = async(args, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: args,
                query: gql`
                    query ($search: String!) {
                        returnedsTrashSimpleStatistic(search: $search) 
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getReturnedsSimpleStatistic = async(args, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: args,
                query: gql`
                    query ($search: String!, $date: String!, $city: String) {
                        returnedsSimpleStatistic(search: $search, date: $date, city: $city) 
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getReturnedHistorys = async(returned, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {returned: returned},
                query: gql`
                    query ($returned: ID!) {
                        returnedHistorys(returned: $returned) {
                            createdAt
                            editor
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const addReturned = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($dateDelivery: Date!, $unite: Boolean, $info: String, $inv: Boolean, $address: [[String]], $organization: ID!, $client: ID!, $items: [ReturnedItemsInput]) {
                        addReturned(dateDelivery: $dateDelivery, unite: $unite, info: $info, inv: $inv, address: $address, organization: $organization, client: $client, items: $items) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const deleteReturneds = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        deleteReturneds(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const restoreReturneds = async(ids)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: ids},
            mutation : gql`
                    mutation ($_id: [ID]!) {
                        restoreReturneds(_id: $_id) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const setReturned = async(element)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        let res = await client.mutate({
            variables: element,
            mutation : gql`
                    mutation ($items: [ReturnedItemsInput], $returned: ID, $confirmationForwarder: Boolean, $cancelForwarder: Boolean) {
                        setReturned(items: $items, returned: $returned, confirmationForwarder: $confirmationForwarder, cancelForwarder: $cancelForwarder) {
                            _id
                            createdAt
                            dateDelivery
                            updatedAt
                            items
                                {
                                    _id
                                    item
                                    count
                                    allPrice
                                    allTonnage
                                    allSize
                                    weight
                                    size
                                    price
                                }
                            allTonnage
                            allSize
                            client 
                                { 
                                    _id
                                    name
                                    email
                                    phone
                                    user 
                                        {_id }
                                }
                            allPrice
                            info
                            address
                            editor
                            number
                            confirmationForwarder
                            track
                            forwarder
                                {_id name}
                            district
                            agent
                                {_id name}
                            organization
                                {_id name}
                            cancelForwarder
                            sync
                        }
                    }`})
        return res.data.setReturned
    } catch(err){
        console.error(err)
    }
}
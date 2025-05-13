import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getRoutes = async({search, sort, filter, date, skip, organization}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {search, sort, filter: filter, date: date, skip: skip, organization: organization},
                query: gql`
                    query ($organization: ID, $search: String!, $sort: String!, $filter: String!, $date: String!, $skip: Int) {
                        routes(organization: $organization, search: $search, sort: $sort, filter: $filter, date: $date, skip: $skip) {
                            _id
                            createdAt
                            deliverys 
                                {tonnage lengthInMeters}
                            selectEcspeditor 
                                {name}
                            selectedOrders 
                                {_id}
                            dateDelivery
                            status
                            number
                            allTonnage
                        }
                        sortRoute {
                            name
                            field
                        }
                        filterRoute {
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

export const getRoute = async({_id}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {_id: _id},
                query: gql`
                    query ($_id: ID!) {
                        route(_id: $_id) {
                            _id
                            createdAt
                            deliverys {
                                legs
                                lengthInMeters
                                orders{
                                    _id
                                    agent 
                                        {_id name}
                                    createdAt
                                    updatedAt
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
                                    consignmentPrice
                                    returnedPrice
                                    info
                                    address
                                    paymentMethod
                                    discount
                                    adss
                                        { 
                                            _id
                                            title
                                        }
                                    editor
                                    number
                                    confirmationForwarder
                                    confirmationClient
                                    cancelClient
                                    district
                                    track
                                    forwarder
                                        {_id name}
                                    sale
                                        {_id name}
                                    provider
                                        {_id name}
                                    organization
                                        {_id name}
                                    cancelForwarder
                                    paymentConsignation
                                    taken
                                    sync
                                    dateDelivery
                                }
                                tonnage
                            }
                            provider {_id name}
                            selectProdusers {_id name}
                            selectDistricts {_id name}
                            selectEcspeditor {_id name}
                            selectAuto {_id number}
                            selectedOrders {
                                    _id
                                    agent 
                                        {_id name}
                                    createdAt
                                    updatedAt
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
                                    consignmentPrice
                                    returnedPrice
                                    info
                                    address
                                    paymentMethod
                                    discount
                                    adss
                                        { 
                                            _id
                                            title
                                        }
                                    editor
                                    number
                                    confirmationForwarder
                                    confirmationClient
                                    cancelClient
                                    district
                                    track
                                    forwarder
                                        {_id name}
                                    sale
                                        {_id name}
                                    provider
                                        {_id name}
                                    organization
                                        {_id name}
                                    cancelForwarder
                                    paymentConsignation
                                    taken
                                    sync
                                    dateDelivery
                                }
                            dateDelivery
                            status
                            number
                            allTonnage
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const listDownload = async(orders, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {orders: orders},
                query: gql`
                    query ($orders: [ID]!) {
                        listDownload(orders: $orders) 
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const listUnload = async(orders, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {orders: orders},
                query: gql`
                    query ($orders: [ID]!) {
                        listUnload(orders: $orders) 
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getUnloadingInvoicesFromRouting = async({orders, organization}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {orders: orders, organization: organization},
                query: gql`
                    query ($organization: ID!, $orders: [ID]!) {
                        unloadingInvoicesFromRouting(organization: $organization, orders: $orders) {
                            data
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const buildRoute = async({autoTonnage, orders, provider, length})=>{
    try{
        const client = new SingletonApolloClient().getClient()
        let res = await client.mutate({
            variables: {autoTonnage: autoTonnage, orders: orders, provider: provider, length: length},
            mutation : gql`
                    mutation ($autoTonnage: Int!, $orders: [ID]!, $provider: ID!, $length: Int) {
                        buildRoute(autoTonnage: $autoTonnage, orders: $orders, provider: $provider, length: $length) {
                            legs
                            lengthInMeters
                            orders{
                                _id
                                agent 
                                    {_id name}
                                createdAt
                                updatedAt
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
                                consignmentPrice
                                returnedPrice
                                info
                                address
                                paymentMethod
                                discount
                                adss
                                    { 
                                        _id
                                        title
                                    }
                                editor
                                number
                                confirmationForwarder
                                confirmationClient
                                cancelClient
                                district
                                track
                                forwarder
                                    {_id name}
                                sale
                                    {_id name}
                                provider
                                    {_id name}
                                organization
                                    {_id name}
                                cancelForwarder
                                paymentConsignation
                                taken
                                sync
                                dateDelivery
                            }
                            tonnage
                        }
                    }`})
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const deleteRoute = async({_id, selectedOrders})=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {_id: _id, selectedOrders: selectedOrders},
            mutation : gql`
                    mutation ($_id: ID!, $selectedOrders: [ID]!) {
                        deleteRoute(_id: $_id, selectedOrders: $selectedOrders) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const addRoute = async({deliverys, provider, selectProdusers, selectDistricts, selectEcspeditor, selectAuto, selectedOrders, dateDelivery, allTonnage})=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: {deliverys: deliverys, provider: provider, selectProdusers: selectProdusers, selectDistricts: selectDistricts, selectEcspeditor: selectEcspeditor, selectAuto: selectAuto, selectedOrders: selectedOrders, dateDelivery: dateDelivery, allTonnage: allTonnage},
            mutation : gql`
                    mutation ($deliverys: [DeliveryInput]!, $provider: ID!, $selectProdusers: [ID]!, $selectDistricts: [ID]!, $selectEcspeditor: ID!, $selectAuto: ID!, $selectedOrders: [ID]!, $dateDelivery: Date!, $allTonnage: Int!) {
                        addRoute(deliverys: $deliverys, provider: $provider, selectProdusers: $selectProdusers, selectDistricts: $selectDistricts, selectEcspeditor: $selectEcspeditor, selectAuto: $selectAuto, selectedOrders: $selectedOrders, dateDelivery: $dateDelivery, allTonnage: $allTonnage) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}

export const setRoute = async(prop)=>{
    try{
        const client = new SingletonApolloClient().getClient()
        await client.mutate({
            variables: prop,
            mutation : gql`
                    mutation ($route: ID!, $deletedOrders: [ID]!) {
                        setRoute(route: $route, deletedOrders: $deletedOrders) {
                             data
                        }
                    }`})
    } catch(err){
        console.error(err)
    }
}
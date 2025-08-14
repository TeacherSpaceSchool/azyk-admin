import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

const Statistic = `
    columns
    row {_id data}
`

export const getOrdersMap = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID, $date: Date, $online: Boolean, $city: String) {
                        ordersMap(organization: $organization, date: $date, online: $online, city: $city)
                    }`,
            })
        return res.data.ordersMap
    } catch(err) {
        console.error(err)
    }
}

export const getAgentMapGeos = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($agent: ID!, $date: String) {
                        agentMapGeos(agent: $agent, date: $date) 
                    }`,
            })
        return res.data.agentMapGeos
    } catch(err) {
        console.error(err)
    }
}

export const getStatisticMerchandising = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID, $dateStart: Date, $type: String, $dateEnd: Date, $agent: ID) {
                        statisticMerchandising(organization: $organization, type: $type, dateStart: $dateStart, dateEnd: $dateEnd, agent: $agent)  {${Statistic}}
                    }`,
            })
        return res.data.statisticMerchandising
    } catch(err) {
        console.error(err)
    }
}

export const getStatisticDevice = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($filter: String!) {
                        statisticDevice(filter: $filter) {${Statistic}}
                    }`,
            })
        return res.data.statisticDevice
    } catch(err) {
        console.error(err)
    }
}

export const getStatisticHours = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $dateStart: Date, $dateEnd: Date, $city: String, $type: String!) {
                        statisticHours(organization: $organization, dateStart: $dateStart, dateEnd: $dateEnd, city: $city, type: $type) {${Statistic}}
                    }`,
            })
        return res.data.statisticHours
    } catch(err) {
        console.error(err)
    }
}

export const getStatisticOrders = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID, $dateStart: Date, $dateEnd: Date, $online: Boolean, $city: String) {
                        statisticOrders(organization: $organization, dateStart: $dateStart, dateEnd: $dateEnd, online: $online, city: $city) {${Statistic}}
                    }`,
            })
        return res.data.statisticOrders
    } catch(err) {
        console.error(err)
    }
}

export const getStatisticOrdersOffRoute = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($type: String, $organization: ID, $dateStart: Date, $dateEnd: Date, $online: Boolean, $city: String, $district: ID) {
                        statisticOrdersOffRoute(type: $type, organization: $organization, dateStart: $dateStart, dateEnd: $dateEnd, online: $online, city: $city, district: $district) {${Statistic}}
                    }`,
            })
        return res.data.statisticOrdersOffRoute
    } catch(err) {
        console.error(err)
    }
}

export const getStatisticUnsyncOrder = async (client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables: {},
                query: gql`
                    query {
                        statisticUnsyncOrder {${Statistic}}
                    }`,
            })
        return res.data.statisticUnsyncOrder
    } catch(err) {
        console.error(err)
    }
}

export const getStatisticReturned = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID, $dateStart: Date, $dateEnd: Date, $city: String) {
                        statisticReturned(organization: $organization, dateStart: $dateStart, dateEnd: $dateEnd, city: $city) {${Statistic}}
                    }`,
            })
        return res.data.statisticReturned
    } catch(err) {
        console.error(err)
    }
}

export const getStatisticClients = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID, $dateStart: Date, $district: ID, $dateEnd: Date, $filter: String, $city: String) {
                        statisticClients(organization: $organization, district: $district, dateStart: $dateStart, dateEnd: $dateEnd, filter: $filter, city: $city) {${Statistic}}
                    }`,
            })
        return res.data.statisticClients
    } catch(err) {
        console.error(err)
    }
}

export const getUnloadingOrders = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $dateStart: Date!, $filter: String!) {
                        unloadingOrders(organization: $organization, dateStart: $dateStart, filter: $filter)
                    }`,
            })
        return res.data.unloadingOrders
    } catch(err) {
        console.error(err)
    }
}

export const getUnloadingInvoices = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $dateStart: Date!, $forwarder: ID, $all: Boolean) {
                        unloadingInvoices(organization: $organization, dateStart: $dateStart, forwarder: $forwarder, all: $all)
                    }`,
            })
        return res.data.unloadingInvoices
    } catch(err) {
        console.error(err)
    }
}

export const getStatisticAgentsWorkTime = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID, $dateStart: Date) {
                        statisticAgentsWorkTime(organization: $organization, dateStart: $dateStart) {${Statistic}}
                    }`,
            })
        return res.data.statisticAgentsWorkTime
    } catch(err) {
        console.error(err)
    }
}

export const getUnloadingAdsOrders = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!, $dateStart: Date!) {
                        unloadingAdsOrders(organization: $organization, dateStart: $dateStart)
                    }`,
            })
        return res.data.unloadingAdsOrders
    } catch(err) {
        console.error(err)
    }
}

export const getUnloadingEmployments = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!) {
                        unloadingEmployments(organization: $organization)
                    }`,
            })
        return res.data.unloadingEmployments
    } catch(err) {
        console.error(err)
    }
}

export const getUnloadingDistricts = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!) {
                        unloadingDistricts(organization: $organization)
                    }`,
            })
        return res.data.unloadingDistricts
    } catch(err) {
        console.error(err)
    }
}

export const getUnloadingAgentRoutes = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!) {
                        unloadingAgentRoutes(organization: $organization)
                    }`,
            })
        return res.data.unloadingAgentRoutes
    } catch(err) {
        console.error(err)
    }
}

export const getCheckAgentRoute = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($agentRoute: ID!) {
                        checkAgentRoute(agentRoute: $agentRoute) {${Statistic}}
                    }`,
            })
        return res.data.checkAgentRoute
    } catch(err) {
        console.error(err)
    }
}

export const checkIntegrateClient = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID, $type: String, $document: Upload) {
                        checkIntegrateClient(organization: $organization, type: $type, document: $document) {${Statistic}}
                    }`,
            })
        return res.data.checkIntegrateClient
    } catch(err) {
        console.error(err)
    }
}

export const getUnloadingClients = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID!) {
                        unloadingClients(organization: $organization)
                    }`,
            })
        return res.data.unloadingClients
    } catch(err) {
        console.error(err)
    }
}

export const getStatisticItems = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($dayStart: Int, $organization: ID, $dateStart: Date, $dateEnd: Date, $online: Boolean, $city: String) {
                        statisticItems(dayStart: $dayStart, organization: $organization, dateStart: $dateStart, dateEnd: $dateEnd, online: $online, city: $city) {${Statistic}}
                    }`,
            })
        return res.data.statisticItems
    } catch(err) {
        console.error(err)
    }
}

export const getStatisticAdss = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID, $dateStart: Date, $dateEnd: Date, $online: Boolean, $city: String) {
                        statisticAdss(organization: $organization, dateStart: $dateStart, dateEnd: $dateEnd, online: $online, city: $city) {${Statistic}}
                    }`,
            })
        return res.data.statisticAdss
    } catch(err) {
        console.error(err)
    }
}

export const getStatisticAgents = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                variables,
                query: gql`
                    query ($organization: ID, $dateStart: Date, $dateEnd: Date, $city: String) {
                        statisticAgents(organization: $organization, dateStart: $dateStart, dateEnd: $dateEnd, city: $city) {${Statistic}}
                    }`,
            })
        return res.data.statisticAgents
    } catch(err) {
        console.error(err)
    }
}

export const getStatisticStorageSize = async (client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                query: gql`
                    query {
                        statisticStorageSize {${Statistic}}
                    }`,
            })
        return res.data.statisticStorageSize
    } catch(err) {
        console.error(err)
    }
}

export const getStatisticClientCity = async (client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                query: gql`
                    query {
                        statisticClientCity {${Statistic}}
                    }`,
            })
        return res.data.statisticClientCity
    } catch(err) {
        console.error(err)
    }
}

export const getStatisticRAM = async (client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                query: gql`
                    query {
                        statisticRAM 
                    }`,
            })
        return res.data.statisticRAM
    } catch(err) {
        console.error(err)
    }
}

export const uploadingAgentRoute = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .mutate({
                variables,
                mutation: gql`
                    mutation ($document: Upload!, $agentRoute: ID!) {
                        uploadingAgentRoute(document: $document, agentRoute: $agentRoute)
                    }`,
            })
        return res.data.uploadingAgentRoute
    } catch(err) {
        console.error(err)
    }
}

export const uploadingClients = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .mutate({
                variables,
                mutation: gql`
                    mutation ($document: Upload!, $organization: ID!, $city: String!) {
                        uploadingClients(document: $document, organization: $organization, city: $city)
                    }`,
            })
        return res.data.uploadingClients
    } catch(err) {
        console.error(err)
    }
}

export const repairUnsyncOrder = async () => {
    try{
        const res = await (new SingletonApolloClient().getClient())
            .mutate({
                variables: {},
                mutation: gql`
                    mutation {
                        repairUnsyncOrder 
                    }`,
            })
        return res.data.repairUnsyncOrder
    } catch(err) {
        console.error(err)
    }
}

export const uploadingItems = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .mutate({
                variables,
                mutation: gql`
                    mutation ($document: Upload!, $organization: ID!, $city: String!) {
                        uploadingItems(document: $document, organization: $organization, city: $city)
                    }`,
            })
        return res.data.uploadingItems
    } catch(err) {
        console.error(err)
    }
}

export const uploadingDistricts = async (variables, client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .mutate({
                variables,
                mutation: gql`
                    mutation ($document: Upload!, $organization: ID!) {
                        uploadingDistricts(document: $document, organization: $organization)
                    }`,
            })
        return res.data.uploadingDistricts
    } catch(err) {
        console.error(err)
    }
}


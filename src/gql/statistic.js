import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getStatisticGeoOrder = async({organization, dateStart, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization, dateStart, city},
                query: gql`
                    query ($organization: ID!, $dateStart: Date, $city: String) {
                        statisticGeoOrder(organization: $organization, dateStart: $dateStart, city: $city) 
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getAgentMapGeos = async({agent, date}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {agent, date},
                query: gql`
                    query ($agent: ID!, $date: String) {
                        agentMapGeos(agent: $agent, date: $date) 
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticMerchandising = async({organization, type, dateStart, dateType, agent}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization, dateStart, dateType, type, agent},
                query: gql`
                    query ($organization: ID, $dateStart: Date, $type: String, $dateType: String, $agent: ID) {
                        statisticMerchandising(organization: $organization, type: $type, dateStart: $dateStart, dateType: $dateType, agent: $agent)  {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticDevice = async(filter, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {filter,},
                query: gql`
                    query ($filter: String!) {
                        statisticDevice(filter: $filter) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticHours = async({organization, dateStart, dateType, city, type}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization, dateStart, dateType, city, type},
                query: gql`
                    query ($organization: ID!, $dateStart: Date, $dateType: String, $city: String, $type: String!) {
                        statisticHours(organization: $organization, dateStart: $dateStart, dateType: $dateType, city: $city, type: $type) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticOrder = async({company, dateStart, dateType, online, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {company, dateStart, dateType, online, city},
                query: gql`
                    query ($company: String, $dateStart: Date, $dateType: String, $online: Boolean, $city: String) {
                        statisticOrder(company: $company, dateStart: $dateStart, dateType: $dateType, online: $online, city: $city) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticOrdersOffRoute = async(variables, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: variables,
                query: gql`
                    query ($type: String, $company: String, $dateStart: Date, $dateType: String, $online: Boolean, $city: String, $district: ID) {
                        statisticOrdersOffRoute(type: $type, company: $company, dateStart: $dateStart, dateType: $dateType, online: $online, city: $city, district: $district) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticSubBrand = async({company, dateStart, dateType, online, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {company, dateStart, dateType, online, city},
                query: gql`
                    query ($company: String, $dateStart: Date, $dateType: String, $online: Boolean, $city: String) {
                        statisticSubBrand(company: $company, dateStart: $dateStart, dateType: $dateType, online: $online, city: $city) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticAzykStoreOrder = async({company, dateStart, dateType, filter, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {company, dateStart, dateType, filter, city},
                query: gql`
                    query ($company: ID, $dateStart: Date, $dateType: String, $filter: String, $city: String) {
                        statisticAzykStoreOrder(company: $company, dateStart: $dateStart, dateType: $dateType, filter: $filter, city: $city) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticUnsyncOrder = async({dateStart, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {dateStart, city},
                query: gql`
                    query ($dateStart: Date, $city: String) {
                        statisticUnsyncOrder(dateStart: $dateStart, city: $city) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticAzykStoreAgent = async({agent, dateStart, dateType}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {agent: agent, dateStart: dateStart, dateType: dateType},
                query: gql`
                    query ($agent: ID!, $dateStart: Date, $dateType: String) {
                        statisticAzykStoreAgent(agent: $agent, dateStart: $dateStart, dateType: $dateType) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticClient = async(arg, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: arg,
                query: gql`
                    query ($client: ID!, $dateStart: Date, $dateType: String, $online: Boolean) {
                        statisticClient(client: $client, dateStart: $dateStart, dateType: $dateType, online: $online) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticReturned = async({company, dateStart, dateType, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {company, dateStart, dateType, city},
                query: gql`
                    query ($company: String, $dateStart: Date, $dateType: String, $city: String) {
                        statisticReturned(company: $company, dateStart: $dateStart, dateType: $dateType, city: $city) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticClients = async({company, dateStart, dateType, district, filter, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {company, dateStart, dateType, district, filter, city},
                query: gql`
                    query ($company: String, $dateStart: Date, $district: ID, $dateType: String, $filter: String, $city: String) {
                        statisticClients(company: $company, district: $district, dateStart: $dateStart, dateType: $dateType, filter: $filter, city: $city) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticClientActivity = async({online, organization, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {online, organization, city},
                query: gql`
                    query ($online: Boolean, $organization: ID, $city: String) {
                        statisticClientActivity (online: $online, city: $city, organization: $organization) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticItemActivity = async({online, organization, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {online: online, organization: organization, city},
                query: gql`
                    query ($online: Boolean, $organization: ID, $city: String) {
                        statisticItemActivity (online: $online, organization: $organization, city: $city) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticOrganizationActivity = async({online, organization, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {online: online, organization: organization, city},
                query: gql`
                    query ($online: Boolean, $organization: ID, $city: String) {
                        statisticOrganizationActivity (online: $online, organization: $organization, city: $city) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getUnloadingOrders = async({organization, dateStart, filter}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization: organization, dateStart: dateStart, filter: filter},
                query: gql`
                    query ($organization: ID!, $dateStart: Date!, $filter: String!) {
                        unloadingOrders(organization: $organization, dateStart: $dateStart, filter: $filter) {
                            data
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getUnloadingInvoices = async({organization, dateStart, forwarder, all}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization: organization, dateStart: dateStart, forwarder: forwarder, all: all},
                query: gql`
                    query ($organization: ID!, $dateStart: Date!, $forwarder: ID, $all: Boolean) {
                        unloadingInvoices(organization: $organization, dateStart: $dateStart, forwarder: $forwarder, all: $all) {
                            data
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticAgentsWorkTime = async({organization, date}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization: organization, date: date},
                query: gql`
                    query ($organization: String, $date: Date) {
                        statisticAgentsWorkTime(organization: $organization, date: $date) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticDistributer = async({distributer, organization, dateStart, dateType, type, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {distributer: distributer, organization: organization, dateStart: dateStart, dateType: dateType, type: type, city},
                query: gql`
                    query ($distributer: ID!, $organization: ID, $dateStart: Date, $dateType: String, $type: String, $city: String) {
                        statisticDistributer(distributer: $distributer, organization: $organization, dateStart: $dateStart, dateType: $dateType, type: $type, city: $city) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getUnloadingAdsOrders = async({organization, dateStart}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization: organization, dateStart: dateStart},
                query: gql`
                    query ($organization: ID!, $dateStart: Date!) {
                        unloadingAdsOrders(organization: $organization, dateStart: $dateStart) {
                            data
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getUnloadingEmployments = async({organization}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization: organization},
                query: gql`
                    query ($organization: ID!) {
                        unloadingEmployments(organization: $organization) {
                            data
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getUnloadingDistricts = async({organization}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization: organization},
                query: gql`
                    query ($organization: ID!) {
                        unloadingDistricts(organization: $organization) {
                            data
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getUnloadingAgentRoutes = async({organization}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization: organization},
                query: gql`
                    query ($organization: ID!) {
                        unloadingAgentRoutes(organization: $organization) {
                            data
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticOrderChart = async({company, dateStart, dateType, type, online, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {city, company: company, dateStart: dateStart, dateType: dateType, type: type, online: online},
                query: gql`
                    query ($company: String, $dateStart: Date, $dateType: String, $type: String, $online: Boolean, $city: String) {
                        statisticOrderChart(company: $company, dateStart: $dateStart, dateType: $dateType, type: $type, online: $online, city: $city) {
                            all
                            chartStatistic
                                {
                                    label
                                    data
                                }
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getCheckOrder = async(data, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: data,
                query: gql`
                    query ($company: String, $today: Date!, $city: String) {
                        checkOrder(company: $company, today: $today, city: $city) {
                            columns
                            row 
                                {data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getCheckAgentRoute = async(data, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: data,
                query: gql`
                    query ($agentRoute: ID!) {
                        checkAgentRoute(agentRoute: $agentRoute) {
                            columns
                            row 
                                {data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const checkIntegrateClient = async(data, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: data,
                query: gql`
                    query ($organization: ID, $type: String, $document: Upload) {
                        checkIntegrateClient(organization: $organization, type: $type, document: $document) {
                            columns
                            row 
                                {data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getUnloadingClients = async({organization}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization: organization},
                query: gql`
                    query ($organization: ID!) {
                        unloadingClients(organization: $organization) {
                            data
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticItem = async(variables, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables,
                query: gql`
                    query ($company: String, $dateStart: Date, $dateEnd: Date, $online: Boolean, $city: String) {
                        statisticItem(company: $company, dateStart: $dateStart, dateEnd: $dateEnd, online: $online, city: $city) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticAdss = async({company, dateStart, dateType, online, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {company, dateStart, dateType, online, city},
                query: gql`
                    query ($company: String, $dateStart: Date, $dateType: String, $online: Boolean, $city: String) {
                        statisticAdss(company: $company, dateStart: $dateStart, dateType: $dateType, online: $online, city: $city) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticAgents = async({company, dateStart, dateType, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {company, dateStart, dateType, city},
                query: gql`
                    query ($company: String, $dateStart: Date, $dateType: String, $city: String) {
                        statisticAgents(company: $company, dateStart: $dateStart, dateType: $dateType, city: $city) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticStorageSize = async(client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                query: gql`
                    query {
                        statisticStorageSize {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticClientCity = async(client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                query: gql`
                    query {
                        statisticClientCity {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticClientGeo = async({organization, item, search, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization, item, search, city},
                query: gql`
                    query($organization: ID, $item: ID, $search: String, $city: String) {
                        statisticClientGeo(organization: $organization, item: $item, search: $search, city: $city) {
                            client
                            address
                            data
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticAzykStoreAgents = async({company, dateStart, dateType, filter, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {company, dateStart, dateType, filter, city},
                query: gql`
                    query ($company: ID, $dateStart: Date, $dateType: String, $filter: String, $city: String) {
                        statisticAzykStoreAgents(company: $company, dateStart: $dateStart, dateType: $dateType, filter: $filter, city: $city) {
                            columns
                            row 
                                {_id data}
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getStatisticRAM = async(client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                query: gql`
                    query {
                        statisticRAM 
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getActiveItem = async({organization}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {organization: organization},
                query: gql`
                    query($organization: ID!) {
                        activeItem(organization: $organization) {
                            name
                            _id
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getActiveOrganization = async(city, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {city},
                query: gql`
                    query($city: String) {
                        activeOrganization(city: $city) {
                            name
                            _id
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const getSuperagentOrganization = async(city, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .query({
                variables: {city},
                query: gql`
                    query($city: String) {
                        superagentOrganization(city: $city) {
                            name
                            _id
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const uploadingAgentRoute = async({document, agentRoute}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .mutate({
                variables: {document: document, agentRoute: agentRoute},
                mutation: gql`
                    mutation ($document: Upload!, $agentRoute: ID!) {
                        uploadingAgentRoute(document: $document, agentRoute: $agentRoute) {
                            data
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const uploadingClients = async({document, organization, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .mutate({
                variables: {document, organization, city},
                mutation: gql`
                    mutation ($document: Upload!, $organization: ID!, $city: String!) {
                        uploadingClients(document: $document, organization: $organization, city: $city) {
                            data
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const repairUnsyncOrder = async(ids)=>{
    try{
        let res = await (new SingletonApolloClient().getClient())
            .mutate({
                variables: {ids},
                mutation: gql`
                    mutation ($ids: [ID]!) {
                        repairUnsyncOrder(ids: $ids) {
                            data
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const uploadingItems = async({document, organization, city}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .mutate({
                variables: {document, organization, city},
                mutation: gql`
                    mutation ($document: Upload!, $organization: ID!, $city: String!) {
                        uploadingItems(document: $document, organization: $organization, city: $city) {
                            data
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}

export const uploadingDistricts = async({document, organization}, client)=>{
    try{
        client = client? client : new SingletonApolloClient().getClient()
        let res = await client
            .mutate({
                variables: {document: document, organization: organization},
                mutation: gql`
                    mutation ($document: Upload!, $organization: ID!) {
                        uploadingDistricts(document: $document, organization: $organization) {
                            data
                        }
                    }`,
            })
        return res.data
    } catch(err){
        console.error(err)
    }
}


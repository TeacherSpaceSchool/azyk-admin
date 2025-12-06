import {SingletonApolloClient} from '../singleton/client';
import {gql} from 'apollo-boost';

export const addReturnedV1 = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($dateDelivery: Date!, $unite: Boolean, $info: String, $inv: Boolean, $address: [[String]], $organization: ID!, $client: ID!, $items: [ReturnedItemsInput]) {
                        addReturned(dateDelivery: $dateDelivery, unite: $unite, info: $info, inv: $inv, address: $address, organization: $organization, client: $client, items: $items)
                    }`})
        return res.data.addReturned
    } catch(err) {
        console.error(err)
    }
}
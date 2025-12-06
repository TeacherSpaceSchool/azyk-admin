import {SingletonApolloClient} from '../singleton/client';
import {gql} from 'apollo-boost';

export const addOrdersV1 = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($stamp: String, $baskets: [OrderInput], $dateDelivery: Date!, $info: String, $inv: Boolean, $unite: Boolean, $paymentMethod: String, $organization: ID!, $client: ID!) {
                        addOrders(stamp: $stamp, baskets: $baskets, dateDelivery: $dateDelivery, inv: $inv, unite: $unite, info: $info, paymentMethod: $paymentMethod, organization: $organization, client: $client)
                    }`})
        return res.data.addOrders
    } catch(err) {
        console.error(err)
    }
}
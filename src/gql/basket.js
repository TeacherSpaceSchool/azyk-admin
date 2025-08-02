import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const addBasket = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($item: ID!, $count: Int!) {
                        addBasket(item: $item, count: $count)
                    }`})
        return res.data.addBasket
    } catch(err) {
        console.error(err)
    }
}

export const deleteBasketAll = async (client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client.mutate({
            mutation : gql`
                    mutation{
                        deleteBasketAll
                    }`})
        return res.data.deleteBasketAll
    } catch(err) {
        console.error(err)
    }
}
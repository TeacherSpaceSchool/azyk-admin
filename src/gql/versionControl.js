import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const forceUpdate = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation {
                        forceUpdate
                    }`})
        return res.data.forceUpdate
    } catch(err) {
        console.error(err)
    }
}
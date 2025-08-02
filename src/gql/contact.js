import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../singleton/client';

export const getContact = async (client) => {
    try{
        client = client? client : new SingletonApolloClient().getClient()
        const res = await client
            .query({
                query: gql`
                    query {
                        contact {
                            name
                            image
                            address
                            email
                            phone
                            info
                            warehouse
                          }
                    }`,
            })
        return res.data.contact
    } catch(err) {
        console.error(err)
    }
}

export const setContact = async (variables) => {
    try{
        const client = new SingletonApolloClient().getClient()
        const res = await client.mutate({
            variables,
            mutation : gql`
                    mutation ($warehouse: String!, $name: String!, $image: Upload, $address: [String]!, $email: [String]!, $phone: [String]!, $info: String!) {
                        setContact(warehouse: $warehouse, name: $name, image: $image, address: $address, email: $email, phone: $phone, info: $info)
                    }`})
        return res.data.setContact
    } catch(err) {
        console.error(err)
    }
}
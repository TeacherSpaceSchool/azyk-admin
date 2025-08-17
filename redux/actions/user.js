import {
    AUTHENTICATED,
    UNAUTHENTICATED,
    SET_PROFILE,
    SET_AUTH,
    ERROR_AUTHENTICATED
} from '../constants/user'
import {
    SHOW_MINI_DIALOG
} from '../constants/mini_dialog'
import {
    SET_COUNT_BASKET,
    SHOW_LOAD
} from '../constants/app'
import Cookies from 'js-cookie';
import { gql } from 'apollo-boost';
import { SingletonApolloClient } from '../../src/singleton/client';
import { unregister, register } from '../../src/subscribe';
import Router from 'next/router';

export function signin(payload) {
    return async (dispatch) => {
        await dispatch({
            type: SHOW_LOAD,
            payload: true
        })
        try {
            const client = new SingletonApolloClient().getClient();
            let result = await client.mutate({
                variables: payload,
                mutation : gql`
                    mutation ($login: String!, $password: String!) {
                        signinuser(login: $login, password: $password) {
                           role
                           status
                           login
                           organization
                           client
                           employment
                           addedClient
                           agentSubBrand
                           _id
                           city
                        }
                    }`})
            if(result.data.signinuser.role==='Проверьте данные') {
                await dispatch({
                    type: ERROR_AUTHENTICATED,
                    payload: true
                })
                await dispatch({
                    type: SHOW_LOAD,
                    payload: false
                })
            }
            else {
                await dispatch({
                    type: SHOW_MINI_DIALOG,
                    payload: false
                })
                let reloadTimeout = setTimeout(() =>window.location.reload(), 5000)
                await register()
                clearTimeout(reloadTimeout)
                window.location.replace('/')

                /*await dispatch({type: AUTHENTICATED});
                await dispatch({
                    type: SET_PROFILE,
                    payload: result.data.signinuser
                })*/
            }
        } catch(error) {
            await dispatch({
                type: SHOW_LOAD,
                payload: false
            })
            await dispatch({
                type: ERROR_AUTHENTICATED,
                payload: true
            })
        }
    };
}

export function checkAuthenticated() {
    return async (dispatch) => {
        try {
            if(Cookies.get('jwt')) {
                dispatch ({type: AUTHENTICATED});
            } else {
                dispatch ({type: UNAUTHENTICATED});
            }
        } catch (error) {
            dispatch ({type: UNAUTHENTICATED});
        }
    };
}

export function setAuthenticated(auth) {
    return {
        type: SET_AUTH,
        payload: auth
    }
}

export function logout(reload) {
    return async (dispatch) => {
        await dispatch({
            type: SHOW_LOAD,
            payload: true
        })
        await dispatch({
            type: UNAUTHENTICATED,
        })
        await Cookies.remove('jwt');
        await dispatch({
            type: SET_COUNT_BASKET,
            payload: 0
        })
        await dispatch({
            type: SET_PROFILE,
            payload: {}
        })
        localStorage.removeItem('extendedJWT')
        if(reload) {
            await unregister()
            Router.push('/contact')
            window.location.reload()
        }
        else
            await dispatch({
                type: SHOW_LOAD,
                payload: false
            })
    }
}

export function setProfile() {
    return async (dispatch) => {
        try {
            const client = new SingletonApolloClient().getClient()
            let result = await client
                .query({
                    query: gql`
                    query {
                        getStatus {
                           role
                           status
                           login
                           organization
                           client
                           employment
                           addedClient
                           agentSubBrand
                           _id
                           city
                          }
                    }`
                })

            await dispatch({
                type: SET_PROFILE,
                payload: result.data.getStatus
            })
        } catch(error) {
            console.error(error)
        }
    };
}

export async function getProfile(client) {
    try {
        client = client? client : new SingletonApolloClient().getClient()
        let result = await client
            .query({
                query: gql`
                   query {
                       getStatus {
                          role
                          status
                          login
                          organization
                           client
                           employment
                           addedClient
                           agentSubBrand
                           category
                          _id
                          city
                       }
                   }`
            })
        return result.data.getStatus
    } catch(error) {
        console.error(error)
    }
}
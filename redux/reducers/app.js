import { SET_AGENT, SET_CITY, SHOW_APPBAR, SHOW_DRAWER, SET_FILTER, SET_SORT, SET_SEARCH, SET_IS_MOBILE_APP, SHOW_LOAD, SET_COUNT_BASKET, SET_DATE, SET_ORGANIZATION } from '../constants/app'

const initialState = {
    showAppBar: true,
    drawer: false,
    search: '',
    filter: '',
    sort: '-createdAt',
    isMobileApp: undefined,
    device: undefined,
    load: false,
    countBasket: 0,
    date: '',
    city: 'Бишкек',
    agent: undefined,
    organization: undefined,
}

export default function mini_dialog(state = initialState, action) {
    switch (action.type) {
        case SHOW_APPBAR:
            return {...state, showAppBar: action.payload}
        case SHOW_DRAWER:
            return {...state, drawer: action.payload}
        case SET_SORT:
            return {...state, sort: action.payload}
        case SET_FILTER:
            return {...state, filter: action.payload}
        case SET_SEARCH:
            return {...state, search: action.payload}
        case SET_IS_MOBILE_APP:
            return {...state, isMobileApp: action.payload}
        case SHOW_LOAD:
            return {...state, load: action.payload}
        case SET_COUNT_BASKET:
            return {...state, countBasket: action.payload}
        case SET_DATE:
            return {...state, date: action.payload}
        case SET_ORGANIZATION:
            return {...state, organization: action.payload}
        case SET_AGENT:
            return {...state, agent: action.payload}
        case SET_CITY:
            return {...state, city: action.payload}
        default:
            return state
    }
}
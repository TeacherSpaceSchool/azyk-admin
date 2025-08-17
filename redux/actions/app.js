import {
    SET_CITY,
    SET_AGENT,
    SHOW_APPBAR,
    SHOW_DRAWER,
    SET_SEARCH,
    SET_FILTER,
    SET_SORT,
    SET_IS_MOBILE_APP,
    SHOW_LOAD,
    SET_COUNT_BASKET,
    SET_DATE,
    SET_ORGANIZATION,
    SET_DISTRICT, SET_VIEW_MODE
} from '../constants/app'

export function setViewMode(data) {
    return {
        type: SET_VIEW_MODE,
        payload: data
    }
}

export function setCity(data) {
    return {
        type: SET_CITY,
        payload: data
    }
}

export function showAppBar(data) {
    return {
        type: SHOW_APPBAR,
        payload: data
    }
}

export function showDrawer(data) {
    return {
        type: SHOW_DRAWER,
        payload: data
    }
}

export function setAgent(data) {
    return {
        type: SET_AGENT,
        payload: data
    }
}

export function setOrganization(data) {
    return {
        type: SET_ORGANIZATION,
        payload: data
    }
}

export function setDistrict(data) {
    return {
        type: SET_DISTRICT,
        payload: data
    }
}

export function setFilter(data) {
    return {
        type: SET_FILTER,
        payload: data
    }
}

export function setDate(data) {
    return {
        type: SET_DATE,
        payload: data
    }
}

export function setCountBasket(data) {
    return {
        type: SET_COUNT_BASKET,
        payload: data
    }
}

export function setSort(data) {
    return {
        type: SET_SORT,
        payload: data
    }
}

export function setSearch(data) {
    return {
        type: SET_SEARCH,
        payload: data
    }
}

export function setIsMobileApp(data) {
    return {
        type: SET_IS_MOBILE_APP,
        payload: data
    }
}

export function showLoad(show) {
    return {
        type: SHOW_LOAD,
        payload: show
    }
}
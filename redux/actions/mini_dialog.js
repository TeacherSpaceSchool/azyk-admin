import { SET_MINI_DIALOG, SHOW_MINI_DIALOG, SET_FULL_DIALOG, SHOW_FULL_DIALOG } from '../constants/mini_dialog'

export function setMiniDialog(title, child) {
    return {
        type: SET_MINI_DIALOG,
        payload: {title, child: child}
    }
}

export function showMiniDialog(show) {
    return {
        type: SHOW_MINI_DIALOG,
        payload: show
    }
}

export function setFullDialog(title, child) {
    return {
        type: SET_FULL_DIALOG,
        payload: {title, child: child}
    }
}

export function showFullDialog(show) {
    return {
        type: SHOW_FULL_DIALOG,
        payload: show
    }
}

/* eslint-disable no-extra-boolean-cast */
export class SingletonApp {
    constructor(mobile, auth) {
        if(!!SingletonApp.instance) {
            return SingletonApp.instance;
        }
        SingletonApp.instance = this;
        this.mobile = mobile
        this.auth = auth
        return this;
    }
    isAuth() {
        return this.auth;
    }
    isMobile() {
        return this.mobile;
    }
}
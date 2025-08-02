/* eslint-disable no-extra-boolean-cast */
export class SingletonStore {
    constructor(store) {
        if(!!SingletonStore.instance) {
            return SingletonStore.instance;
        }
        SingletonStore.instance = this;
        this.store = store
        return this;
    }

    getStore() {
        return this.store;
    }
}
import { openDB, deleteDB } from 'idb';
import { initReceiveData } from './idb/receiveData';
import { initOfflineOrders } from './idb/offlineOrders';
import { SingletonStore } from '../singleton/store';

const dbName = 'b10b11bd-ab56-46e2-99b3-58d4be94a882'

export let db = null
export let start = async () => {
    try {
        if(window.indexedDB) {
            if(
                new SingletonStore().getStore()
                &&
                new SingletonStore().getStore().getState().user.profile.role
                &&
                new SingletonStore().getStore().getState().user.profile.role.includes('агент')
            ) {
                db = await openDB(dbName, 1, {
                    upgrade(db) {
                        if(db) {
                            initReceiveData(db)
                            initOfflineOrders(db)
                        }
                        else {
                            deleteDB(dbName, {});
                        }
                    },
                    blocked() {
                        deleteDB(dbName, {});
                    },
                    blocking() {
                        deleteDB(dbName, {});
                    },
                    terminated() {
                        deleteDB(dbName, {});
                    }
                });
            }
            else {
                deleteDB(dbName, {});
            }
        }
    }
    catch (error) {
        console.error(error)
    }
}



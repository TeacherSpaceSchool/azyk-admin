import { db } from '../idb'

export let initOfflineOrders = (db) => {
    try {
        db.deleteObjectStore('offlineOrders');
        db.createObjectStore('offlineOrders', {
            keyPath: 'id',
            autoIncrement: true,
        });
    }
    catch (error){
        console.error(error)
    }
}

export let clearAllOfflineOrders = async() => {
    try {
        if(db!==undefined){
            await db.clear('offlineOrders')
        }
    }
    catch (error){
        console.error(error)
    }
}

export let deleteOfflineOrderByKey = async(key) => {
    try {
        if(db!==undefined){
            await db.delete('offlineOrders', key)
        }
    }
    catch (error){
        console.error(error)
    }
}

export let getAllOfflineOrders = async() => {
    try {
        if(db!==undefined){
            let res = await db.getAll('offlineOrders')
            return res.map(res=>{return {...res.data, key: res.id}})
        }
    }
    catch (error){
        console.error(error)
    }
}

export let putOfflineOrders = async(data) => {
    try {
        if(db!==undefined){
            await db.add('offlineOrders', {
                data: data
            });
        }
    }
    catch (error){
        console.error(error)
    }
}

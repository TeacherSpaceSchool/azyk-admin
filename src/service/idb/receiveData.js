import { db } from '../idb'

export let initReceiveData = (db) => {
    try {
        db.deleteObjectStore('receiveData');
        const store = db.createObjectStore('receiveData', {
            keyPath: 'id',
            autoIncrement: true,
        });
        store.createIndex('name', 'name', { unique: true });
    }
    catch (error){
        console.error(error)
    }
}

export let getReceiveDataByIndex = async(index) => {
    try {
        if(db!==undefined){
            return (await db.getFromIndex('receiveData', 'name', index)).data
        }
    }
    catch (error){
        console.error(error)
    }
}

export let putReceiveDataByIndex = async(index,  data) => {
    try {
        if(db!==undefined){
            let res = await db.getFromIndex('receiveData', 'name', index)
            if(res===undefined){
                await db.add('receiveData', {
                    name: index,
                    data: data
                });
            } else {
                res.data = data
                await db.put('receiveData', res);
            }
        }
    }
    catch (error){
        console.error(error)
    }
}

import storeList from '@/utils/db/storeList'

const dbName = 'SMILEMIAO-WEB-APP'
const dbVersion = 1

let indexedDB =
  global.indexedDB ||
  global.webkitindexedDB ||
  global.msIndexedDB ||
  global.mozIndexedDB

const DB = {
  instance: null,
  connected: false,
  storeList,
  async open() {
    return new Promise((resolve, reject) => {
      let request = indexedDB.open(dbName, dbVersion)

      request.onerror = (err) => reject('IndexedDB打开失败:' + err) 

      request.onsuccess = (event) => {
        this.instance = event.target.result
        this.connected = true
        console.log(`IndexedDB打开成功——Name: ${dbName} Version: ${dbVersion}`)
        resolve(event.target.result)
      }

      // 数据库升级
      request.onupgradeneeded = (event) => {
        let db = event.target.result

        this.storeList.forEach(async(store) => {
          let objectStore
          // 表已经存在
          if (db.objectStoreNames.contains(store.name)) {
            db.deleteObjectStore(store.name)
          }
          // 主键与autoIncrement至少一个
          let opt = store.autoIncrement ? { autoIncrement: true } : { keyPath: store.key }
          objectStore = db.createObjectStore(store.name, opt)

          if (!store.cursorIndex) {
            return
          }
          // 创建索引
          store.cursorIndex.forEach((index) => objectStore.createIndex(index.name, index.name, { unique: index.unique }))
        })
      }
    })
  },
  // 关闭数据库
  closeDB: async function() {
    try {
      let db = this.instance
      let request = db.closeDB()
      return new Promise((resolve) => {
        request.onerror = () => resolve(false)
        request.onsuccess = () => resolve(true)
      })
    } catch (err) {
      return Promise.resolve(false)
    }
  },
  // 添加新数据
  add: async function(objectStoreName, data) {
    try {
      let db = this.instance
      let objectStore = db.transaction(objectStoreName, 'readwrite').objectStore(objectStoreName)
      objectStore.add(data)

      return new Promise((resolve) => {
        objectStore.onerror = (err) => resolve(err)
        objectStore.oncomplete = () => resolve(true)
      })
    } catch (err) {
      return Promise.resolve(false)
    }
  },
  // 更新数据库
  update: async function(objectStoreName, data, key) {
    try {
      let db = this.instance
      let objectStore = db.transaction(objectStoreName, 'readwrite').objectStore(objectStoreName)
      console.log('updateIndexedDB:', objectStoreName)
      if (key) {
        // key 你想要更新记录的主键 (e.g. from IDBCursor.primaryKey (en-US)). This is only needed for object stores 
        // that have an autoIncrement primary key, therefore the key is not in a field on the record object. 
        // In such cases, calling put(item) will always insert a new record, because it doesn't know what existing record you might want to modify.
        objectStore.put(data, key)
      } else {
        objectStore.put(data)
      }
        
      return new Promise((resolve) => {
        objectStore.onerror = (err) => resolve(err)
        objectStore.oncomplete = () => resolve(true)
      })
    } catch (err) {
      return Promise.resolve(false)
    }
  },
  // 删除表中的某条记录
  delete: async function(objectStoreName, key) {
    try {
      let db = this.instance
      let transaction = db.transaction(objectStoreName, 'readwrite').objectStore(objectStoreName)
      objectStore.delete(key)

      return new Promise((resolve) => {
        transaction.onerror = (err) => resolve(err)
        transaction.oncomplete = () => resolve(true)
      })
    } catch (err) {
      return Promise.resolve(err)
    }
  },
  // 清理某张表
  clear: async function(objectStoreName) {
    let db = this.instance
    let objectStore = db.transaction(objectStoreName, 'readwrite').objectStore(objectStoreName)
    objectStore.clear()
  },
  // 根据主键查询某张表中的记录
  get: async function(objectStoreName, key) {
    console.log(`get record from store: ${objectStoreName} with key: ${key}`)
    let db = this.instance
    let objectStore = db.transaction(objectStoreName, 'readwrite').objectStore(objectStoreName)
    let request = objectStore.get(key)

    return new Promise((resolve) => {
      request.onsuccess = (event) => resolve(event.target.result)
      request.onerror = () => resolve(null)
    })
  },
  /***
   * 根据游标查询数据库
   * @param {String} objectStoreName 表名
   * @param {String} index 索引
   * @param {IDBKeyRange} keyRange 过滤条件
   */
  getDatasByIndexAndKeyRange: async function(objectStoreName, index, keyRange) {
    try {
      let db = this.instance
      let objectStore = db.transaction(objectStoreName, 'readwrite').objectStore(objectStoreName)
      let data = []
      let request = objectStore.index(index).openCursor(keyRange)
      
      return new Promise((resolve) => {
        request.onerror = () => resolve('')

        request.onsuccess = (event) => {
          let cursor = event.target.result

          if (cursor) {
            data.push({
              primaryKey: cursor.primaryKey,
              value: cursor.value
            })
            cursor.continue()
          } else {
            resolve(data)
          }
        }
      })
    } catch(err) {
      return Promise.reject(err)
    }
  },
  // 通过KeyRange获取游标
  getCursorByKeyRange: async function(objectStoreName, keyRange) {
    console.log('getCursorByKeyRange:', objectStoreName, keyRange)
    try {
      let mKeyRange = keyRange || ''
      let db = this.instance
      let objectStore = db.transaction(objectStoreName, 'readwrite').objectStore(objectStoreName)
      let request = objectStore.openCursor(mKeyRange)

      return new Promise((resolve) => {
        request.onerror = (err) => resolve(err)
        request.onsuccess = (event) => resolve(event.target.result)
      })
    } catch (err) {
      return Promise.reject(err)
    }
  },
  /**
   * 
   * @param {*} objectStoreName 
   * @param {*} keyRange cursor值
   * @param {*} cursorIndex cursor名
   * @returns 
   */
  // 通过索引查询数据库
  getDataByIndexAndKeyRange: async function(objectStoreName, keyRange, index) {
    console.log('getDataByIndexAndKeyRange：', objectStoreName, keyRange, index)
    try {
      let mKeyRange = keyRange || ''
      let db = this.instance
      let objectStore = db.transaction(objectStoreName, 'readwrite').objectStore(objectStoreName)
      let request = objectStore.index(index).openCursor(mKeyRange)

      return new Promise((resolve) => {
        request.onerror = (err) => resolve(err)

        let data = []
        request.onsuccess = (event) => {
          let cursor = event.target.result
          if (cursor) {
            data.push(cursor.value)
            cursor.continue()
          } else {
            resolve(data)
          }
        }
      })
    } catch (err) {
      return Promise.reject(err)
    }
  },
  // 创建索引
  createIndex: async function(objectStoreName, cursorIndex, unique) {
    let db = this.instance
    let objectStore = db.transaction(objectStoreName, 'readwrite').objectStore(objectStoreName)

    /**
     * createIndex(indexName, keyPath)
     * createIndex(indexName, keyPath, objectParameters)
     * https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/createIndex
    */
    objectStore.createIndex(cursorIndex, cursorIndex, { unique: unique })
    return Promise.resolve()
  }
}

export default DB

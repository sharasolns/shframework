import ShStorage from './ShStorage.js';

const DB_NAME = 'ShTableCacheDB';
const STORE_NAME = 'table_cache';
const STORE_METADATA_NAME = 'cache_metadata';
const DB_VERSION = 2;

let dbPromise = null;

function getPrefix() {
  try {
    const config = ShStorage.getItem('ShConfig') || {};
    const user = ShStorage.getItem('user') || {};
    const fields = config.cacheUserFields || ['id'];
    
    const prefix = fields
      .map(field => user[field])
      .filter(val => val !== undefined && val !== null)
      .join('_');
      
    return prefix ? `${prefix}_` : '';
  } catch (error) {
    console.error('Error getting cache prefix:', error);
    return '';
  }
}

function getDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(STORE_METADATA_NAME)) {
        db.createObjectStore(STORE_METADATA_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });

  return dbPromise;
}

async function setItem(key, value, metadata = null) {
  try {
    const prefixedKey = getPrefix() + key;
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME, STORE_METADATA_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const metadataStore = transaction.objectStore(STORE_METADATA_NAME);
      
      const request = store.put(value, prefixedKey);
      
      if (metadata) {
          metadataStore.put({
              key: prefixedKey,
              originalKey: key,
              url: metadata.url,
              timestamp: Date.now()
          }, prefixedKey);
      }

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error('ShIndexedDB setItem error:', error);
  }
}

async function getItem(key, defaultValue = null) {
  try {
    const prefixedKey = getPrefix() + key;
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(prefixedKey);

      request.onsuccess = (event) => {
        resolve(event.target.result !== undefined ? event.target.result : defaultValue);
      };
      request.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error('ShIndexedDB getItem error:', error);
    return defaultValue;
  }
}

async function removeItem(key) {
  try {
    const prefixedKey = getPrefix() + key;
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME, STORE_METADATA_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const metadataStore = transaction.objectStore(STORE_METADATA_NAME);
      
      const request = store.delete(prefixedKey);
      metadataStore.delete(prefixedKey);

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error('ShIndexedDB removeItem error:', error);
  }
}

async function clear() {
    try {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME, STORE_METADATA_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const metadataStore = transaction.objectStore(STORE_METADATA_NAME);
            
            store.clear();
            const request = metadataStore.clear();

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    } catch (error) {
        console.error('ShIndexedDB clear error:', error);
    }
}

export default {
  setItem,
  getItem,
  removeItem,
  clear
};

const DB_NAME = 'VocabularyShowcaseDB';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains('showcases')) {
        dbInstance.createObjectStore('showcases', { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains('history')) {
        const historyStore = dbInstance.createObjectStore('history', { keyPath: 'id' });
        historyStore.createIndex('date', 'date', { unique: false });
      }
    };
  });
};

export const add = async <T>(storeName: string, item: T): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);

    request.onsuccess = () => resolve();
    request.onerror = () => {
        console.error(`Error adding item to ${storeName}:`, request.error);
        reject(request.error)
    };
  });
};


export const getAll = async <T>(storeName: string): Promise<T[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
            console.error(`Error getting all items from ${storeName}:`, request.error);
            reject(request.error);
        };
    });
};

export const getAllSorted = async <T>(storeName: string, indexName: string, direction: IDBCursorDirection = 'prev'): Promise<T[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.openCursor(null, direction);
        const results: T[] = [];

        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
                results.push(cursor.value);
                cursor.continue();
            } else {
                resolve(results);
            }
        };
        request.onerror = () => {
            console.error(`Error getting sorted items from ${storeName} with cursor:`, request.error);
            reject(request.error);
        };
    });
};

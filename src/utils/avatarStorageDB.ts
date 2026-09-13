/**
 * IndexedDB storage for Student Avatars.
 * Allows storing high-quality/compressed avatar images for all 48+ students
 * persistently without hitting browser localStorage 5MB quota limit.
 */

const DB_NAME = 'TNH_GVCN_AvatarDB_v1';
const STORE_NAME = 'student_avatars';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

const getDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject('IndexedDB is not supported');
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
};

export const saveAvatarToIndexedDB = async (studentId: string, avatarData: string): Promise<void> => {
  try {
    if (!studentId || !avatarData) return;
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(avatarData, studentId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save avatar to IndexedDB:', err);
  }
};

export const saveAllAvatarsToIndexedDB = async (students: { id: string; avatar?: string }[]): Promise<void> => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    students.forEach((s) => {
      if (s.id && s.avatar && s.avatar.startsWith('data:image')) {
        store.put(s.avatar, s.id);
      }
    });
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.warn('Failed to batch save avatars to IndexedDB:', err);
  }
};

export const getAllAvatarsFromIndexedDB = async (): Promise<Record<string, string>> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();
      const avatars: Record<string, string> = {};
      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          avatars[cursor.key as string] = cursor.value as string;
          cursor.continue();
        } else {
          resolve(avatars);
        }
      };
      req.onerror = () => resolve({});
    });
  } catch (err) {
    console.warn('Failed to get avatars from IndexedDB:', err);
    return {};
  }
};

export const syncAndLoadAvatarsFromIndexedDB = async <T extends { id: string; avatar?: string }>(students: T[]): Promise<T[]> => {
  try {
    const storedAvatars = await getAllAvatarsFromIndexedDB();
    if (!storedAvatars || Object.keys(storedAvatars).length === 0) {
      return students;
    }
    return students.map((s) => {
      if (storedAvatars[s.id] && storedAvatars[s.id].startsWith('data:image')) {
        return { ...s, avatar: storedAvatars[s.id] };
      }
      return s;
    });
  } catch {
    return students;
  }
};

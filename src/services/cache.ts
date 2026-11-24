/**
 * Smart cache for public GET requests (stale-while-revalidate).
 *
 * - Memory + IndexedDB: a repeat visit paints instantly from the last response,
 *   even after closing the browser (responses carry base64 images, so they are
 *   too big for localStorage).
 * - Fresh for FRESH_MS: served from cache without any request.
 * - Stale (up to MAX_AGE_MS): served from cache immediately, refreshed in the
 *   background; components using useCachedApi() re-render with the new data.
 * - Identical requests running at the same time share one network call
 *   (header, footer and login all ask for /informations).
 * - Any successful POST/PUT/DELETE clears the entries of that endpoint
 *   (see the interceptor in api.ts), so admin edits show up right away.
 * - In the admin area reads always go to the network (and refresh the cache).
 */
import { useEffect, useState } from "react";

export const FRESH_MS = 2 * 60 * 1000; // 2 minutes
export const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const DB_NAME = "domaines-cache";
const STORE = "responses";
// Bump when the shape of cached data changes, to drop old entries.
const VERSION = "v1";

interface Entry {
  data: unknown;
  time: number;
}

type Fetcher = () => Promise<unknown>;

const memory = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();
const listeners = new Map<string, Set<(data: unknown) => void>>();

/* ---------------- IndexedDB (best effort: any failure just disables persistence) ---------------- */

let dbPromise: Promise<IDBDatabase | null> | null = null;
const openDb = (): Promise<IDBDatabase | null> => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === "undefined") return resolve(null);
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => {
        const db = request.result;
        // Let another tab upgrade or delete the database instead of blocking it forever.
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
};

const idb = async <T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest | void): Promise<T | undefined> => {
  const db = await openDb();
  if (!db) return undefined;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, mode);
      const request = run(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request ? (request.result as T) : undefined);
      tx.onerror = () => resolve(undefined);
      tx.onabort = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
};

const keyOf = (url: string) => `${VERSION}:${url}`;

const readEntry = async (url: string): Promise<Entry | undefined> => {
  const key = keyOf(url);
  const inMemory = memory.get(key);
  if (inMemory) return inMemory;
  const stored = await idb<Entry>("readonly", (store) => store.get(key));
  if (stored && Date.now() - stored.time < MAX_AGE_MS) {
    memory.set(key, stored);
    return stored;
  }
  return undefined;
};

const writeEntry = (url: string, data: unknown) => {
  const key = keyOf(url);
  const entry = { data, time: Date.now() };
  memory.set(key, entry);
  idb("readwrite", (store) => store.put(entry, key));
  listeners.get(key)?.forEach((notify) => notify(data));
};

/* ---------------- public API ---------------- */

const isAdminArea = () => typeof window !== "undefined" && window.location.hash.startsWith("#/admin");

/** One network call per URL at a time; the result is stored in the cache. */
const revalidate = (url: string, fetcher: Fetcher): Promise<unknown> => {
  const key = keyOf(url);
  const running = inflight.get(key);
  if (running) return running;
  const request = fetcher()
    .then((data) => {
      writeEntry(url, data);
      return data;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, request);
  return request;
};

/**
 * Returns the data for `url`, from cache when possible.
 * `fetcher` performs the real request and resolves with the response data.
 */
export const cachedFetch = async (url: string, fetcher: Fetcher): Promise<unknown> => {
  if (isAdminArea()) return revalidate(url, fetcher);
  const entry = await readEntry(url);
  if (!entry) return revalidate(url, fetcher);
  if (Date.now() - entry.time > FRESH_MS) {
    revalidate(url, fetcher).catch(() => undefined); // refresh in the background, keep the cached copy on failure
  }
  return entry.data;
};

/** Removes cached responses whose URL starts with `prefix` (all of them when omitted). */
export const invalidateCache = (prefix = "") => {
  const keyPrefix = keyOf(prefix);
  Array.from(memory.keys())
    .filter((key) => key.startsWith(keyPrefix))
    .forEach((key) => memory.delete(key));
  idb("readwrite", (store) => {
    const request = store.openCursor();
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      if (String(cursor.key).startsWith(keyPrefix)) cursor.delete();
      cursor.continue();
    };
    return request;
  });
};

/** Synchronous peek at the memory cache (used to render instantly without a loading state). */
export const peekCache = <T,>(url: string): T | undefined => memory.get(keyOf(url))?.data as T | undefined;

/** Calls `notify` whenever fresh data for `url` arrives. Returns an unsubscribe function. */
export const subscribeCache = (url: string, notify: (data: unknown) => void) => {
  const key = keyOf(url);
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(notify);
  return () => listeners.get(key)?.delete(notify);
};

/**
 * React hook: data for a cached GET, re-rendered when a background refresh lands.
 *   const { data, loading } = useCachedApi<Actualite[]>("/actualites", getNews);
 */
export const useCachedApi = <T,>(url: string | null, load: () => Promise<{ data: T }>) => {
  const [data, setData] = useState<T | undefined>(() => (url ? peekCache<T>(url) : undefined));
  const [loading, setLoading] = useState<boolean>(() => Boolean(url) && peekCache(url!) === undefined);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!url) return;
    let active = true;
    const unsubscribe = subscribeCache(url, (fresh) => active && setData(fresh as T));
    load()
      .then((response) => active && setData(response.data))
      .catch((e) => active && setError(e))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
      unsubscribe();
    };
    // `load` is a stable module-level API function; only the URL matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { data, loading, error };
};

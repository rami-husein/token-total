/**
 * Tiktoken File Loader with IndexedDB Caching
 * Based on tiktoken's load.py
 * 
 * Handles loading .tiktoken files from URLs and caching them in browser storage
 */

import { BytePairEncoder } from '../core/bpe.js';

/**
 * IndexedDB wrapper for caching encoding data
 */
class EncodingCache {
  constructor() {
    this.dbName = 'TokenTotalCache';
    this.storeName = 'encodings';
    this.version = 1;
    this.db = null;
  }

  /**
   * Initialize IndexedDB connection
   */
  async init() {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'name' });
        }
      };
    });
  }

  /**
   * Get cached encoding data
   * @param {string} name - Encoding name
   * @param {string} expectedHash - Expected SHA-256 hash
   * @returns {Promise<Object|null>} Cached data or null
   */
  async get(name, expectedHash) {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(name);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.hash === expectedHash) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
    });
  }

  /**
   * Store encoding data in cache
   * @param {string} name - Encoding name
   * @param {Object} data - Data to cache
   * @param {string} hash - SHA-256 hash
   */
  async set(name, data, hash) {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ name, data, hash, timestamp: Date.now() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Clear all cached data
   */
  async clear() {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// Global cache instance
const encodingCache = new EncodingCache();

/**
 * Compute SHA-256 hash of data
 * @param {string} data - Data to hash
 * @returns {Promise<string>} Hex hash string
 */
async function sha256(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Load a .tiktoken file from URL with caching
 * @param {string} url - URL to .tiktoken file
 * @param {string} expectedHash - Expected SHA-256 hash (optional but recommended)
 * @returns {Promise<Map<string, number>>} Map of byte sequences to ranks
 */
export async function loadTiktokenBpe(url, expectedHash = null) {
  const cacheName = url.split('/').pop();

  // Try cache first
  if (expectedHash) {
    try {
      const cached = await encodingCache.get(cacheName, expectedHash);
      if (cached) {
        console.log(`Loaded ${cacheName} from cache`);
        return new Map(cached);
      }
    } catch (e) {
      console.warn('Cache read failed:', e);
    }
  }

  // Fetch from network
  console.log(`Fetching ${cacheName} from ${url}`);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();

  // Verify hash if provided
  if (expectedHash) {
    const actualHash = await sha256(text);
    if (actualHash !== expectedHash) {
      throw new Error(
        `Hash mismatch for ${url}. Expected ${expectedHash}, got ${actualHash}. ` +
        `This may indicate a corrupted download or MITM attack.`
      );
    }
  }

  // Parse .tiktoken format: base64_token rank
  const ranks = new Map();
  const lines = text.split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;

    const parts = line.trim().split(' ');
    if (parts.length !== 2) {
      console.warn(`Skipping invalid line: ${line}`);
      continue;
    }

    const [tokenBase64, rankStr] = parts;
    const rank = parseInt(rankStr, 10);

    if (isNaN(rank)) {
      console.warn(`Invalid rank in line: ${line}`);
      continue;
    }

    try {
      // Decode base64 token to bytes, then convert to our key format
      const binary = atob(tokenBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const key = BytePairEncoder.bytesToKey(bytes);
      ranks.set(key, rank);
    } catch (e) {
      console.warn(`Failed to decode token: ${tokenBase64}`, e);
    }
  }

  console.log(`Loaded ${ranks.size} tokens from ${cacheName}`);

  // Cache for next time
  if (expectedHash) {
    try {
      await encodingCache.set(cacheName, Array.from(ranks.entries()), expectedHash);
    } catch (e) {
      console.warn('Cache write failed:', e);
    }
  }

  return ranks;
}

/**
 * Clear the encoding cache
 */
export async function clearCache() {
  await encodingCache.clear();
}

/**
 * Check if caching is available
 * @returns {boolean}
 */
export function isCacheAvailable() {
  return typeof indexedDB !== 'undefined' && typeof crypto?.subtle !== 'undefined';
}

/**
 * Core Byte Pair Encoding (BPE) Algorithm
 * Based on tiktoken's Rust implementation (src/lib.rs)
 * 
 * This implements the token merging algorithm that:
 * 1. Starts with individual bytes
 * 2. Repeatedly finds the lowest-rank (highest priority) adjacent pair
 * 3. Merges that pair into a single token
 * 4. Updates adjacent ranks and repeats until no more merges possible
 */

export class BytePairEncoder {
  // Debug flag - set to true to enable detailed BPE logging
  static DEBUG = false;
  
  static _log(...args) {
    if (this.DEBUG) {
      console.log('[BPE]', ...args);
    }
  }
  
  /**
   * Encode a piece of bytes into token IDs using BPE
   * @param {Map<string, number>} ranks - Map of byte sequences (as keys) to their ranks
   * @param {Uint8Array} piece - Bytes to encode
   * @returns {number[]} Array of token IDs
   */
  static encode(ranks, piece) {
    if (piece.length === 1) {
      // FIX #1: Pass entire Uint8Array, not a JS array
      const key = this.bytesToKey(piece);
      const token = ranks.get(key);
      
      // Strict validation: all single bytes should be in vocabulary
      if (token === undefined) {
        throw new Error(
          `Single byte ${piece[0]} (key: ${key}) not found in vocabulary. ` +
          `This should never happen - all 256 bytes should be in the base vocabulary.`
        );
      }
      
      return [token];
    }

    const parts = this._bytePairMerge(ranks, piece);
    
    // Convert parts to token IDs by looking up each byte slice
    const tokens = [];
    for (let i = 0; i < parts.length - 1; i++) {
      const start = parts[i].pos;
      const end = parts[i + 1].pos;
      const byteSlice = piece.slice(start, end);
      const key = this.bytesToKey(byteSlice);
      const token = ranks.get(key);
      
      // FIX #2: Strict validation - BPE should only produce valid tokens
      if (token === undefined) {
        throw new Error(
          `BPE algorithm produced sequence not in vocabulary:\n` +
          `  Bytes: [${Array.from(byteSlice).join(', ')}]\n` +
          `  Base64 key: ${key}\n` +
          `  Position: ${start}-${end} in piece of length ${piece.length}\n` +
          `  This indicates a bug in the BPE merge algorithm.`
        );
      }
      
      tokens.push(token);
    }
    
    return tokens;
  }

  /**
   * Core BPE merge algorithm
   * Implements the logic from tiktoken's _byte_pair_merge function
   * @private
   */
  static _bytePairMerge(ranks, piece) {
    this._log(`Starting BPE for piece of length ${piece.length}:`, Array.from(piece));
    
    // Array of {pos: byte_position, rank: merge_priority}
    // Lower rank = higher priority to merge
    const parts = [];
    
    // Phase 1: Initialize - find rank of each adjacent byte pair
    let minRank = { rank: Infinity, index: -1 };
    
    for (let i = 0; i < piece.length - 1; i++) {
      const pairKey = this.bytesToKey(piece.slice(i, i + 2));
      const rank = ranks.get(pairKey);
      const rankValue = rank !== undefined ? rank : Infinity;
      
      if (rankValue < minRank.rank) {
        minRank = { rank: rankValue, index: i };
      }
      
      parts.push({ pos: i, rank: rankValue });
    }
    
    // Add sentinel values at the end
    parts.push({ pos: piece.length - 1, rank: Infinity });
    parts.push({ pos: piece.length, rank: Infinity });
    
    this._log(`Initial parts: ${parts.length}, minRank:`, minRank);

    // Phase 2: Merge loop - repeatedly merge lowest-rank pair
    // FIX #3: Add iteration counter to prevent infinite loops
    let iterations = 0;
    const maxIterations = piece.length * 2;  // Theoretical max: one merge per byte pair
    
    while (minRank.rank !== Infinity) {
      // Safety check: detect infinite loops
      iterations++;
      if (iterations > maxIterations) {
        const partsDebug = parts.slice(0, 10).map((p, idx) => 
          `${idx}: pos=${p.pos} rank=${p.rank}`
        ).join(', ');
        
        throw new Error(
          `BPE merge infinite loop detected!\n` +
          `  Iterations: ${iterations} (max: ${maxIterations})\n` +
          `  Piece length: ${piece.length}\n` +
          `  Current minRank: rank=${minRank.rank} index=${minRank.index}\n` +
          `  Parts count: ${parts.length}\n` +
          `  First 10 parts: ${partsDebug}\n` +
          `  This is a critical bug in the merge algorithm.`
        );
      }
      
      this._log(`Iteration ${iterations}: merging at index ${minRank.index}, rank ${minRank.rank}`);
      
      const i = minRank.index;
      
      // Update ranks of adjacent pairs before removing the merged one
      if (i > 0) {
        parts[i - 1].rank = this._getRank(ranks, piece, parts, i - 1);
      }
      parts[i].rank = this._getRank(ranks, piece, parts, i);
      
      // Remove the second part of the merged pair
      parts.splice(i + 1, 1);

      // Find new minimum rank
      minRank = { rank: Infinity, index: -1 };
      for (let j = 0; j < parts.length - 1; j++) {
        if (parts[j].rank < minRank.rank) {
          minRank = { rank: parts[j].rank, index: j };
        }
      }
    }
    
    this._log(`BPE complete after ${iterations} iterations, final parts:`, parts.length);
    
    return parts;
  }

  /**
   * Get the rank of the pair starting at position i in parts array
   * @private
   */
  static _getRank(ranks, piece, parts, i) {
    // Need at least 3 more elements to form a valid pair
    if (i + 3 >= parts.length) {
      return Infinity;
    }
    
    const start = parts[i].pos;
    const end = parts[i + 3].pos;
    const key = this.bytesToKey(piece.slice(start, end));
    const rank = ranks.get(key);
    return rank !== undefined ? rank : Infinity;
  }

  /**
   * Convert byte array to string key for Map storage
   * Uses base64 encoding for compact, collision-free keys
   * @param {Uint8Array|number[]} bytes
   * @returns {string}
   */
  static bytesToKey(bytes) {
    let binary = '';
    const len = bytes.length;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 key back to byte array
   * @param {string} key
   * @returns {Uint8Array}
   */
  static keyToBytes(key) {
    const binary = atob(key);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}

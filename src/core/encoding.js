/**
 * Encoding class - Main tokenizer interface
 * Based on tiktoken's core.py Encoding class
 * 
 * Handles text encoding/decoding with regex splitting and special token support
 */

import { BytePairEncoder } from './bpe.js';

export class Encoding {
  /**
   * Create an Encoding instance
   * @param {string} name - Encoding name (e.g., 'cl100k_base')
   * @param {string} patStr - Regex pattern for text splitting
   * @param {Map<string, number>} mergeableRanks - Map of byte sequences to token ranks
   * @param {Object<string, number>} specialTokens - Map of special token strings to IDs
   */
  constructor(name, patStr, mergeableRanks, specialTokens = {}) {
    this.name = name;
    this._patStr = patStr;
    this._mergeableRanks = mergeableRanks;
    this._specialTokens = specialTokens;
    
    // Build decoder maps
    this._decoder = new Map();
    for (const [key, rank] of mergeableRanks) {
      this._decoder.set(rank, BytePairEncoder.keyToBytes(key));
    }
    
    this._specialTokensDecoder = new Map();
    const encoder = new TextEncoder();
    for (const [token, rank] of Object.entries(specialTokens)) {
      this._specialTokensDecoder.set(rank, encoder.encode(token));
    }
    
    // Compile regex patterns
    try {
      this._pattern = new RegExp(patStr, 'gu');
    } catch (e) {
      throw new Error(`Invalid regex pattern: ${patStr}. Error: ${e.message}`);
    }
    
    // Create regex for special tokens
    if (Object.keys(specialTokens).length > 0) {
      const specialPattern = Object.keys(specialTokens)
        .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');
      this._specialPattern = new RegExp(`(${specialPattern})`, 'g');
    } else {
      this._specialPattern = null;
    }
    
    // Calculate max token value
    const maxMergeable = mergeableRanks.size > 0 
      ? Math.max(...mergeableRanks.values()) 
      : -1;
    const maxSpecial = Object.keys(specialTokens).length > 0
      ? Math.max(...Object.values(specialTokens))
      : -1;
    this.maxTokenValue = Math.max(maxMergeable, maxSpecial);
  }

  // ==================== Encoding Methods ====================

  /**
   * Encode text into tokens, ignoring special tokens
   * This is the fastest encoding method
   * 
   * @param {string} text - Text to encode
   * @returns {number[]} Array of token IDs
   * 
   * @example
   * const tokens = encoding.encodeOrdinary("hello world");
   * // [15339, 1917] for cl100k_base
   */
  encodeOrdinary(text) {
    if (!text) return [];
    
    const matches = text.match(this._pattern);
    if (!matches) return [];
    
    const tokens = [];
    const encoder = new TextEncoder();
    
    for (const match of matches) {
      const piece = encoder.encode(match);
      const key = BytePairEncoder.bytesToKey(piece);
      
      // Fast path: check if entire piece is already a token
      const directToken = this._mergeableRanks.get(key);
      if (directToken !== undefined) {
        tokens.push(directToken);
      } else {
        // Run BPE on this piece
        const pieceTokens = BytePairEncoder.encode(this._mergeableRanks, piece);
        tokens.push(...pieceTokens);
      }
    }
    
    return tokens;
  }

  /**
   * Encode text with special token handling
   * 
   * @param {string} text - Text to encode
   * @param {Object} options - Encoding options
   * @param {Set<string>|'all'} options.allowedSpecial - Set of allowed special tokens or 'all'
   * @param {Set<string>|'all'} options.disallowedSpecial - Set of disallowed special tokens or 'all'
   * @returns {number[]} Array of token IDs
   * 
   * @example
   * const tokens = encoding.encode("hello <|endoftext|>", {
   *   allowedSpecial: new Set(['<|endoftext|>'])
   * });
   */
  encode(text, options = {}) {
    if (!text) return [];
    
    const allowedSpecial = options.allowedSpecial || new Set();
    const disallowedSpecial = options.disallowedSpecial === undefined 
      ? 'all' 
      : options.disallowedSpecial;
    
    // Build set of special tokens to check
    const specialTokensSet = new Set(Object.keys(this._specialTokens));
    
    // Determine which special tokens are actually disallowed
    let disallowedSet = new Set();
    if (disallowedSpecial === 'all') {
      disallowedSet = new Set(
        [...specialTokensSet].filter(t => 
          allowedSpecial !== 'all' && !allowedSpecial.has(t)
        )
      );
    } else if (disallowedSpecial instanceof Set) {
      disallowedSet = disallowedSpecial;
    }
    
    // Check for disallowed special tokens
    if (disallowedSet.size > 0) {
      for (const token of disallowedSet) {
        if (text.includes(token)) {
          throw new Error(
            `Encountered disallowed special token '${token}'. ` +
            `If you want this text to be encoded as a special token, ` +
            `pass it to allowedSpecial, e.g. allowedSpecial: new Set(['${token}']). ` +
            `If you want this text to be encoded as normal text, ` +
            `pass disallowedSpecial: new Set() to disable special token checking.`
          );
        }
      }
    }
    
    // Fast path: no special tokens to handle
    if (allowedSpecial !== 'all' && allowedSpecial.size === 0) {
      return this.encodeOrdinary(text);
    }
    
    // Handle special tokens
    if (!this._specialPattern) {
      return this.encodeOrdinary(text);
    }
    
    const tokens = [];
    let lastEnd = 0;
    
    const matches = [...text.matchAll(this._specialPattern)];
    
    for (const match of matches) {
      const specialToken = match[0];
      
      // Check if this special token is allowed
      const isAllowed = allowedSpecial === 'all' || allowedSpecial.has(specialToken);
      
      if (isAllowed) {
        // Encode text before special token
        if (match.index > lastEnd) {
          const textBefore = text.slice(lastEnd, match.index);
          tokens.push(...this.encodeOrdinary(textBefore));
        }
        
        // Add special token
        tokens.push(this._specialTokens[specialToken]);
        lastEnd = match.index + specialToken.length;
      }
    }
    
    // Encode remaining text
    if (lastEnd < text.length) {
      tokens.push(...this.encodeOrdinary(text.slice(lastEnd)));
    }
    
    return tokens;
  }

  /**
   * Encode a single token (must be exact match in vocabulary)
   * @param {string|Uint8Array} textOrBytes - Text or bytes to encode
   * @returns {number} Token ID
   * @throws {Error} If token not in vocabulary
   */
  encodeSingleToken(textOrBytes) {
    let bytes;
    if (typeof textOrBytes === 'string') {
      bytes = new TextEncoder().encode(textOrBytes);
      
      // Check special tokens first
      const specialToken = this._specialTokens[textOrBytes];
      if (specialToken !== undefined) {
        return specialToken;
      }
    } else {
      bytes = textOrBytes;
    }
    
    const key = BytePairEncoder.bytesToKey(bytes);
    const token = this._mergeableRanks.get(key);
    
    if (token === undefined) {
      const text = typeof textOrBytes === 'string' 
        ? textOrBytes 
        : new TextDecoder().decode(textOrBytes);
      throw new Error(`Token not in vocabulary: ${text}`);
    }
    
    return token;
  }

  // ==================== Decoding Methods ====================

  /**
   * Decode tokens into bytes
   * @param {number[]} tokens - Array of token IDs
   * @returns {Uint8Array} Decoded bytes
   */
  decodeBytes(tokens) {
    const byteArrays = [];
    let totalLength = 0;
    
    for (const token of tokens) {
      const bytes = this._decoder.get(token) || this._specialTokensDecoder.get(token);
      if (!bytes) {
        throw new Error(`Invalid token ID: ${token}`);
      }
      byteArrays.push(bytes);
      totalLength += bytes.length;
    }
    
    // Concatenate all byte arrays
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const bytes of byteArrays) {
      result.set(bytes, offset);
      offset += bytes.length;
    }
    
    return result;
  }

  /**
   * Decode tokens into a string
   * @param {number[]} tokens - Array of token IDs
   * @param {string} errors - How to handle decode errors ('replace', 'ignore', 'strict')
   * @returns {string} Decoded text
   * 
   * @example
   * const text = encoding.decode([15339, 1917]);
   * // "hello world"
   */
  decode(tokens, errors = 'replace') {
    const bytes = this.decodeBytes(tokens);
    const decoder = new TextDecoder('utf-8', { 
      fatal: errors === 'strict',
      ignoreBOM: true
    });
    
    try {
      return decoder.decode(bytes);
    } catch (e) {
      if (errors === 'ignore') {
        return decoder.decode(bytes);
      }
      throw e;
    }
  }

  /**
   * Decode a single token into bytes
   * @param {number} token - Token ID
   * @returns {Uint8Array} Token bytes
   */
  decodeSingleTokenBytes(token) {
    const bytes = this._decoder.get(token) || this._specialTokensDecoder.get(token);
    if (!bytes) {
      throw new Error(`Invalid token ID: ${token}`);
    }
    return bytes;
  }

  /**
   * Decode each token into its byte representation
   * Useful for visualizing tokenization
   * @param {number[]} tokens - Array of token IDs
   * @returns {Uint8Array[]} Array of byte arrays
   */
  decodeTokensBytes(tokens) {
    return tokens.map(token => this.decodeSingleTokenBytes(token));
  }

  // ==================== Utility Methods ====================

  /**
   * Get the end-of-text token ID
   * @returns {number} EOT token ID
   */
  get eotToken() {
    return this._specialTokens['<|endoftext|>'];
  }

  /**
   * Get set of all special token strings
   * @returns {Set<string>} Set of special tokens
   */
  get specialTokensSet() {
    return new Set(Object.keys(this._specialTokens));
  }

  /**
   * Check if a token ID is a special token
   * @param {number} token - Token ID to check
   * @returns {boolean} True if token is a special token
   */
  isSpecialToken(token) {
    return this._specialTokensDecoder.has(token);
  }

  /**
   * Get vocabulary size (for backwards compatibility)
   * @returns {number} Vocabulary size
   */
  get nVocab() {
    return this.maxTokenValue + 1;
  }

  /**
   * String representation
   * @returns {string}
   */
  toString() {
    return `<Encoding '${this.name}'>`;
  }
}

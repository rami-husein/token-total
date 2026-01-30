/**
 * Token Total - Vanilla JavaScript BPE Tokenizer
 * A tiktoken-compatible tokenizer for static websites
 * 
 * Usage:
 * import { getEncoding, encodingForModel } from './src/index.js';
 * 
 * const enc = await getEncoding('cl100k_base');
 * const tokens = enc.encode('hello world');
 * const text = enc.decode(tokens);
 */

// Re-export core classes
export { Encoding } from './core/encoding.js';
export { BytePairEncoder } from './core/bpe.js';

// Re-export loader functions
export { loadTiktokenBpe, clearCache, isCacheAvailable } from './loaders/tiktoken-loader.js';

// Re-export registry functions
export {
  getEncoding,
  encodingForModel,
  listEncodingNames,
  listModelNames,
  ENCODING_CONSTRUCTORS,
  MODEL_TO_ENCODING,
} from './encodings/registry.js';

/**
 * Quick token counting utility
 * @param {string} text - Text to count tokens for
 * @param {string} model - Model name or encoding name (default: 'gpt-4')
 * @returns {Promise<number>} Token count
 * 
 * @example
 * const count = await countTokens('Hello, world!', 'gpt-4');
 * console.log(count); // 4
 */
export async function countTokens(text, model = 'gpt-4') {
  const { getEncoding, encodingForModel, ENCODING_CONSTRUCTORS } = await import('./encodings/registry.js');
  
  let encoding;
  if (ENCODING_CONSTRUCTORS[model]) {
    encoding = await getEncoding(model);
  } else {
    encoding = await encodingForModel(model);
  }
  
  return encoding.encode(text).length;
}

/**
 * Version information
 */
export const VERSION = '1.0.0';

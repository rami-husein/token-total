/**
 * Encoding Registry
 * Based on tiktoken_ext/openai_public.py
 * 
 * Defines available encodings and their configurations
 */

import { Encoding } from '../core/encoding.js';
import { loadTiktokenBpe } from '../loaders/tiktoken-loader.js';

// Special tokens used across encodings
const ENDOFTEXT = '<|endoftext|>';
const FIM_PREFIX = '<|fim_prefix|>';
const FIM_MIDDLE = '<|fim_middle|>';
const FIM_SUFFIX = '<|fim_suffix|>';
const ENDOFPROMPT = '<|endofprompt|>';

// Encoding configurations
// Now using local files to avoid CORS issues
export const ENCODING_CONSTRUCTORS = {
  // GPT-4 / GPT-3.5-turbo encodings
  cl100k_base: {
    url: new URL('../../public/encodings/cl100k_base.tiktoken', import.meta.url).href,
    hash: '223921b76ee99bde995b7ff738513eef100fb51d18c93597a113bcffe865b2a7',
    patStr: `'(?i:[sdmt]|ll|ve|re)|[^\\r\\n\\p{L}\\p{N}]?\\p{L}+|\\p{N}{1,3}| ?[^\\s\\p{L}\\p{N}]+[\\r\\n]*|\\s+$|\\s*[\\r\\n]|\\s+(?!\\S)|\\s`,
    specialTokens: {
      [ENDOFTEXT]: 100257,
      [FIM_PREFIX]: 100258,
      [FIM_MIDDLE]: 100259,
      [FIM_SUFFIX]: 100260,
      [ENDOFPROMPT]: 100276,
    },
    explicitNVocab: 100277,
  },

  // o200k_base (GPT-4o, GPT-4o-mini)
  o200k_base: {
    url: new URL('../../public/encodings/o200k_base.tiktoken', import.meta.url).href,
    hash: '446a9538cb6c348e3516120d7c08b09f57c36495e2acfffe59a5bf8b0cfb1a2d',
    patStr: `[^\\r\\n\\p{L}\\p{N}]?[\\p{Lu}\\p{Lt}\\p{Lm}\\p{Lo}\\p{M}]*[\\p{Ll}\\p{Lm}\\p{Lo}\\p{M}]+(?i:'s|'t|'re|'ve|'m|'ll|'d)?|[^\\r\\n\\p{L}\\p{N}]?[\\p{Lu}\\p{Lt}\\p{Lm}\\p{Lo}\\p{M}]+[\\p{Ll}\\p{Lm}\\p{Lo}\\p{M}]*(?i:'s|'t|'re|'ve|'m|'ll|'d)?|\\p{N}{1,3}| ?[^\\s\\p{L}\\p{N}]+[\\r\\n/]*|\\s*[\\r\\n]+|\\s+(?!\\S)|\\s+`,
    specialTokens: {
      [ENDOFTEXT]: 199999,
      [ENDOFPROMPT]: 200018,
    },
    explicitNVocab: 200019,
  },

  // GPT-2 / GPT-3 encodings
  r50k_base: {
    url: new URL('../../public/encodings/r50k_base.tiktoken', import.meta.url).href,
    hash: '306cd27f03c1a714eca7108e03d66b7dc042abe8c258b44c199a7ed9838dd930',
    patStr: `'(?:[sdmt]|ll|ve|re)| ?\\p{L}+| ?\\p{N}+| ?[^\\s\\p{L}\\p{N}]+|\\s+$|\\s+(?!\\S)|\\s`,
    specialTokens: {
      [ENDOFTEXT]: 50256,
    },
    explicitNVocab: 50257,
  },

  p50k_base: {
    url: new URL('../../public/encodings/p50k_base.tiktoken', import.meta.url).href,
    hash: '94b5ca7dff4d00767bc256fdd1b27e5b17361d7b8a5f968547f9f23eb70d2069',
    patStr: `'(?:[sdmt]|ll|ve|re)| ?\\p{L}+| ?\\p{N}+| ?[^\\s\\p{L}\\p{N}]+|\\s+$|\\s+(?!\\S)|\\s`,
    specialTokens: {
      [ENDOFTEXT]: 50256,
    },
    explicitNVocab: 50281,
  },

  p50k_edit: {
    url: new URL('../../public/encodings/p50k_base.tiktoken', import.meta.url).href,
    hash: '94b5ca7dff4d00767bc256fdd1b27e5b17361d7b8a5f968547f9f23eb70d2069',
    patStr: `'(?:[sdmt]|ll|ve|re)| ?\\p{L}+| ?\\p{N}+| ?[^\\s\\p{L}\\p{N}]+|\\s+$|\\s+(?!\\S)|\\s`,
    specialTokens: {
      [ENDOFTEXT]: 50256,
      [FIM_PREFIX]: 50281,
      [FIM_MIDDLE]: 50282,
      [FIM_SUFFIX]: 50283,
    },
  },
};

// Model to encoding mapping
export const MODEL_TO_ENCODING = {
  // GPT-4o models
  'gpt-4o': 'o200k_base',
  'gpt-4o-mini': 'o200k_base',
  'gpt-4o-2024-08-06': 'o200k_base',
  'gpt-4o-2024-05-13': 'o200k_base',
  'gpt-4o-mini-2024-07-18': 'o200k_base',
  
  // GPT-4 models (cl100k_base)
  'gpt-4': 'cl100k_base',
  'gpt-4-turbo': 'cl100k_base',
  'gpt-4-turbo-preview': 'cl100k_base',
  'gpt-4-0125-preview': 'cl100k_base',
  'gpt-4-1106-preview': 'cl100k_base',
  'gpt-4-vision-preview': 'cl100k_base',
  'gpt-4-0314': 'cl100k_base',
  'gpt-4-0613': 'cl100k_base',
  'gpt-4-32k': 'cl100k_base',
  'gpt-4-32k-0314': 'cl100k_base',
  'gpt-4-32k-0613': 'cl100k_base',
  
  // GPT-3.5-turbo models (cl100k_base)
  'gpt-3.5-turbo': 'cl100k_base',
  'gpt-3.5-turbo-16k': 'cl100k_base',
  'gpt-3.5-turbo-0125': 'cl100k_base',
  'gpt-3.5-turbo-1106': 'cl100k_base',
  'gpt-3.5-turbo-0613': 'cl100k_base',
  'gpt-3.5-turbo-16k-0613': 'cl100k_base',
  'gpt-3.5-turbo-0301': 'cl100k_base',
  
  // Older GPT-3 models
  'text-davinci-003': 'p50k_base',
  'text-davinci-002': 'p50k_base',
  'text-davinci-001': 'r50k_base',
  'text-curie-001': 'r50k_base',
  'text-babbage-001': 'r50k_base',
  'text-ada-001': 'r50k_base',
  'davinci': 'r50k_base',
  'curie': 'r50k_base',
  'babbage': 'r50k_base',
  'ada': 'r50k_base',
  
  // Code models
  'code-davinci-002': 'p50k_base',
  'code-davinci-001': 'p50k_base',
  'code-cushman-002': 'p50k_base',
  'code-cushman-001': 'p50k_base',
  'davinci-codex': 'p50k_base',
  'cushman-codex': 'p50k_base',
  
  // Embeddings models
  'text-embedding-ada-002': 'cl100k_base',
  'text-embedding-3-small': 'cl100k_base',
  'text-embedding-3-large': 'cl100k_base',
};

// Cache for loaded encodings
const encodingCache = new Map();

/**
 * Get an encoding by name
 * @param {string} encodingName - Name of the encoding (e.g., 'cl100k_base')
 * @returns {Promise<Encoding>} Encoding instance
 */
export async function getEncoding(encodingName) {
  // Check cache
  if (encodingCache.has(encodingName)) {
    console.log(`Using cached encoding: ${encodingName}`);
    return encodingCache.get(encodingName);
  }

  console.log(`Loading encoding: ${encodingName}`);

  // Get configuration
  const config = ENCODING_CONSTRUCTORS[encodingName];
  if (!config) {
    throw new Error(
      `Unknown encoding: ${encodingName}. ` +
      `Available encodings: ${Object.keys(ENCODING_CONSTRUCTORS).join(', ')}`
    );
  }

  try {
    console.log(`Step 1: Loading mergeable ranks from ${config.url}`);
    // Load mergeable ranks
    const mergeableRanks = await loadTiktokenBpe(config.url, config.hash);
    console.log(`Step 1 complete: Loaded ${mergeableRanks.size} ranks`);

    console.log(`Step 2: Creating Encoding object`);
    // Create encoding
    const encoding = new Encoding(
      encodingName,
      config.patStr,
      mergeableRanks,
      config.specialTokens
    );
    console.log(`Step 2 complete: Encoding created`);

    console.log(`Step 3: Verifying vocab size`);
    // Verify vocab size if specified
    if (config.explicitNVocab) {
      const actualVocabSize = mergeableRanks.size + Object.keys(config.specialTokens).length;
      if (actualVocabSize !== config.explicitNVocab) {
        console.warn(
          `Vocab size mismatch for ${encodingName}: ` +
          `expected ${config.explicitNVocab}, got ${actualVocabSize}`
        );
      }
    }
    console.log(`Step 3 complete: Vocab size verified`);

    // Cache and return
    encodingCache.set(encodingName, encoding);
    console.log(`Encoding ${encodingName} ready!`);
    return encoding;
  } catch (error) {
    console.error(`Failed to load encoding ${encodingName}:`, error);
    throw error;
  }
}

/**
 * Get encoding for a specific model
 * @param {string} modelName - Model name (e.g., 'gpt-4')
 * @returns {Promise<Encoding>} Encoding instance
 */
export async function encodingForModel(modelName) {
  const encodingName = MODEL_TO_ENCODING[modelName];
  
  if (!encodingName) {
    throw new Error(
      `No encoding found for model: ${modelName}. ` +
      `If this is a new model, you may need to update the registry.`
    );
  }

  return getEncoding(encodingName);
}

/**
 * List all available encoding names
 * @returns {string[]} Array of encoding names
 */
export function listEncodingNames() {
  return Object.keys(ENCODING_CONSTRUCTORS);
}

/**
 * List all supported model names
 * @returns {string[]} Array of model names
 */
export function listModelNames() {
  return Object.keys(MODEL_TO_ENCODING);
}

# Project Structure

This document describes the folder and file organization of Token Total.

## Root Directory

```
token-total/
├── src/                    # Core source code
├── public/                 # Static assets (vocabulary files)
├── examples/               # Demo pages
├── test/                   # Test suite
├── test-single-byte.html   # Debug test page
├── index.html              # Landing page
├── package.json            # Project metadata
├── README.md               # User-facing documentation
├── CHANGELOG.md            # Version history and changes
├── DECISIONS.md            # Architecture decision records
├── PROJECT_STRUCTURE.md    # This file
└── ROADMAP.md              # Future plans and ideas
```

## Source Code (`src/`)

### Core Algorithm (`src/core/`)

**`src/core/bpe.js`** (203 lines)
- Implements Byte Pair Encoding algorithm
- Based on tiktoken's Rust implementation (`tiktoken/src/lib.rs`)
- Exports `BytePairEncoder` class with static methods
- Key methods:
  - `encode(ranks, piece)` - Encode bytes to token IDs
  - `_bytePairMerge(ranks, piece)` - Core BPE merge loop
  - `bytesToKey(bytes)` - Convert bytes to base64 key
  - `keyToBytes(key)` - Convert base64 key to bytes
- Includes debug logging (enable with `BytePairEncoder.DEBUG = true`)
- Has infinite loop protection and strict validation

**`src/core/encoding.js`** (354 lines)
- Main `Encoding` class (public API)
- Handles text splitting, encode/decode operations
- Manages special tokens and regex patterns
- Key methods:
  - `encode(text, options)` - Encode text to tokens
  - `encodeOrdinary(text)` - Fast path without special tokens
  - `decode(tokens)` - Decode tokens to text
  - `decodeBytes(tokens)` - Decode tokens to bytes
- Compiles regex patterns for text splitting

### Data Loading (`src/loaders/`)

**`src/loaders/tiktoken-loader.js`** (229 lines)
- Loads .tiktoken vocabulary files
- Implements IndexedDB caching for offline support
- Exports:
  - `loadTiktokenBpe(url, expectedHash)` - Load and parse .tiktoken file
  - `clearCache()` - Clear IndexedDB cache
  - `isCacheAvailable()` - Check browser support
- Includes SHA-256 hash verification
- Progress logging for large files (every 50k lines)

### Registry (`src/encodings/`)

**`src/encodings/registry.js`** (222 lines)
- Defines available encodings and model mappings
- Exports:
  - `getEncoding(encodingName)` - Get encoding by name
  - `encodingForModel(modelName)` - Get encoding for specific model
  - `listEncodingNames()` - List available encodings
  - `listModelNames()` - List supported models
- Contains `ENCODING_CONSTRUCTORS` with URL, hash, regex pattern, special tokens
- Contains `MODEL_TO_ENCODING` mapping 50+ OpenAI models
- Implements in-memory caching

### Public API (`src/index.js`)

Exports all public functions from core modules:
- Encoding functions: `getEncoding`, `encodingForModel`
- Utility functions: `countTokens`, `listEncodingNames`, `listModelNames`
- Core classes: `Encoding`, `BytePairEncoder`

## Static Assets (`public/`)

### Vocabulary Files (`public/encodings/`)

```
public/encodings/
├── cl100k_base.tiktoken    # 1.7 MB, 100,256 tokens (GPT-4, GPT-3.5)
├── o200k_base.tiktoken     # 3.5 MB, 199,998 tokens (GPT-4o)
├── p50k_base.tiktoken      # 817 KB, 50,280 tokens (GPT-3)
└── r50k_base.tiktoken      # 816 KB, 50,256 tokens (GPT-2)
```

Format: `<base64_token> <rank>`
Example: `IQ== 0` (byte 33, '!' character, rank 0)

## Examples (`examples/`)

**`examples/simple.html`** (322 lines)
- Basic token counter interface
- Model selector (GPT-4o, GPT-4, GPT-3.5)
- Real-time token counting
- Displays: token count, character count, chars/token ratio

**`examples/advanced.html`**
- Token visualization with color coding
- Hover to see individual tokens
- Byte-level breakdown

## Tests

**`test/index.html`**
- Test suite comparing with tiktoken outputs
- Multiple test cases

**`test-single-byte.html`** (NEW - 269 lines)
- Comprehensive debug test suite
- 7 test cases:
  1. Load encoding
  2. Single character encoding
  3. Simple word
  4. Two words
  5. Full sentence
  6. Empty string
  7. Unicode
- Visual pass/fail indicators
- Detailed console logging

## Root Files

**`index.html`**
- Landing page
- Project description and quick start

**`package.json`**
- Project metadata
- No dependencies (only metadata)

**`README.md`**
- User documentation
- API reference
- Quick start guide
- Examples and FAQ

## Documentation Files

**`CHANGELOG.md`**
- Version history
- Bug fixes and features by date
- Breaking changes

**`DECISIONS.md`**
- Architecture Decision Records (ADR)
- Technical decisions with context and consequences
- 7 ADRs documented

**`PROJECT_STRUCTURE.md`**
- This file
- Folder and file responsibilities

**`ROADMAP.md`**
- Future features and improvements
- Prioritized backlog

## File Size Summary

| Category | Files | Total Size |
|----------|-------|------------|
| Source code | 5 JS files | ~50 KB |
| Vocabulary files | 4 .tiktoken | ~7 MB |
| Examples | 2 HTML | ~20 KB |
| Tests | 2 HTML | ~15 KB |
| Documentation | 5 MD files | ~30 KB |
| **Total** | **18 files** | **~7.1 MB** |

## Key Design Principles

1. **Single Responsibility**: Each file has one clear purpose
2. **Minimal Dependencies**: No npm packages, pure ES modules
3. **Explicit Imports**: All imports are named, no wildcards
4. **Static Typing**: JSDoc comments for IDE support
5. **Error Handling**: Descriptive errors at public API boundaries
6. **Performance**: Hot paths optimized (BPE algorithm, token lookup)
7. **Debuggability**: Comprehensive logging with prefixes

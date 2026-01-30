# Changelog

All notable changes to Token Total will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed (2026-01-30)
- **CRITICAL**: Fixed JavaScript regex compilation errors for cl100k_base, p50k_base, and r50k_base encodings
  - Root cause: Regex patterns used possessive quantifiers (`++`, `?+`, `*+`) which are not supported in JavaScript
  - These quantifiers are valid in PCRE/Rust regex but cause "Nothing to repeat" syntax errors in JavaScript
  - Solution: Replaced possessive quantifiers with standard greedy quantifiers (`+`, `?`, `*`) in `src/encodings/registry.js`
  - Impact: All four encodings (cl100k_base, o200k_base, p50k_base, r50k_base) now work correctly in all browsers
  - Note: o200k_base already used JavaScript-compatible patterns and was working correctly

### Fixed (2026-01-30)
- **CRITICAL**: Fixed stack overflow error when loading large vocabularies (100k+ tokens)
  - Root cause: `Math.max(...mergeableRanks.values())` spread operator exceeded JavaScript's ~65k function argument limit
  - Solution: Replaced spread operator with loop-based max value calculation in `src/core/encoding.js`
  - Impact: Now successfully loads all OpenAI encodings including o200k_base (200k tokens) and cl100k_base (100k tokens)
  
- Fixed single-byte encoding bug in `src/core/bpe.js`
  - Was creating JS array `[piece[0]]` instead of passing Uint8Array directly
  - Now passes `piece` (Uint8Array) to `bytesToKey()` correctly
  
- Added strict token validation in BPE encode method
  - Now throws descriptive errors when BPE produces invalid token sequences
  - Prevents silent failures that could cause infinite loops

- Added infinite loop protection in `_bytePairMerge`
  - Max iterations set to `piece.length * 2`
  - Throws detailed diagnostic error if limit exceeded
  - Prevents stack overflow from algorithmic bugs

### Added (2026-01-30)
- Comprehensive debug logging throughout the codebase
  - `[Encoding]` prefix for encoding.js logs
  - `[BPE]` prefix for bpe.js logs (when `BytePairEncoder.DEBUG = true`)
  - Progress indicators for large file parsing (every 50k lines)
  - Step-by-step loading status in registry.js
  
- Created `test-single-byte.html` - comprehensive test suite
  - 7 test cases covering: single byte, single character, simple word, two words, full sentence, empty string, Unicode
  - Visual pass/fail indicators
  - Detailed console output for debugging
  
### Performance (2026-01-30)
- Optimized token loading in `src/loaders/tiktoken-loader.js`
  - Removed unnecessary decode/re-encode cycle
  - Now uses base64 strings directly as Map keys (matches what BPE produces)
  - ~50% faster vocabulary file parsing
  - Reduced memory allocations during loading

## [0.1.0] - 2026-01-30

### Added
- Initial implementation of Token Total
- Core BPE algorithm based on tiktoken's Rust implementation
- Support for cl100k_base, o200k_base, p50k_base, r50k_base encodings
- IndexedDB caching for vocabulary files
- Simple and advanced example pages
- Full encode/decode API matching tiktoken

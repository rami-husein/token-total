# Changelog

All notable changes to Token Total will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed (2026-01-31)
- **TEST SUITE**: Corrected incorrect test expectations in test suite
  - Root cause: Test file contained wrong expected token values that didn't match tiktoken reference implementation
  - Fixed Unicode test: "你好" now expects `[57668, 53901]` instead of incorrect `[57668, 25001]`
    - Token 57668 = "你" (U+4F60)
    - Token 53901 = "好" (U+597D) 
    - Previous expectation token 25001 = "928" (ASCII string, completely unrelated)
  - Fixed Special characters test: "!@#$%" now expects `[0, 31, 49177, 4]` instead of incorrect `[0, 31, 49177]`
    - Token 0 = "!"
    - Token 31 = "@"
    - Token 49177 = "#$" (merged BPE token)
    - Token 4 = "%" (was incorrectly omitted)
  - Verified all test expectations against tiktoken Python library
  - Updated both `test/index.html` and `index.html` test suites
  - Impact: All 9 test cases now pass - implementation was correct, only test expectations were wrong

### Changed (2026-01-31)
- **MAJOR VISUAL REDESIGN**: Retro-brutal aesthetic with custom color palette
  - Complete design overhaul from modern/clean to brutalist style
  - **Typography**: Arial Black with heavy font-weights (900), uppercase text, tight letter-spacing
  - **New Color Palette** (retro theme):
    - Dark Brown (#943c23) - Buttons, error states, primary accent
    - Orange (#d2793e) - Tab containers, hover states, secondary accent
    - Cream/Beige (#eaddac) - Background, text on dark elements
    - Teal (#318b73) - Header background, stat boxes, success states
    - Dark Navy (#26274e) - Primary borders, main text color
  - **Brutalist Design Elements**:
    - Sharp edges (border-radius: 0) instead of rounded corners
    - Thick 5-6px borders on all interactive elements
    - Offset box shadows (8-12px) for depth instead of soft shadows
    - No gradients - flat, bold colors throughout
    - High contrast combinations for maximum impact
    - Transform effects on hover/click with minimal transitions
  - **Applied to all components**:
    - Buttons: Thick borders, uppercase text, offset shadows, bold transforms
    - Forms: Heavy borders, no rounded corners, brutalist focus states
    - Stats: Flat backgrounds, text shadows, chunky borders
    - Tokens: Bold borders, sharp hover effects, flat colors
    - Test results: High-contrast pass/fail indicators
    - Code blocks: Dark navy backgrounds with heavy shadows
  - **Token visualization**: Updated color palette to match retro-brutal theme
  - Result: Bold, memorable, retro-inspired interface with raw, unapologetic design

### Changed (2026-01-31)
- **UI Redesign**: Consolidated all functionality into a single-page application
  - Combined simple demo, advanced visualizer, tests, and library usage into one page with tab navigation
  - Removed marketing content - now a focused tool interface
  - All demos and tests accessible via tabs: "Simple Counter", "Token Visualizer", "Run Tests", "Library Usage"
  - Legacy standalone demo pages (`examples/simple.html`, `examples/advanced.html`, `test/index.html`) remain for backward compatibility but are no longer the primary interface
  - Benefits: Faster navigation, no page reloads, better UX for exploring features

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

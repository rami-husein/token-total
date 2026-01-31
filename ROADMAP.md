# Roadmap

Future features and improvements for Token Total.

## Status Legend
- 🟢 **Completed**: Implemented and working
- 🟡 **In Progress**: Currently being worked on
- 🔵 **Planned**: Agreed to implement
- ⚪ **Proposed**: Idea for consideration

---

## Completed ✅

### v0.1.0 - Initial Release (2026-01-30)
- ✅ Core BPE algorithm implementation
- ✅ Support for cl100k_base, o200k_base, p50k_base, r50k_base
- ✅ IndexedDB caching
- ✅ Simple and advanced example pages
- ✅ Full encode/decode API

### Critical Bug Fixes (2026-01-30)
- ✅ Fixed stack overflow with large vocabularies (Math.max spread operator)
- ✅ Fixed single-byte encoding bug
- ✅ Added strict token validation
- ✅ Added infinite loop protection
- ✅ Optimized vocabulary loading (50% faster)
- ✅ Added comprehensive debug logging
- ✅ Fixed regex compilation errors (possessive quantifiers incompatible with JavaScript)

### UI/UX Improvements (2026-01-31)
- ✅ **Single-Page Application**: Consolidated all demos and tests into unified tab-based interface
- ✅ Removed marketing content - focused purely on tool functionality
- ✅ Tab navigation: Simple Counter, Token Visualizer, Run Tests, Library Usage
- ✅ Instant switching between features (no page reloads)
- ✅ Integrated API documentation with syntax-highlighted examples
- ✅ **Custom Color Palette**: Applied unique brand identity with teal/brown/tan color scheme across entire application

---

## Near Term (Next 1-2 Weeks)

### Performance Optimizations 🔵
- **Web Worker Support** (High Priority)
  - Move encoding to background thread
  - Prevent UI blocking on large texts
  - Batch processing API
  
- **Lazy Loading** (Medium Priority)
  - Load vocabulary on-demand instead of upfront
  - Reduce initial page load time
  - Stream vocabulary in chunks

- **Compiled Regex Caching** (Low Priority)
  - Cache compiled regex patterns across instances
  - Minor performance improvement

### Developer Experience 🔵
- **TypeScript Definitions** (High Priority)
  - Add `.d.ts` files for IDE autocomplete
  - Better type safety for users
  - No runtime overhead
  
- **NPM Package** (Medium Priority)
  - Publish to npm for easier installation
  - Support both ES modules and CommonJS
  - Bundle size optimization

### Testing 🔵
- **Automated Test Suite** (High Priority)
  - Compare outputs with OpenAI tokenizer API
  - Test all supported models
  - Edge case coverage (Unicode, empty strings, very long texts)
  
- **Performance Benchmarks** (Medium Priority)
  - Track encoding speed over time
  - Memory usage profiling
  - Compare with tiktoken Python

---

## Medium Term (Next 1-3 Months)

### Features ⚪

**Token Visualization Widget**
- Embeddable widget for documentation sites
- Configurable colors and styles
- Copy-paste integration

**Batch Processing API**
- Process multiple texts efficiently
- Progress callbacks
- Cancellation support

**CLI Tool**
- Node.js command-line interface
- File processing
- Streaming support for large files

**Token Counting for Code**
- Language-aware token counting
- Support for function signatures, comments
- Integration with code editors

### Documentation ⚪

**Interactive Tutorial**
- Step-by-step guide for new users
- Live code examples
- Common use cases

**API Reference Site**
- Searchable documentation
- Code examples for each method
- Migration guide from Python tiktoken

**Video Tutorials**
- Quick start (2-3 minutes)
- Advanced usage (5-10 minutes)
- Integration examples

---

## Long Term (3+ Months)

### Advanced Features ⚪

**Custom Encodings**
- Support user-provided .tiktoken files
- Training new BPE models
- Vocabulary merging

**Token-Level Operations**
- Token replacement/substitution
- Token-aware text truncation
- Smart text splitting at token boundaries

**Multi-Language Support**
- Chinese, Japanese, Arabic tokenization analysis
- Language-specific token statistics
- Comparison across languages

**Integration Libraries**
- React hooks (useTokenizer)
- Vue composables
- Svelte stores
- Web Components

### Infrastructure ⚪

**CDN Distribution**
- Host vocabulary files on fast CDN
- Version management
- Automatic updates

**Progressive Web App**
- Offline-first
- Install as desktop app
- Native feel

**Browser Extension**
- Count tokens in any text field
- Context menu integration
- ChatGPT integration

---

## Ideas for Consideration ⚪

### Community Features
- Share tokenization patterns
- Community-contributed examples
- Plugin system for extensions

### Enterprise Features
- Custom vocabulary management
- Team sharing and collaboration
- Usage analytics and monitoring

### Research Tools
- Token frequency analysis
- Vocabulary coverage metrics
- Compare tokenization across models
- Export to various formats (JSON, CSV)

---

## Non-Goals

Things we've decided NOT to do:

- ❌ **Server-side rendering**: Keep it client-only
- ❌ **Framework dependencies**: Stay framework-agnostic
- ❌ **Heavy build process**: Maintain zero-build philosophy
- ❌ **Automatic vocabulary updates**: Let users control versions
- ❌ **Non-OpenAI encodings**: Focus on tiktoken compatibility

---

## Contributing

Want to help with any of these features? Check the project repository for contribution guidelines!

Items move from Proposed → Planned → In Progress → Completed based on:
1. User demand and feedback
2. Implementation complexity
3. Alignment with project goals
4. Available contributor time

# Token Total

**A vanilla JavaScript implementation of tiktoken (BPE tokenizer) for static websites**

Token Total is a pure JavaScript port of OpenAI's tiktoken library, designed to run entirely in the browser without any server-side dependencies. Perfect for building token counters, text analyzers, and other tools that need to work with OpenAI API token limits.

## Features

✅ **Zero Dependencies** - Pure vanilla JavaScript ES2020+  
✅ **Offline-Ready** - Works completely in the browser with IndexedDB caching  
✅ **Full Compatibility** - Matches tiktoken's output exactly  
✅ **Multiple Encodings** - Supports GPT-4o, GPT-4, GPT-3.5, and older models  
✅ **Fast** - Optimized BPE algorithm with minimal overhead  
✅ **Static Hosting** - Deploy to GitHub Pages, Netlify, Vercel, etc.

## Quick Start

### 1. Clone and Serve

```bash
git clone https://github.com/yourusername/token-total.git
cd token-total
python -m http.server 8000
```

Then open `http://localhost:8000/examples/simple.html`

### 2. Use in Your Project

```html
<!DOCTYPE html>
<html>
<head>
  <title>Token Counter</title>
</head>
<body>
  <textarea id="input"></textarea>
  <div>Token count: <span id="count">0</span></div>

  <script type="module">
    import { encodingForModel } from './src/index.js';

    const encoding = await encodingForModel('gpt-4');
    
    document.getElementById('input').addEventListener('input', (e) => {
      const tokens = encoding.encode(e.target.value);
      document.getElementById('count').textContent = tokens.length;
    });
  </script>
</body>
</html>
```

## API Reference

### Get an Encoding

```javascript
import { getEncoding, encodingForModel } from './src/index.js';

// By encoding name
const enc = await getEncoding('cl100k_base');

// By model name
const enc = await encodingForModel('gpt-4');
```

### Encode Text

```javascript
// Basic encoding
const tokens = enc.encode('Hello, world!');
// [9906, 11, 1917, 0]

// With special tokens
const tokens = enc.encode('Hello <|endoftext|>', {
  allowedSpecial: new Set(['<|endoftext|>'])
});
```

### Decode Tokens

```javascript
// Decode to string
const text = enc.decode([9906, 11, 1917, 0]);
// "Hello, world!"

// Decode to bytes
const bytes = enc.decodeBytes([9906, 11, 1917, 0]);
// Uint8Array [72, 101, 108, 108, 111, ...]

// Decode each token separately (useful for visualization)
const tokenTexts = enc.decodeTokensBytes([9906, 11, 1917, 0]);
// [Uint8Array[...], Uint8Array[...], ...]
```

### Token Counting

```javascript
import { countTokens } from './src/index.js';

const count = await countTokens('Hello, world!', 'gpt-4');
// 4
```

### Available Encodings

```javascript
import { listEncodingNames, listModelNames } from './src/index.js';

console.log(listEncodingNames());
// ['cl100k_base', 'o200k_base', 'p50k_base', 'r50k_base', ...]

console.log(listModelNames());
// ['gpt-4', 'gpt-4o', 'gpt-3.5-turbo', ...]
```

## Supported Models

| Model | Encoding | Vocab Size |
|-------|----------|------------|
| GPT-4o, GPT-4o-mini | o200k_base | 200,019 |
| GPT-4, GPT-3.5-turbo | cl100k_base | 100,277 |
| GPT-3 (davinci, curie, etc.) | p50k_base | 50,281 |
| GPT-2 | r50k_base | 50,257 |

Full model list in `src/encodings/registry.js`

## How It Works

Token Total implements the Byte Pair Encoding (BPE) algorithm used by OpenAI's models:

1. **Text Splitting**: Input text is split using a regex pattern into chunks (words, numbers, etc.)
2. **Byte Encoding**: Each chunk is converted to UTF-8 bytes
3. **BPE Merging**: Bytes are iteratively merged based on learned merge rules
4. **Token IDs**: Final merged sequences are looked up in the vocabulary

### Architecture

```
src/
├── core/
│   ├── bpe.js              # Core BPE algorithm (based on tiktoken's Rust code)
│   └── encoding.js         # Encoding class (encode/decode methods)
├── loaders/
│   └── tiktoken-loader.js  # Loads .tiktoken files with IndexedDB caching
├── encodings/
│   └── registry.js         # Encoding/model registry
└── index.js                # Public API
```

### Data Files

Vocabulary files are loaded from OpenAI's CDN:
- **cl100k_base**: 1.6 MB (GPT-4)
- **o200k_base**: ~2 MB (GPT-4o)
- **r50k_base**: 456 KB (GPT-2/3)

Files are cached in IndexedDB after first load for offline use.

## Examples

### Simple Token Counter
`examples/simple.html` - Basic token counting interface

### Advanced Visualizer
`examples/advanced.html` - Color-coded token visualization with details

### Tests
`test/index.html` - Test suite comparing outputs with tiktoken

## Performance

- **First Load**: 2-5 seconds (downloads ~1.6MB vocabulary file)
- **Subsequent Loads**: Instant (cached in IndexedDB)
- **Encoding Speed**: ~50-200 KB/s of text (varies by browser/hardware)
- **Memory Usage**: ~10-20 MB (vocabulary + working memory)

For large texts (>100KB), consider using Web Workers to avoid blocking the UI.

## Browser Compatibility

Requires modern browsers with:
- ES2020+ support (ES modules, optional chaining, nullish coalescing)
- IndexedDB for caching
- TextEncoder/TextDecoder for UTF-8 handling
- Crypto API for hash verification

Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Comparison with Python tiktoken

| Feature | Token Total (JS) | tiktoken (Python) |
|---------|------------------|-------------------|
| Language | JavaScript | Python (with Rust) |
| Platform | Browser | Server/CLI |
| Speed | ~50-200 KB/s | ~5-20 MB/s |
| Dependencies | None | Rust compiler for build |
| Caching | IndexedDB | File system |
| Use Case | Static sites, client-side apps | Server apps, data processing |

Token Total prioritizes **ease of deployment** and **zero-dependency** over raw speed.

## Development

```bash
# Serve examples
python -m http.server 8000

# Run tests
open http://localhost:8000/test/index.html

# Project structure
token-total/
├── src/                # Source code
├── examples/           # Demo pages
├── test/               # Tests
├── package.json        # Metadata
└── README.md          # This file
```

## License

MIT License - feel free to use in your projects!

## Credits

- Based on [tiktoken](https://github.com/openai/tiktoken) by OpenAI
- BPE algorithm implementation inspired by tiktoken's Rust code
- Vocabulary files hosted by OpenAI

## FAQ

**Q: Does this send my text to a server?**  
A: No! Everything runs locally in your browser. Vocabulary files are downloaded once from OpenAI's CDN, then cached.

**Q: Can I use this offline?**  
A: Yes, after the first load. The vocabulary is cached in IndexedDB.

**Q: Why are the token counts different from ChatGPT?**  
A: Make sure you're using the correct model encoding. GPT-4 uses `cl100k_base`, GPT-4o uses `o200k_base`.

**Q: Can I add custom encodings?**  
A: Yes! See `src/encodings/registry.js` for examples. You'll need a `.tiktoken` vocabulary file.

**Q: How accurate is this compared to tiktoken?**  
A: 100% accurate - it uses the same vocabulary files and BPE algorithm. Run `test/index.html` to verify.

## Contributing

Contributions welcome! Areas for improvement:
- Performance optimizations
- Additional examples
- Documentation improvements
- Bug fixes

## Links

- [OpenAI Tiktoken](https://github.com/openai/tiktoken)
- [BPE Paper](https://arxiv.org/abs/1508.07909)
- [OpenAI Tokenizer](https://platform.openai.com/tokenizer)

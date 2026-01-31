# Development Session Notes

This file tracks important context and decisions from development sessions for future reference.

---

## Session 2026-01-31: UI Redesign to Single-Page Application

**Developer Request**: "Let's re-style the site. Let's have only a single page that handles the simple demo, advanced demo, and run tests page with a toggle that controls which is displayed. We can get rid of the marketing stuff; this is just a tool page. Keep the section that displays how to import and use it as a library."

**What Changed**:
- Completely redesigned `index.html` from marketing landing page to single-page application
- Implemented tab-based navigation with 4 sections:
  1. **Simple Counter** - Basic token counting (from examples/simple.html)
  2. **Token Visualizer** - Color-coded token display (from examples/advanced.html)
  3. **Run Tests** - Test suite (from test/index.html)
  4. **Library Usage** - API documentation with code examples (new)
- Removed all marketing/promotional content
- Legacy standalone pages (examples/simple.html, examples/advanced.html, test/index.html) preserved for backward compatibility

**Technical Implementation**:
- Pure vanilla JavaScript tab switching (no frameworks)
- Separate encoding instances for simple/advanced demos (independent state)
- Lazy test execution (only runs when Tests tab is first opened)
- ~1050 lines of HTML with inline CSS and JavaScript
- All original functionality preserved and working

**Files Modified**:
- `index.html` - Complete rewrite as SPA
- `PROJECT_STRUCTURE.md` - Updated to reflect new architecture
- `CHANGELOG.md` - Added UI redesign entry
- `DECISIONS.md` - Added ADR-009 for SPA decision
- `ROADMAP.md` - Marked UI improvements as completed

**Design Rationale**:
- Tool-focused: Users are developers who want quick access to tokenization features
- No page reloads: Better UX with instant tab switching
- Discoverability: All features visible in tab navigation
- Single source of truth: One main interface to maintain
- Educational: Library Usage tab with examples helps users integrate the library

**Future Considerations**:
- Legacy standalone pages may be confusing if users find them directly
- Could add redirect notices to legacy pages pointing to main index.html
- Consider adding URL hash routing for deep linking to specific tabs
- May want to add keyboard shortcuts (e.g., 1-4 to switch tabs)

**Testing Notes**:
- All features manually tested and working
- Tab switching is instant and smooth
- Tests execute correctly when tab is opened
- Token visualization works identically to advanced.html
- Simple counter matches simple.html functionality

---

## Future Session Checklist

When starting a new session on this project:

1. **Read these files first**:
   - `README.md` - Project overview and API
   - `PROJECT_STRUCTURE.md` - File organization
   - `DECISIONS.md` - Key technical decisions and rationale
   - `SESSION_NOTES.md` (this file) - Recent changes and context

2. **Important context**:
   - This is a zero-dependency, vanilla JavaScript project
   - No build step, no npm dependencies (except metadata)
   - All vocabulary files are bundled (not fetched from CDN)
   - ES modules only - requires HTTP server (not file://)
   - Main interface is now `index.html` (single-page app)
   - Legacy pages exist but are secondary

3. **Code style conventions**:
   - Vanilla JavaScript ES2020+
   - No framework dependencies
   - Explicit imports (no wildcards)
   - JSDoc comments for type hints
   - Prefixed console logs: `[Encoding]`, `[BPE]`, etc.
   - Small, focused files (<350 lines preferred)

4. **Testing approach**:
   - Test suite in "Run Tests" tab of index.html
   - Manual testing required (no automated CI yet)
   - Compare outputs with OpenAI's tiktoken
   - Edge cases: empty strings, Unicode, special tokens

5. **Common pitfalls**:
   - JavaScript doesn't support possessive quantifiers in regex
   - Spread operator fails with 65k+ function arguments
   - Single-byte tokens must be Uint8Array, not JS arrays
   - Must serve over HTTP (ES modules don't work with file://)

---

## Open Questions / Future Work

- Should we add URL hash routing for deep linking to tabs?
- Should legacy standalone pages have redirect notices?
- Would keyboard shortcuts improve UX (1-4 for tab switching)?
- Is 50KB initial page load acceptable for SPA vs 10KB landing page?
- Should we split JavaScript into separate module file vs inline?

---

# StoatCore

**Version:** 1.1.1 (local fixed build)
**Published npm version:** 1.0.0 (has known bugs — do not use directly)

StoatCore is the bootstrap engine for Stoat Framework. It seeds the global `_s` / `stoat` object that all parts of the framework share, and wires up the helper, database, net, and system namespaces before any application code runs.

---

## Why a local copy?

The npm-published `stoatcore@1.0.0` has 8 known bugs (SC-1 through SC-8, documented in `TODOS.md`). All bugs have been fixed in this local `StoatCore/` directory. Until the fixes are published to npm, every project scaffolded by `stoat init` receives this directory and references it via:

```json
"dependencies": {
  "stoatcore": "file:./StoatCore"
}
```

This means `require("stoatcore")` in any Stoat project always resolves to the fixed v1.1.1 source, not the npm registry version.

**When the fixes are published**, the migration is a one-line change per project:

```json
"stoatcore": "^1.1.1"
```

---

## What it does

StoatCore runs exactly once — as the first `require()` in `base.js` / `base.ts`. It creates and exposes two global aliases to the same object:

```js
global._s    = { ... }
global.stoat = global._s   // same reference
```

### Namespaces seeded at boot

| Namespace | Type | Purpose |
|---|---|---|
| `_s.config` | Object | Application config (populated by `runStoatConfig`) |
| `_s.paths` | Object | Folder aliases from `bin/.config` |
| `_s.misc` | Object | `rootPath`, `rootParent` set in `base.js` |
| `_s.dbConfig` | Array | Raw DB config array from `bin/.config` |
| `_s.db` | Object | Live database connections keyed by `db.ref` |
| `_s.helpers` | Object | Helper namespaces: `Security`, `Encryption`, `Database`, `Helper` |
| `_s.net` | Object | Outbound HTTP/HTTPS client methods |
| `_s.__system` | Object | Internal caches: routes, mimeTypes, allowedOrigins, notFoundPage |

---

## Fixes in this build (vs npm v1.0.0)

| ID | Component | Summary |
|---|---|---|
| SC-1 | `Net/index.js` | `StringDecoder` import casing fixed |
| SC-2 | `Net/index.js` | `response` object declared before use |
| SC-3 | `Net/index.js` | `requestDetails` passed as first arg to `http.request()` |
| SC-4 | `Net/index.js` | `option`/`delete` parameter renamed `option` → `params` |
| SC-5 | `Net/index.js` | `Content-Length` uses `Buffer.byteLength()` for multi-byte safety |
| SC-6 | `Net/index.js` | Response body buffered across `data` events, resolved on `end` |
| SC-7 | `Helpers/Helper.js` | `writeBase64ToFile` — added missing `fs`/`path` imports, fixed path construction |
| SC-8 | `Helpers/Encryption.js` | 3DES → AES-256-GCM; MD5 → SHA-256; added scrypt password hashing |

---

## Pending features

| ID | Feature | Status |
|---|---|---|
| SC-F3 | `_s.net` streaming responses | Not started |

See `TODOS.md` in the project root for full details.

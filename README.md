# StoatCore

**npm package:** [`stoatcore`](https://www.npmjs.com/package/stoatcore) — use `stoatcore@latest`

StoatCore is the bootstrap engine for Stoat Framework. It seeds the global `_s`
/ `stoat` object that all parts of the framework share, and wires up the helper,
database, net, and system namespaces before any application code runs.

---

## Installation & Deployment

`stoatcore` is published and maintained on npm. Always install the **latest** release:

```bash
npm install stoatcore@latest
# or
bun add stoatcore@latest
# or (Deno — adds it to the deno.json import map)
deno add npm:stoatcore@latest
```

Stoat Framework projects get it automatically: `stoat init` adds the current release, and `stoat update` moves older projects onto it.

> **Deno note:** Deno refuses npm versions published less than 24 hours ago by default. Right after a release, pass `--minimum-dependency-age=0` to take it immediately.

---

## What it does

StoatCore runs exactly once — as the first `require()` in `base.js` / `base.ts`.
It creates and exposes two global aliases to the same object:

```js
global._s    = { ... }
global.stoat = global._s   // same reference
```

### Namespaces seeded at boot

| Namespace     | Type   | Purpose                                                           |
| ------------- | ------ | ----------------------------------------------------------------- |
| `_s.config`   | Object | Application config (populated by `runStoatConfig`)                |
| `_s.paths`    | Object | Folder aliases from `bin/.config`                                 |
| `_s.misc`     | Object | `rootPath`, `rootParent` set in `base.js`                         |
| `_s.dbConfig` | Array  | Raw DB config array from `bin/.config`                            |
| `_s.db`       | Object | Live database connections keyed by `db.ref`                       |
| `_s.helpers`  | Object | Helper namespaces: `Security`, `Encryption`, `Database`, `Helper` |
| `_s.net`      | Object | Outbound HTTP/HTTPS client methods                                |
| `_s.__system` | Object | Internal caches: routes, mimeTypes, allowedOrigins, notFoundPage  |

---

## Changes in 1.1.3

| ID    | Component             | Summary                                                                                                                                                                                                                 |
| ----- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FIX-5 | `Net/index.js`        | `GET` / `HEAD` (and `DELETE` / `OPTIONS` without `data`) no longer send a `{}` body, `Content-Type` or `Content-Length`. `POST` / `PUT` / `PATCH` still default to `{}`.                                                 |
| SEC-8 | `Helpers/Security.js` | The default `domainSecurity()` stub now **fails closed**: it rejects every token unless `environment` is `development`, `dev`, `local` or `test`. Previously it accepted any token in every environment. Apps that ship their own `Helpers/Security.js` are unaffected. |

**Upgrade note:** if your deployed app has no `Helpers/Security.js` and relied on the stub letting requests with an `Authorization` header through, those requests now get `406`. Add a real `Helpers/Security.js` (the Stoat Framework ships an HS256 JWT implementation).

---

## Changes in 1.1.2

| Component             | Summary                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------- |
| `Helpers/Database.js` | New `_s.helpers.Database` namespace, wired into `core.js`                               |
| `core.js`             | Seeds `_s.__system` (`mimeTypes`, `allowedOrigins`, `notFoundPage`, `routes`) and `_s.__f` |

---

## Fixes in this build (vs npm v1.0.0)

| ID   | Component               | Summary                                                                          |
| ---- | ----------------------- | -------------------------------------------------------------------------------- |
| SC-1 | `Net/index.js`          | `StringDecoder` import casing fixed                                              |
| SC-2 | `Net/index.js`          | `response` object declared before use                                            |
| SC-3 | `Net/index.js`          | `requestDetails` passed as first arg to `http.request()`                         |
| SC-4 | `Net/index.js`          | `option`/`delete` parameter renamed `option` → `params`                          |
| SC-5 | `Net/index.js`          | `Content-Length` uses `Buffer.byteLength()` for multi-byte safety                |
| SC-6 | `Net/index.js`          | Response body buffered across `data` events, resolved on `end`                   |
| SC-7 | `Helpers/Helper.js`     | `writeBase64ToFile` — added missing `fs`/`path` imports, fixed path construction |
| SC-8 | `Helpers/Encryption.js` | 3DES → AES-256-GCM; MD5 → SHA-256; added scrypt password hashing                 |

---

## Implemented features

| ID    | Feature                                       | Status                                  |
| ----- | --------------------------------------------- | --------------------------------------- |
| SC-F3 | `_s.net` streaming responses (`stream: true`) | Implemented in `StoatCore/Net/index.js` |

See `TODOS.md` in the project root for full details.

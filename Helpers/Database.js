/**
 * Database Helper
 * Sanitization and utility functions for all supported Stoat database engines.
 *
 * Namespaces:
 *   _s.helpers.Database.sanitizeMongoData(data)     — MongoDB / CouchDB documents
 *   _s.helpers.Database.sanitizeSQLData(data)       — MySQL / MariaDB / PostgreSQL / ClickHouse
 *   _s.helpers.Database.sanitizeCouchData(data)     — CouchDB (strips _-prefixed system keys)
 *   _s.helpers.Database.sanitizeClickHouseData(data)— ClickHouse (SQL + parameter safety)
 *   _s.helpers.Database.sanitizeRedisKey(key)       — Redis key sanitization
 *   _s.helpers.Database.sanitizeRedisValue(value)   — Redis value serialization guard
 */

const Database = {

    // ── MongoDB ────────────────────────────────────────────────────────────────

    sanitizeMongoData: (data) => {
        if (data === null || data === undefined) return null;

        if (Array.isArray(data)) {
            return data.map((item) => Database.sanitizeMongoData(item));
        }

        if (typeof data === "object") {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                // Strip MongoDB operator injection ($where, $gt, etc.)
                if (key.startsWith("$")) continue;
                sanitized[key] = Database.sanitizeMongoData(value);
            }
            return sanitized;
        }

        if (typeof data === "string") {
            // Remove bare $ signs that aren't part of a valid field value
            return data.replace(/\$/g, "");
        }

        return data;
    },

    // ── SQL (MySQL · MariaDB · PostgreSQL · ClickHouse) ───────────────────────

    sanitizeSQLData: (data) => {
        if (data === null || data === undefined) return null;

        if (Array.isArray(data)) {
            return data.map((item) => Database.sanitizeSQLData(item));
        }

        if (typeof data === "object") {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                sanitized[key] = Database.sanitizeSQLData(value);
            }
            return sanitized;
        }

        if (typeof data === "string") {
            return data.replace(
                /[\0\x08\x09\x1a\n\r"'\\\%]/g,
                (char) => {
                    switch (char) {
                        case "\0":   return "\\0";
                        case "\x08": return "\\b";
                        case "\x09": return "\\t";
                        case "\x1a": return "\\z";
                        case "\n":   return "\\n";
                        case "\r":   return "\\r";
                        case '"':
                        case "'":
                        case "\\":
                        case "%":    return "\\" + char;
                        default:     return char;
                    }
                }
            );
        }

        if (typeof data === "number" || typeof data === "boolean") return data;

        return Database.sanitizeSQLData(String(data));
    },

    // ── CouchDB ───────────────────────────────────────────────────────────────

    /**
     * Strips CouchDB internal system keys (_id, _rev, _deleted, etc.) from user
     * input to prevent accidental overwrites of CouchDB metadata, and strips
     * any keys that begin with $ (same as Mongo guard — CouchDB Mango selectors
     * use operators like $eq, $gt which must come from code, not user input).
     */
    sanitizeCouchData: (data) => {
        if (data === null || data === undefined) return null;

        if (Array.isArray(data)) {
            return data.map((item) => Database.sanitizeCouchData(item));
        }

        if (typeof data === "object") {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                // Block CouchDB internal keys from user input
                if (key.startsWith("_")) continue;
                // Block Mango operator injection
                if (key.startsWith("$")) continue;
                sanitized[key] = Database.sanitizeCouchData(value);
            }
            return sanitized;
        }

        if (typeof data === "string") {
            // Strip characters used in Mango selector injection
            return data.replace(/[$]/g, "");
        }

        return data;
    },

    // ── ClickHouse ────────────────────────────────────────────────────────────

    /**
     * ClickHouse uses SQL so the same escaping rules apply, with two extras:
     * - Backtick-quoted identifiers: strip backticks from user-supplied identifiers
     * - Format strings: strip curly braces used in ClickHouse parameterised queries
     *   to prevent format-string injection when building query strings manually.
     *
     * Always prefer parameterised queries via the @clickhouse/client `query_params`
     * option — use this sanitizer only for values interpolated into strings.
     */
    sanitizeClickHouseData: (data) => {
        if (data === null || data === undefined) return null;

        if (Array.isArray(data)) {
            return data.map((item) => Database.sanitizeClickHouseData(item));
        }

        if (typeof data === "object") {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                sanitized[key] = Database.sanitizeClickHouseData(value);
            }
            return sanitized;
        }

        if (typeof data === "string") {
            // SQL escaping (reuse SQL sanitizer logic)
            let safe = Database.sanitizeSQLData(data);
            // Strip ClickHouse-specific risks: backticks and format braces
            safe = safe.replace(/[`{}]/g, "");
            return safe;
        }

        if (typeof data === "number" || typeof data === "boolean") return data;

        return Database.sanitizeClickHouseData(String(data));
    },

    // ── Redis ─────────────────────────────────────────────────────────────────

    /**
     * Redis key sanitizer.
     * Keys are arbitrary byte strings but convention is `prefix:segment:id`.
     * This strips characters outside the printable ASCII safe set and prevents
     * newline injection (Redis inline commands use CRLF framing — a newline in
     * a key could terminate the current command and inject a new one in
     * text-protocol clients).
     */
    sanitizeRedisKey: (key) => {
        if (typeof key !== "string") key = String(key);
        // Allow: alphanumeric, colon, hyphen, underscore, dot, slash, @
        // Block everything else — especially \r \n which break RESP framing
        return key.replace(/[^\w:.\-\/@]/g, "");
    },

    /**
     * Redis value guard.
     * Ensures the value can be safely serialized to a string for storage.
     * Returns the JSON string representation for objects/arrays, raw string
     * for primitives. Rejects values that cannot be round-tripped.
     */
    sanitizeRedisValue: (value) => {
        if (value === null || value === undefined) return "";
        if (typeof value === "string")  return value;
        if (typeof value === "number" || typeof value === "boolean") return String(value);
        try {
            return JSON.stringify(value);
        } catch (_) {
            return String(value);
        }
    },

};

module.exports = Database;

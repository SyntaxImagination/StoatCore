/**
 * Encryption Helper
 * Cryptographic utilities available as _s.helpers.Encryption.*
 *
 * Changes from v1.0.0:
 *  - encrypt / decrypt    : AES-256-GCM replaces deprecated 3DES (des-ede3)
 *  - threeDESEncrypt/Decrypt : kept as aliases → encrypt/decrypt for back-compat
 *  - hash                 : SHA-256 replaces MD5 for integrity checks
 *  - MD5Encryption        : kept as alias → hash for back-compat
 *  - hashPassword         : new — scrypt-based password hashing (no extra packages)
 *  - verifyPassword       : new — constant-time scrypt password verification
 *
 * All methods use only Node.js built-in `crypto` module.
 */

const {
    createCipheriv,
    createDecipheriv,
    createHash,
    createHmac,
    randomBytes,
    scryptSync,
    timingSafeEqual,
} = require("crypto");

// Internal key derivation — derive a 32-byte key from any string secret
function deriveKey(secret) {
    return scryptSync(secret, "stoat-enc-salt-v1", 32);
}

const Encryption = {

    // ── Symmetric encryption (AES-256-GCM) ───────────────────────────

    encrypt(text, secret) {
        const key    = deriveKey(secret);
        const iv     = randomBytes(16);
        const cipher = createCipheriv("aes-256-gcm", key, iv);
        const enc    = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
        const tag    = cipher.getAuthTag();
        // Format: iv:tag:ciphertext — all hex-encoded
        return `${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
    },

    decrypt(encryptedStr, secret) {
        const [ivHex, tagHex, dataHex] = encryptedStr.split(":");
        const key      = deriveKey(secret);
        const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
        decipher.setAuthTag(Buffer.from(tagHex, "hex"));
        return (
            decipher.update(Buffer.from(dataHex, "hex"), undefined, "utf8") +
            decipher.final("utf8")
        );
    },

    // Back-compat aliases (3DES was deprecated by NIST in 2023)
    threeDESEncrypt(secret, text) { return Encryption.encrypt(text, secret); },
    threeDESDecrypt(secret, enc)  { return Encryption.decrypt(enc, secret);  },

    // ── Hashing ───────────────────────────────────────────────────────

    // SHA-256 for integrity / non-secret identifiers
    hash(value) {
        return createHash("sha256").update(value).digest("hex");
    },

    // Back-compat alias (MD5 is cryptographically broken — now SHA-256)
    MD5Encryption(text) { return Encryption.hash(text); },

    // HMAC-SHA256 for message authentication codes
    hmac(value, secret) {
        return createHmac("sha256", secret).update(value).digest("hex");
    },

    // ── Password hashing (scrypt) ─────────────────────────────────────

    hashPassword(password) {
        const salt = randomBytes(16).toString("hex");
        const hash = scryptSync(password, salt, 64).toString("hex");
        return `${salt}:${hash}`;
    },

    verifyPassword(password, stored) {
        const [salt, hash] = stored.split(":");
        const attempt = scryptSync(password, salt, 64);
        // Constant-time comparison prevents timing attacks
        return timingSafeEqual(attempt, Buffer.from(hash, "hex"));
    },

    // ── Base64 utilities ──────────────────────────────────────────────

    convertStringToBase64(text) {
        return Buffer.from(text, "utf-8").toString("base64");
    },

    convertStringFromBase64(base64) {
        return Buffer.from(base64, "base64").toString("utf-8");
    },

    // ── Hex utilities ─────────────────────────────────────────────────

    convertHexToString(hex) {
        hex = hex.toString();
        let str = "";
        for (let n = 0; n < hex.length; n += 2)
            str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
        return str;
    },
};

module.exports = Encryption;

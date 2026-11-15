/**
 * Helper
 * General-purpose utility methods available as _s.helpers.Helper.*
 *
 * Fix applied (v1.0.0 bug):
 *  - writeBase64ToFile: added missing `fs` and `path` imports;
 *    corrected path variable (was referencing undefined `path` instead of `pathToSaveAt`);
 *    fixed return data.name (was referencing undefined `name` instead of `fileName`).
 */

const { writeFileSync } = require("fs");
const path = require("path");

const Helper = {

    // ── Random generators ────────────────────────────────────────────

    generateRandomNumbers: (len) => {
        let num = "";
        const charset = "1234567890";
        for (let i = 0; i < len; i++)
            num += charset.charAt(Math.floor(Math.random() * charset.length));
        return num;
    },

    generateNumbersAndLetters: (len) => {
        let out = "";
        if (!len) len = 30;
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ";
        for (let i = 0; i < len; i++) {
            const rnum = Math.floor(Math.random() * chars.length);
            out += chars.substring(rnum, rnum + 1);
        }
        return out;
    },

    generateRandomLetters: (len) => {
        let text = "";
        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let i = 0; i < len; i++)
            text += charset.charAt(Math.floor(Math.random() * charset.length));
        return text;
    },

    generateNumberBetween: (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // ── Date ─────────────────────────────────────────────────────────

    generateReadableDate: (d) => {
        const date = new Date(d);
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ];
        const day = date.getDate();
        let st = "th";
        if (day === 1 || day === 21 || day === 31) st = "st";
        else if (day === 2 || day === 22)           st = "nd";
        else if (day === 3 || day === 23)           st = "rd";
        return `${day}${st} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    },

    // ── Files ─────────────────────────────────────────────────────────

    writeBase64ToFile: async (base64Data, pathToSaveAt, fileName = null) => {
        const [meta, photo] = base64Data.split(";base64,");
        const mimeType      = meta.split("/")[1];

        const extensionMap = {
            png: ".png", jpeg: ".jpg", jpg: ".jpg",
            gif: ".gif", pdf: ".pdf",
        };
        const format = extensionMap[mimeType] || `.${mimeType}`;

        if (!fileName) {
            fileName = Helper.generateRandomLetters(25).toUpperCase();
        }

        try {
            // Fix: use path.join(pathToSaveAt, ...) — was using undefined `path` variable
            writeFileSync(
                path.join(pathToSaveAt, `${fileName}${format}`),
                photo,
                { encoding: "base64" }
            );
            // Fix: return fileName — was referencing undefined `name`
            return { status: 1, data: { name: `${fileName}${format}` } };
        } catch (e) {
            console.log(e);
            return { status: 2 };
        }
    },

    // ── Validations ───────────────────────────────────────────────────

    validateEmail: (emailString) => {
        const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(emailString.toLowerCase());
    },
};

module.exports = Helper;

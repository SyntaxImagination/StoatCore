/**
 * Net Module
 * The essence of the net module is to make http and https connections easy within Stoat.
 *
 * Fixes applied (v1.0.0 bugs):
 *  1. { stringDecoder } → { StringDecoder }  (wrong destructure key)
 *  2. `response` declared before use          (was ReferenceError)
 *  3. http.request(requestDetails, cb)        (options arg was missing)
 *  4. option/delete parameter renamed to params (was referencing undefined `params`)
 *  5. Content-Length uses Buffer.byteLength   (fixes multi-byte char miscounts)
 *  6. Body buffered and resolved on `end`     (was resolving mid-stream on `data`)
 *  7. GET/HEAD (and bodyless DELETE/OPTIONS) no longer send "{}" or Content-Length
 *
 * SC-F3 — Streaming support:
 *  Pass `stream: true` in params to receive the raw IncomingMessage instead of
 *  buffering. Resolved value: { statusCode, message, headers, stream: IncomingMessage }
 *  The caller is responsible for consuming and destroying the stream.
 *
 *  Usage:
 *    const res = await _s.net.get({ url: "http://...", stream: true });
 *    res.stream.pipe(writableDestination);
 */

"use strict";

const http  = require("http");
const https = require("https");
const { StringDecoder } = require("string_decoder");

const net = {

    get: async (params) => {
        params.method = "GET";
        return processRequest(params);
    },

    head: async (params) => {
        params.method = "HEAD";
        return processRequest(params);
    },

    post: async (params) => {
        params.method = "POST";
        return processRequest(params);
    },

    patch: async (params) => {
        params.method = "PATCH";
        return processRequest(params);
    },

    put: async (params) => {
        params.method = "PUT";
        return processRequest(params);
    },

    // Fix 4: was `async (option) =>` — parameter renamed to `params`
    option: async (params) => {
        params.method = "OPTIONS";
        return processRequest(params);
    },

    // Fix 4: same parameter naming bug
    delete: async (params) => {
        params.method = "DELETE";
        return processRequest(params);
    },

    // WebSocket — Coming Soon
};

function processRequest(params) {
    return new Promise((success, failed) => {

        // Fix 2: declare response before any use
        let response = {};

        const urlParts = params.url.split("://");
        const protocol = urlParts[0];
        const rest     = urlParts[1];

        let transport;
        switch (protocol) {
            case "http":  transport = http;  break;
            case "https": transport = https; break;
            default:
                return failed(new Error(`Unsupported protocol: ${protocol}`));
        }

        // Serialise body only for methods that carry a payload
        const methodAllowsBody = params.method !== "GET" && params.method !== "HEAD";
        let body = null;
        if (methodAllowsBody) {
            if (params.hasOwnProperty("data")) {
                body = JSON.stringify(params.data);
            } else if (["POST", "PUT", "PATCH"].includes(params.method)) {
                body = "{}";
            }
        }

        // Parse host, optional port, and path
        const [hostAndPort, ...pathParts] = rest.split("/");
        const [hostname, portFromUrl]     = hostAndPort.split(":");
        const endpointPath = `/${pathParts.join("/")}`;

        // Fix 5: Buffer.byteLength for accurate Content-Length with unicode
        const requestDetails = {
            protocol : `${protocol}:`,
            hostname,
            method   : params.method,
            path     : encodeURI(endpointPath) || "/",
            headers  : {},
        };

        if (body !== null) {
            requestDetails.headers["Content-Type"]   = "application/json";
            requestDetails.headers["Content-Length"] = Buffer.byteLength(body);
        }

        if (portFromUrl) {
            requestDetails.port = portFromUrl;
        }

        if (params.hasOwnProperty("port")) {
            requestDetails.port = params.port;
        }

        // Merge caller-supplied headers
        if (params.hasOwnProperty("headers")) {
            for (const key in params.headers) {
                requestDetails.headers[key] = params.headers[key];
            }
        }

        // Forward any extra top-level params (e.g. auth, agent, timeout)
        for (const key in params) {
            if (
                !requestDetails.hasOwnProperty(key) &&
                key !== "url"     &&
                key !== "data"    &&
                key !== "headers" &&
                key !== "port"    &&
                key !== "stream"
            ) {
                requestDetails[key] = params[key];
            }
        }

        // Fix 3: pass requestDetails as first argument
        const req = transport.request(requestDetails, (resp) => {
            response.statusCode = resp.statusCode;
            response.message    = resp.statusMessage;
            response.headers    = resp.headers;

            // SC-F3: stream mode — hand back the raw IncomingMessage immediately
            if (params.stream === true) {
                response.stream = resp;
                success(response);
                return;
            }

            // Fix 6: buffer all chunks, resolve only on `end`
            let rawBuffer = "";
            const decoder = new StringDecoder("utf8");

            resp.on("data", (chunk) => {
                rawBuffer += decoder.write(chunk);
            });

            resp.on("end", () => {
                rawBuffer += decoder.end();

                if (rawBuffer !== "") {
                    try {
                        response.body = JSON.parse(rawBuffer);
                    } catch (_) {
                        response.body = rawBuffer;
                    }
                } else {
                    response.body = {};
                }

                success(response);
            });
        });

        req.on("error", (err) => {
            response.error          = err;
            response.internalStatus = 2;
            success(response);
        });

        if (body !== null) {
            req.write(body);
        }
        req.end();
    });
}

module.exports = net;

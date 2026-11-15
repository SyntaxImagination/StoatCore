/**
 * STOAT CORE
 * Description : StoatCore is the Engine that globalises the stoat variable and all contents.
 * By Default the Stoat Object comes with:
 *  - config   : holds application config
 *  - helpers  : extendable helper namespaces
 *  - db       : database connection registry
 *  - net      : outbound HTTP/HTTPS client
 *  - __system : internal framework state
 */

const miscHelper = require("./Helpers/Helper");
const encryptionHelper = require("./Helpers/Encryption");
const securityHelper = require("./Helpers/Security");
const databaseHelper = require("./Helpers/Database");  // wired up — was missing in v1.0.0

const mimeTypes = require("./System/Mimetypes");
const net = require("./Net/index");

global.stoat = {

    config: {
        environment: "staging",
        baseUrl: "",
        app: {},
        requestConf: {
            cors: false,
            checkOrigin: false,
            allowedMethods: ["GET", "POST"],
            maxBodyBytes: 1048576,
        },
        responseConf: {
            indexPage: "index.html",
            notFoundPage: "error.html",
        },
    },

    misc: {
        rootPath: "",
        rootParent: "",
    },

    helpers: {
        Helper: miscHelper,
        Encryption: encryptionHelper,
        Security: securityHelper,
        Database: databaseHelper,
    },

    db: {},
    dbConfig: [],

    net,

    __system: {
        mimeTypes: mimeTypes,
        allowedOrigins: [],
        notFoundPage: "",
        routes: {},
    },

    __f: {
        dynamicImport: async (path) => await import(path),
    },

    paths: {},
};

// _s is the short alias — preferred in application code
global._s = stoat;

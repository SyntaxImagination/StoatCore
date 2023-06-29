/**
 * STOAT CORE
 * Description : StoatCore is the Engine that globallize the stoat variable and all the contents
 * By Default Stoat Object comes with 
 *  - Config to hold application config,
 *  - Helpers - Extendable Helpers 
 *  - Database : For Database Access and Holds (Will Also include Flat Files)   
 */

const miscHelper = require('./Helpers/Helper');
const encryptionHelper = require('./Helpers/Encryption.js');
const securityHelper = require('./Helpers/Security.js');

const mimeTypes = require('./System/Mimetypes.js');

const net = require('./Net/index.js');

global.stoat = {
    //Config is empty and at Stoat application run, it will load the config file
    config : {
        environment : "staging",
        baseUrl : "",
        app : {},
        requestsConf : {
            cors : false,
            checkOrigin : false,
            allowedMethods : ["GET", "POST"]
        },
        responseConf : {
            pages : {
                indexPage : "index.html",
                notFoundPage : "error.html"
            }
        },
    },
    /**
     * The Config is loaded from the config file by the user at app start
     */

    misc : {
        rootPath : "",
        rootParent : ""
    },

    //Helpers 
    helpers : {
        Helper : miscHelper,
        Encryption : encryptionHelper,
        Security: securityHelper,
    },

    //Database
    db : {},
    /**
     * The Database is a key-value 
     * { databasename : tablename / collectionname }
     */

    //Net 
    net: net,
    /**
     * The Net Module is used for sending requests 
     * it can do get, head, post, put, patch, option
     * Socket is coming soon
     */

    //System
    __system : {
        mimeTypes: mimeTypes,
    },
    /**
     * System features are not genrally accessed by users but used in Stoat
     */

    //Private Functions
    __f : {
        dynmaicImport: async (path) => {
            return await import(path);
        }
    },

    //Paths
    paths : {}
}

//_s is the short form of writing stoat which will most likely be prefered
global._s = stoat;
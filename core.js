/**
 * STOAT CORE
 * Description : StoatCore is the Engine that globallize the stoat variable and all the contents
 * By Default Stoat Object comes with 
 *  - Config to hold application config,
 *  - Helpers - Extendable Helpers 
 *  - Database : For Database Access and Holds (Will Also include Flat Files)   
 */

const miscHelper = require('./Helpers/index.js');
const encryptionHelper = require('./Helpers/encryption.js');

const mimetypes = require('./Helpers/system/mimetypes.js');

const net = require('./net/index.js');


global.stoat = {
    //Config is empty and at Stoat application run, it will load the config file
    config : {},
    /**
     * The Config is loaded from the config file by the user at app start
     */

    //Helpers 
    helpers : {
        misc : miscHelper,
        encryption : encryptionHelper,
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
        mimeTypes : mimetypes
    }
    /**
     * System features are not genrally accessed by users but used in Stoat
     */
}

//_s is the short form of writing stoat which will most likely be prefered
global._s = stoat;
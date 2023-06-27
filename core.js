/**
 * STOAT CORE
 * Description : StoatCore is the Engine that globallize the stoat variable and all the contents
 * By Default Stoat Object comes with 
 *  - Config to hold application config,
 *  - Helpers - Extendable Helpers 
 *  - Database : For Database Access and Holds (Will Also include Flat Files)   
 */

const miscHelper = require('./Helpers/index.js');


global.stoat = {
    //Config is empty and at Stoat application run, it will load the config file
    config : {},

    //Helpers 
    helpers : {
        misc : miscHelper
    }
}

//_s is the short form of writing stoat which will most likely be prefered
global._s = stoat;
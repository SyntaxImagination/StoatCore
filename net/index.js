/**
 * Net Module
 * The essense of the net module is to make http and socket connections more easily done using stoat
 */

'use strict'

const http = require('http'),
https = require('https');

const { stringDecoder } = require('string_decoder');

const net = {

    get: async (params) => {
        params.method = 'GET';
        return await processRequest(params); 
    },

    head: async (params) => {
        params.method = 'HEAD';
        return await processRequest(params); 
    },

    post: async (params) => {
        params.method = 'POST';
        return await processRequest(params); 
    },

    patch: async (params) => {
        params.method = 'PATCH';
        return await processRequest(params); 
    },

    put: async (params) => {
        params.method = 'PUT';
        return await processRequest(params); 
    },

    option: async (option) => {
        params.method = 'OPTION';
        return await processRequest(params); 
    },

    delete: async (option) => {
        params.method = 'DELETE';
        return await processRequest(params); 
    }

    //WebSocket Coming Soon
}

async function processRequest(params){

    let method;
    
    return new Promise((
        success,
        failed
    ) => {

        let url = params.url.split('://');

        switch(url[0]){

            case 'http':
                method = http;
                break;

            case 'https':
                method = https;
                break;

        }

        //Convert Data to String
        if(params.hasOwnProperty('data')){
            params.data = JSON.stringify(params.data);
        }else{
            params.data = '{}';
        }

        // Check if there is a Port
        let urlPort = url[1].split(':');

        let x, endpoint;

        [x, ...endpoint] = url[1].split('/');
        endpoint = `/${endpoint.join('/')}`;

        let requestDetails = {
            protocol : `${url[0]}:`,
            hostname : urlPort[0],
            method : params.method,
            path : encodeURI(endpoint),
            headers : {
                'Content-Type' : 'application/json',
                'Content-Length' : params.data.length
            }
        }

        //Port
        if(urlPort.length > 0){
            requestDetails.port = urlPort[1].split('/')[0];
        }

        //Append All Headers
        if(params.hasOwnProperty('headers')){
            for(let key in params.headers){
                requestDetails.headers[key] = params.headers[key];
            }
        }

        //Add Port if Port is There
        if(params.hasOwnProperty('port')){
            for(let key in params.port) {
                requestDetails.port = params.port;
            }
        }

        //Check for any parameter that is not set and add it
        for(let key in params){
            if(!requestDetails.hasOwnProperty(key)){
                if(
                    key != 'endpoint'
                    && key != 'url'
                    && key != 'data'
                    && key != 'headers'
                ){
                    requestDetails[key] = params[key];
                }
            }
        }

        let req = method.request(resp => {

            response.statusCode = resp.statusCode;
            response.message = resp.statusMessage;
            response.headers = resp.headers;

            resp.on('data', rx => {

                let decoder = new StringDecoder('utf8');
                let stringResponse = decoder.write(rx);

                //Since we deal with REST API convert data to Object
                if (typeof stringResponse === 'string') {
                    try {
                        stringResponse = JSON.parse(stringResponse);
                    } catch (e) {
                        // console.log(e);
                        response.statusCode = 2;
                        stringResponse = "";
                    }
                }

                response.body = stringResponse;

                success(response);
            });
        });

        req.on('error', err => {
            response.error = err;
            response.internalStatus = 2;

            success(response);
        });

        req.write(params.data);

        req.end();
    });
}

module.exports = net;
/**
 * Encryption Helper
 * The Encryption Helper helps in running Perfect encryptions
 */

const {
    createHash,
    createDecipheriv,
    createCipheriv
} = require('crypto');

const algorithm = 'aes192';

const Encryption = {

    //3Des Encryption
    threeDESEncrypt: (secretKey, text) => {

        secretKey = createHash('md5').update(secretKey).digest();
        secretKey = Buffer.concat([secretKey, secretKey.slice(0, 8)]); // properly expand 3DES key from 128 bit to 192 bit

        const cipher = createCipheriv('des-ede3', secretKey, '');
        const encrypted = cipher.update(text, 'utf8', 'base64');

        return encrypted + cipher.final('base64');
    },

    //3Des Decryption
    threeDESDecrypt: (secretKey, encryptedString) => {

        secretKey = createHash('md5').update(secretKey).digest();
        secretKey = Buffer.concat([secretKey, secretKey.slice(0, 8)]); // properly expand 3DES key from 128 bit to 192 bit

        const decipher = createDecipheriv('des-ede3', secretKey, '');

        let decrypted = decipher.update(encryptedString, 'base64');
        decrypted += decipher.final();

        return decrypted;
    },

    //MD5 Encryption
    MD5Encryption: (text) => {
        return createHash('md5').update(text).digest('hex');
    },

    //Convert String to Base64
    convertStringToBase64: (text) => {
        const buff = Buffer.from(text, 'utf-8');
        const base64 = buff.toString('base64');

        return base64;
    },

    //Convert to String to Base64
    convertStringFromBase64: (base64) => {
        const buff = Buffer.from(base64, 'base64');
        const text = buff.toString('utf-8');

        return text;
    },

//Hexadecimal to String
    convertHexToString: (hex) => {
        var hex = hex.toString();
        var str = '';

        for (var n = 0; n < hex.length; n += 2) {
            str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
        }
        return str;
    }

}

module.exports = Encryption;
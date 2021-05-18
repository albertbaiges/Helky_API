
const md5 = require("md5");

function createSalt() {
    let salt = (Math.random()*0xfffff*10000000).toString(16);
    return salt;
}

function encrypt(password, salt){ 
    let hash = md5(salt + password);
    return hash;
}

module.exports = {
    createSalt, 
    encrypt
};

const crypto = require("../utils/cryptography");

class User {
    constructor(userID, username, email, password) {
        this.userID = String(userID);
        this.username = username;
        this.email = email;

        const salt = crypto.createSalt();
        this.salt = salt;
        
        const encryptedPassword = crypto.encrypt(password, this.salt);

        this.password = encryptedPassword;

        this.notifications = {
            requests: [],
            updates: []
        }
    }
}


module.exports.User = User;
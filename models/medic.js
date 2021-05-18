
const {User} = require("./user");

class Medic extends User {
    constructor(userID, username, email, password) {
        super(userID, username, email, password);
        this.utype = "medic";
        this.patients = {};
        this.centers = {};
    }
}


module.exports.Medic = Medic;


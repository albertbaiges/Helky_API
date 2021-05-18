
const {User} = require("./user");

class Patient extends User {
    constructor(userID, username, email, password) {
        super(userID, username, email, password);
        this.utype = "patient";
        this.disorders = [];
        this.medicines = [];
        this.medics = {};
        this.centers = {};
    }
}


module.exports.Patient = Patient ;
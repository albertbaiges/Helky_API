const { users } = require("./db");
const crypto = require("../utils/cryptography");


function getPatients(centerID) {
    const projection = ["userID", "username", "email", "patients"];
    const data = users.getFromUser(centerID, projection);
    return data;
}

function getMedics(centerID) {
    const projection = ["userID", "username", "email", "medics"];
    const data = users.getFromUser(centerID, projection);
    return data;
}

async function registerMedic(centerID, medic) {
    
    //Verificar que no haya ya un usuario con este email

    const query = "email = :email";
    const queryParams = {
        ":email": medic.email
    }
    const fields = ["userID", "username", "email"];
    const previousUser = await users.queryUser(query, queryParams, fields);
    console.log(previousUser)
    
    if(previousUser.length !== 0) {
        throw new Error("Email in use")
    }
        
    const medicUser = new Medic(20, medic.username, medic.email, medic.password);
    
    //Get our center
    const centerProjection = ["userID", "username", "email"];
    const center = await users.getFromUser(centerID, centerProjection);

    console.log("our center is", center)


    medicUser.centers[center.userID] = center;

    //PutItem

    await users.put(medicUser);
    
    const projection = ["userID", "username", "email"];
    
    const signedMedic = await users.getFromUser(medicUser.userID, projection);
        
    const update = {
        medics: {
            [signedMedic.userID]: signedMedic
        }
    }

    const updateExpression = "medics.#id = :medic";
    const updateValues = {
        ":medic": signedMedic
    }
    const updateNames = {
        "#id": signedMedic.userID
    }


    const updateManual = {
        updateExpression,
        updateValues,
        updateNames
    }

    const updateResponse = await users.update(center.userID, updateManual, true);

    return updateResponse;
}

class User {
    constructor(userID, username, email, password) {
        this.userID = String(userID);
        this.username = username;
        this.email = email;

        const salt = crypto.createSalt();
        this.salt = salt;
        
        const encryptedPassword = crypto.encrypt(password, this.salt);

        this.password = encryptedPassword;
    }
}

class Medic extends User {
    constructor(userID, username, email, password) {
        super(userID, username, email, password);
        this.utype = "medic";
        this.patients = {};
        this.centers = {};
    }
}





module.exports = {
    getPatients,
    getMedics,
    registerMedic
}
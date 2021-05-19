const { jdyn } = require("./db");
const { Medic } = require("../models");
const md5 = require("md5");

function getPatients(userID) {
    const projection = ["userID", "username", "email", "patients"];
    // const data = users.getFromUser(centerID, projection);
    const key = {userID};
    const data = jdyn.getItem("users", key, projection);
    return data;
}

function getMedics(userID) {
    const projection = ["userID", "username", "email", "medics"];
    // const data = users.getFromUser(centerID, projection);
    const key = {userID};
    const data = jdyn.getItem("users", key, projection)
    return data;
}

async function registerMedic(centerID, medic) {
    
    //Verificar que no haya ya un usuario con este email

    const projectionScan = ["userID", "username", "email"];
    const filter = {
        email: medic.email
    }
    console.log("filtro", filter)
    const previousUser = await jdyn.scan("users", projectionScan, filter);
    console.log(previousUser)
    
    if(previousUser.length !== 0) {
        throw new Error("Email in use")
    }

    const now = Date.now();
    const hex = now.toString(16)
    const userID = md5(hex);
        
    const medicUser = new Medic(userID, medic.username, medic.email, medic.password);
    
    //Get our center
    const centerProjection = ["userID", "username", "email"];
    // const center = await users.getFromUser(centerID, centerProjection);
    const center = await jdyn.getItem("users", {userID: centerID}, centerProjection);

    console.log("our center is", center)


    medicUser.centers[center.userID] = center;

    //PutItem

    await jdyn.putItem("users", medicUser)
    
    const projection = ["userID", "username", "email"];
    
    // const signedMedic = await users.getFromUser(medicUser.userID, projection);
    const signedMedic = await jdyn.getItem("users", {userID: medicUser.userID}, projection);
        

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

    // const updateResponse = await users.update(center.userID, updateManual, true);
    const updateResponse = await jdyn.updateItem("users", {userID: center.userID}, updateManual, true);

    return updateResponse;
}



module.exports = {
    getPatients,
    getMedics,
    registerMedic
}
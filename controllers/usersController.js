

const {Converter, users} = require("./db");
const cryptography = require("../utils/cryptography");

async function getUser(userID) {
    const projection = ["userID", "username", "utype", "medics", "email", "medicines", "disorders"];
    const user = await users.getFromUser(userID, projection);

    console.log("El usuario obtenido es", user);
    return user;
}


async function getDisorders(userID) {
    const projection = ["userID", "username", "disorders"];
    const userDisorders = await users.getFromUser(userID, projection);
    return userDisorders;
}

async function getMedics(userID) {
    const projection = ["userID", "username", "medics"];
    const userMedics = await users.getFromUser(userID, projection);
    return userMedics;
}

async function getCenters(userID) {
    const projection = ["userID", "username", "centers"];
    const userMedics = await users.getFromUser(userID, projection);
    return userMedics;
}

async function update(userID, updateValue) {
    const projection = ["userID", "username", "medics", "centers"];
    const userData = await users.getFromUser(userID, projection);
    console.log(userData)

    //Handle a password update 
    if(updateValue.password) {
        updateValue.salt = cryptography.createSalt();
        updateValue.password = cryptography.encrypt(updateValue.password, updateValue.salt);
    }
    // 

    const response = await users.update(userID, updateValue);

    delete updateValue.salt;
    delete updateValue.password;
    
    const medic_centerUpdate = {
        patients: {
            [userID]: updateValue
        }
    }
    userData.medics.forEach(async medic => {
        await users.update(medic, medic_centerUpdate);
    });

    userData.centers.forEach(async center => {
        await users.update(center, medic_centerUpdate);
    });

    const returnValue = {completed: "Eveything has been updated"}
    return returnValue
}

module.exports = {
    getUser,
    getDisorders,
    getMedics,
    getCenters,
    update
}
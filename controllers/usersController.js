




const {Converter, users} = require("./db");

async function getUser(userID) {
    const projection = ["username", "utype", "medics", "email", "medicines", "disorders"];
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

module.exports = {
    getUser,
    getDisorders,
    getMedics,
    getCenters
}
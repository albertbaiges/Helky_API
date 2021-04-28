




const {Converter, users} = require("./db");

async function getUser(userID) {
    const projection = ["username", "utype", "medics", "email", "medicines", "disorders"];
    const user = await users.getFromUser(userID, projection);

    console.log("El usuario obtenido es", user);
    return user;
}

module.exports = {
    getUser
}
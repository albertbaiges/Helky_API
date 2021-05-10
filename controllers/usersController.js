

const {Converter, users} = require("./db");
const cryptography = require("../utils/cryptography");
const registersController = require("./registersController");

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
    let projection = ["userID", "username", "patients", "medics", "centers", "utype", "disorders"];
    const userData = await users.getFromUser(userID, projection);
    // console.log(userData)

    //Handle a password update 
    if(updateValue.password) {
        updateValue.salt = cryptography.createSalt();
        updateValue.password = cryptography.encrypt(updateValue.password, updateValue.salt);
    }
    //
    
    //Handle disorders update
    if(updateValue.disorders) {
        const updatedDisorders = [];
        for (let disorder of updateValue.disorders) {
            console.log("Enfermedad", disorder)
            const storedDisorder = userData.disorders.find(storedDisorder => {
                return storedDisorder.type === disorder.type && storedDisorder.family === disorder.type;
            });
            
            if (storedDisorder) {
                updatedDisorders.push(storedDisorder);
            } else {
                if (registersController.getSupported().includes(updateValue)) {
                    disorder.registerID = null;
                }
                updatedDisorders.push(disorder);
            }
        }
        updateValue.disorders = updatedDisorders;
        console.log("Los nuevos disorders son", updateValue.disorders)

    }



    const response = await users.update(userID, updateValue);

    delete updateValue.salt;
    delete updateValue.password;
    
    let relatedUsersUpdate;
    
    if (userData.utype === "patient") {
        relatedUsersUpdate = {
            patients: {
                [userID]: updateValue
            }
        }
    } else if (userData.utype === "medic") {
        relatedUsersUpdate = {
            medics: {
                [userID]: updateValue
            }
        }
    } else if (userData.utype === "center") {
        relatedUsersUpdate = {
            centers: {
                [userID]: updateValue
            }
        }
    }

    console.log("relatedusers update", relatedUsersUpdate);

    if (Object.keys(updateValue).length !== 0) {
        if (userData.patients) {
            const patients = Object.values(userData.patients);
            patients.forEach(async patient => {
                await users.update(patient.userID, relatedUsersUpdate);
            });
        }

        console.log("update para los otros", relatedUsersUpdate)

        if (userData.medics) {
            const medics = Object.values(userData.medics);
            medics.forEach(async medic => {
                await users.update(medic.userID, relatedUsersUpdate);
            });
        }


        if (userData.centers) {
            const centers = Object.values(userData.centers);
            centers.forEach(async center => {
                await users.update(center.userID, relatedUsersUpdate);
            });       
        }
    }
        

    const data = await users.getFromUser(userID, projection);

    return data;
}

module.exports = {
    getUser,
    getDisorders,
    getMedics,
    getCenters,
    update
}
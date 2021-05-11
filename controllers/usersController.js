

const {Converter, users, jdyn} = require("./db");
const cryptography = require("../utils/cryptography");
const registersController = require("./registersController");

async function getUser(userID) {
    const projection = ["userID", "username", "utype", "medics", "email", "medicines", "disorders"];
    // const user = await users.getFromUser(userID, projection);

    // console.log("El usuario obtenido es", user);
    // return user;
    const key = {userID}
    const user = jdyn.getItem("users", key, projection);

    return user;
}


async function getDisorders(userID) {
    const projection = ["userID", "username", "disorders"];
    const userDisorders = await users.getFromUser(userID, projection);
    return userDisorders;
}

async function getMedicines(patientID) {
    const fields = ["medicines"];
    const data = await users.getFromUser(patientID, fields);
    return data
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


async function getNotifications(userID) {
    const projection = ["userID", "username", "email", "notifications"];
    const data = await users.getFromUser(userID, projection);
    return data;
}

async function handleRelation(userID, petition) {
    let data;
    if(petition.action === "request") {

        //Controlar que no se pueda enviar una peticion a alguien ya agregado

        //Coger los datos de nuestro usuario
        const userProjection = ["userID", "username", "email", "utype", "patients", "medics", "centers"];
        const user = await users.getFromUser(userID, userProjection);

        const targetProjection = ["notifications", "utype"]
        const targetUser = await users.getFromUser(petition.target, targetProjection);

        console.log("target", targetUser)
        const pendings = targetUser.notifications.requests.filter(pendingUser => user.userID === pendingUser.userID);
        
        if (user.utype === targetUser.utype) {
            throw new Error("Cannot add somebody with the same role");
        }

        const targetType = targetUser.utype;
        if ((targetType === "patient" && user.patients[petition.target])
            || (targetType === "medic" && user.medics[petition.target])
            || (targetType === "center" && user.centers[petition.target])) {

                throw new Error("Users already relationed")

        }

        console.log("pendings", pendings)

        if (pendings.length >= 1) {
            throw new Error("Request already sent");
        }

        console.log(user.utype, targetUser.utype)



        delete targetUser.utype;
        delete user.patients;
        delete user.medics;
        delete user.centers;

        //Ponerselos en notifications del target
        targetUser.notifications.requests.push(user);

        await users.update(petition.target, targetUser);

        const targetDataProjection = ["userID", "username", "email", "utype"];
        data = users.getFromUser(petition.target, targetDataProjection)

    } else if (petition.action === "accept") {

        //Coger los datos de nuestro usuario y notificaciones
        const userProjection = ["userID", "username", "email", "notifications", "utype"];
        const user = await users.getFromUser(userID, userProjection);

        //Coger los datos del otro usuario de la notificacion
        const targetUser = user.notifications.requests.find(user => user.userID === petition.target);

        //Throw si no teniamos una request
        if(!targetUser) {
            throw new Error("There is no request from this user");
        }
        
        if (user.utype === targetUser.utype) {
            throw new Error("Cannot add somebody with the same role");
        }

        //Añadirnos el usuario al grupo que toque
        let  update = {
            updateValues: {
                ":id": targetUser
            },
            updateNames: {
                "#id": targetUser.userID
            }
        };

        if (targetUser.utype === "patient") {
            delete targetUser.utype;
            update.updateExpression = "patients.#id=:id";
        } else if (targetUser.utype === "medic") {
            delete targetUser.utype;
            update.updateExpression= "medics.#id=:id";
        } else if (targetUser.utype === "center") {
            delete targetUser.utype;
            update.updateExpression = "centers.#id=:id";
        } else {
            throw new Error("Unknown user type")
        }

        const pendingRequests = user.notifications.requests.filter(user => user.userID !== targetUser.userID);
        update.updateExpression += ", notifications.requests=:requests";
        update.updateValues[":requests"] = pendingRequests;


        await users.update(userID, update, true);

        //Añadirnos a nosotros al grupo que toque del otro usuario

        let  targetUpdate = {
            updateValues: {
                ":id": user
            },
            updateNames: {
                "#id": user.userID
            }
        };

        if (user.utype === "patient") {
            delete user.utype;
            const projection = ["userID", "username", "email", "medicines", "disorders"];
            const data = await users.getFromUser(user.userID, projection);
            targetUpdate.updateValues[":id"] = data;
            targetUpdate.updateExpression = "patients.#id=:id";
        } else if (user.utype === "medic") {
            delete user.utype;
            targetUpdate.updateExpression= "medics.#id=:id";
        } else if (user.utype === "center") {
            delete user.utype;
            targetUpdate.updateExpression = "centers.#id=:id";
        } else {
            throw new Error("Unknown user type")
        }

        await users.update(targetUser.userID, targetUpdate, true);

        data = targetUser;

    } else if (petition.action === "reject") {

        //Borrar la notificacion

        //Throw si no teniamos una request


    }
    return data;
}



module.exports = {
    getUser,
    getDisorders,
    getMedicines,
    getMedics,
    getCenters,
    update,
    getNotifications,
    handleRelation
}


const {jdyn} = require("./db");
const cryptography = require("../utils/cryptography");
const registersController = require("./registersController");

async function getUser(userID) {
    const projection = ["userID", "username", "utype", "medics", "email", "medicines", "disorders"];
    // const user = await users.getFromUser(userID, projection);

    // console.log("El usuario obtenido es", user);
    // return user;
    console.log("usando a jdyn")
    const key = {userID}
    const user = jdyn.getItem("users", key, projection);

    return user;
}








async function update(userID, updateValue) {

    let projection = ["userID", "username", "patients", "medics", "centers", "utype", "disorders"];
    // const userData = await users.getFromUser(userID, projection);
    const userData = await jdyn.getItem("users", {userID}, projection);
    // console.log(userData)

    //Handle a password update 
    if(updateValue.password) {
        updateValue.salt = cryptography.createSalt();
        updateValue.password = cryptography.encrypt(updateValue.password, updateValue.salt);
    }
    //
    

    // const response = await users.update(userID, updateValue);
    const response = await jdyn.updateItem("users", {userID}, updateValue)



    //! Update the plan if it is a patient
    if(userData.utype === "patient") {
        const projection = ["userID", "username", "email"];
        const data = await jdyn.getItem("users", {userID}, projection);
        const planUpdate = {
            patient: {
                patientID: data.userID,
                username: data.username,
                email: data.email
            }
        }        

        await jdyn.updateItem("plans", {planID: data.userID}, planUpdate)
    }

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

    //console.log("relatedusers update", relatedUsersUpdate);

    if (Object.keys(updateValue).length !== 0) {
        if (userData.patients) {
            const patients = Object.values(userData.patients);
            patients.forEach(async patient => {
                // await users.update(patient.userID, relatedUsersUpdate);
                await jdyn.updateItem("users", {userID: patient.userID}, relatedUsersUpdate);
            });
        }

        console.log("update para los otros", relatedUsersUpdate)

        if (userData.medics) {
            const medics = Object.values(userData.medics);
            medics.forEach(async medic => {
                // await users.update(medic.userID, relatedUsersUpdate);
                //console.log("actualizando el medico", medic.userID)
                const key = {userID: medic.userID};
                //console.log("usamos la key", key)
                await jdyn.updateItem("users", key, relatedUsersUpdate);
            });
        }


        if (userData.centers) {
            const centers = Object.values(userData.centers);
            centers.forEach(async center => {
                //console.log("entramos aqui")
                // await users.update(center.userID, relatedUsersUpdate);
                await jdyn.updateItem("users", {userID: center.userID}, relatedUsersUpdate);
            });       
        }
       // console.log("ahora estamos en este")
    }
        

    // const data = await users.getFromUser(userID, projection);
    const data = await jdyn.getItem("users", {userID}, ["userID", "username", "email"]);
    //console.log("retornamos los datos", data)
    return data;
}


async function getNotifications(userID) {
    const projection = ["userID", "username", "email", "notifications"];
    // const data = await users.getFromUser(userID, projection);
    const data = await jdyn.getItem("users", {userID}, projection);
    return data;
}

async function handleRelation(userID, petition) {
    let data;
    if(petition.action === "request") {

        //Controlar que no se pueda enviar una peticion a alguien ya agregado

        //Coger los datos de nuestro usuario
        const userProjection = ["userID", "username", "email", "utype", "patients", "medics", "centers"];
        // const user = await users.getFromUser(userID, userProjection);
        const user = await jdyn.getItem("users", {userID}, userProjection);

        const targetProjection = ["notifications", "utype"]
        // const targetUser = await users.getFromUser(petition.target, targetProjection);
        const targetUser = await jdyn.getItem("users", {userID: petition.target}, targetProjection);

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
        console.log("reached")
        
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

        await jdyn.updateItem("users", {userID: petition.target}, targetUser);

        const targetDataProjection = ["userID", "username", "email", "utype"];
        data = await jdyn.getItem("users", {userID: petition.target}, targetDataProjection);

    } else if (petition.action === "accept") {

        //Coger los datos de nuestro usuario y notificaciones
        const userProjection = ["userID", "username", "email", "notifications", "utype"];
        const user = await jdyn.getItem("users", {userID}, userProjection);

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
            const projection = ["userID", "username", "email", "medicines", "disorders"];
            const data = await jdyn.getItem("users", {userID: targetUser.userID}, projection);
            update.updateValues[":id"] = data;
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


        // await users.update(userID, update, true);
        const userKey = {userID};
        await jdyn.updateItem("users", userKey, update, true);

        //Añadirnos a nosotros al grupo que toque del otro usuario

        delete user.notifications;
        
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
            const data = await jdyn.getItem("users", {userID: user.userID}, projection);
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

        // await users.update(targetUser.userID, targetUpdate, true);
        const targetKey = {userID: targetUser.userID}
        await jdyn.updateItem("users", targetKey, targetUpdate, true);

        data = targetUser;

    } else if (petition.action === "reject") {

        //Borrar la notificacion
        const projection = ["userID", "notifications"];
        const userData = await jdyn.getItem("users", {userID}, projection);
        userData.notifications.requests = userData.notifications.requests.filter(user => user.userID !== petition.target);


        const update = {
            updateExpression: "notifications.requests=:reqs",
            updateValues: {
                ":reqs": userData.notifications.requests
            }
        }
        await jdyn.updateItem("users", {userID}, update, true);
        projection.push("email")
        projection.push("username");
        data = jdyn.getItem("users", {userID}, projection);

    }
    return data;
}



module.exports = {
    getUser,
    update,
    getNotifications,
    handleRelation
}
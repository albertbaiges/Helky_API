

const { response } = require("express");
const crypto = require("../utils/cryptography");
const {users, jdyn} = require("./db");
const { Patient } = require("../models");

/***************/
let lastId = 1; // For now it must be manually updated everytime the app is openened
/**************/


async function checkLogin(username, password) {
    const response = {status: -1};
    const query = "username = :username";
    const queryParams = {
        ":username": username
    }
    const fields = ["userID", "username", "password", "salt", "utype"];
    const data = await users.queryUser(query, queryParams, fields);
    if (data.length) { // Check if there is any data (implies there is a match for user)
        const userData = data[0]; //There can only be one, queried field is unique
        if (crypto.encrypt(password, userData.salt) === userData.password) {
            response.status = 1;
            response.user = {
                userID: userData.userID,
                username: userData.username,
                utype: userData.utype
            };
        } else {
            response.status = 0;
        }
    }
    return response;
}

async function registerUser(user){

    //Verificar que no haya ya un usuario con este email

    // const query = "email = :email";
    // const queryParams = {
    //     ":email": user.email
    // }
    // const fields = ["userID", "username", "email"];
    // const previousUser = await users.queryUser(query, queryParams, fields);
    const projectionScan = ["userID", "username", "email"];
    const filter = {
        email: user.email
    }

    const previousUser = await jdyn.scan("users", projectionScan, filter);
    console.log(previousUser)

    if(previousUser.length !== 0) {
        throw new Error("Email in use")
    }

    const userID = (Date.now()).toString(16);
    
    const patient = new Patient(userID, user.username, user.email, user.password);
    // //PutItem

    await users.put(patient);

    const projection = ["userID", "username", "email", "utype"];
    
    const signedUser = await jdyn.getItem("users", {userID: patient.userID}, projection);


    //Create a plan
    const userCopy = {...signedUser};
    delete userCopy.utype;

    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday',
    'friday', 'saturday', 'sunday'];

    const plan = {
        planID: userCopy.userID,
        patient: userCopy,
        weekdays: {}
    };

    for (let day of weekdays) {
        plan[day] = {
            day,
            activities: {},
            breakfast: {},
            dinner: {},
            lunch: {},
            medicines: []
        }
    }

    await jdyn.putItem("plans", plan);

    
    // const signedUser = await users.getFromUser(patient.userID, projection);

    return signedUser;
}



/**
 * Allows cheking if that username is already registered
 * @param {string} username name to be checked 
 * 
 * @returns {Promise} resolves true or false depending if the name is already taken
 * in case of registerd, returns the userId
 */
 async function userIsRegistered(username){
    console.log("checking if user is registered...")
    const scan_params = {
        TableName: "users",
        FilterExpression: "username = :username",

        ExpressionAttributeValues: {
            ":username": {S: username}
        },
        ProjectionExpression: "userID"
    }

    const userRegistered = {};
    try {
        const scanCommand = new DDB.ScanCommand(scan_params);
        const response = await client.send(scanCommand);
        if (response.Items.length !== 0) {
            userRegistered.userID = response.Items[0].userID["S"];
            userRegistered.registered = true;
        } else {
            console.log("There is nobody registered with that username");
            userRegistered.registered = false;
        }

    } catch (err) {
        console.error("Something went wrong", err);
    }
    // Returns the userId to avoid scanning the document again if we need to retrieve the user data
    // scanning is a heavy task, the less we scan, the better it performs
    return userRegistered;
}


module.exports = {
    checkLogin,
    registerUser
}
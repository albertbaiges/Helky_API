

const crypto = require("../utils/cryptography");
const {jdyn} = require("./db");
const { Patient } = require("../models");
const md5 = require("md5");


async function checkLogin(email, password) {
    const response = {status: -1};

    const filter = {
        email
    }

    const projection = ["userID", "username", "password", "salt", "utype"];
    const data = await jdyn.scan("users", projection, filter);
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
    const now = Date.now();
    const hex = now.toString(16)
    const userID = md5(hex);
    
    const patient = new Patient(userID, user.username, user.email, user.password);

    await jdyn.putItem("users", patient)

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
        plan.weekdays[day] = {
            day,
            activities: {},
            meals: {
                breakfast: {},
                dinner: {},
                lunch: {},
            },
            medicines: []
        }
    }

    await jdyn.putItem("plans", plan);

    
    // const signedUser = await users.getFromUser(patient.userID, projection);

    return signedUser;
}



module.exports = {
    checkLogin,
    registerUser
}
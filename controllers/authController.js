

const { response } = require("express");
const crypto = require("../utils/cryptography");
const {users} = require("./db");

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


async function registerUser(username, password){
    let data = {status: 0};

    const user = await userIsRegistered(username);
    if (!user.registered) {
        console.log("creating a new user")
        const salt = crypto.createSalt();
        const hashedPassword = crypto.encrypt(password, salt);
        try {
            const put_params = {
                TableName: "users",
                Item: {
                    userID: {
                        S: String(++lastId)
                    },
                    username: {
                        S: username
                    },
                    email: {
                        S: "unkown" //TODO
                    },
                    password: {
                        S: hashedPassword
                    },
                    salt: {
                        S: salt
                    },
                    api_token: {
                        S: "No-Access" //TODO function to generate API keys
                    }
                }
            };

            const putCommand = new DDB.PutItemCommand(put_params);
            const response = await client.send(putCommand);
            // Should use response to verify
            data.status = 1;// Maybe should use http status code of response to verify or something to verify
            data.username = username;
        } catch (err) {
            console.error("Something went wrong", err);
        }
    }
    return data;
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
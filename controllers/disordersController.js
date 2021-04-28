

const {users} = require("./db");

async function getDisorders(patientID, userID, role) {
    try {
        if(userID === patientID || role === "dev") {
            const fields = ["disorders"]; //! Medics, allowedUsers will be added
            return await users.getFromUser(patientID, fields); //! Maybe we can remove await
        } else {
            throw Error("403");
        }
    } catch(error) {
        console.error("Something went wrong", error);
    }
}

module.exports = {
    getDisorders
}
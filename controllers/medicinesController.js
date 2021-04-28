
const {users} = require("./db")

async function getMedicines(patientID) {
    const fields = ["medicines"];
    const data = await users.getFromUser(patientID, fields);
    return data
}

module.exports = {
    getMedicines
}
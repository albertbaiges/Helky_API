
const { users } = require("./db")

async function getPatients(medicID) {
    const projectionArr = ["patients"]
    return users.getFromUser(medicID, projectionArr);
}


module.exports = {
    getPatients
};
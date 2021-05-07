const { users } = require("./db");



function getPatients(centerID) {
    const projection = ["userID", "username", "email", "patients"];
    const data = users.getFromUser(centerID, projection);
    return data;
}

function getMedics(centerID) {
    const projection = ["userID", "username", "email", "medics"];
    const data = users.getFromUser(centerID, projection);
    return data;
}

module.exports = {
    getPatients,
    getMedics
}
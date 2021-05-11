
const { users, jdyn } = require("./db")

async function getPatients(userID) {
    const projection = ["userID", "username", "email", "patients"]
    // return users.getFromUser(medicID, projectionArr);
    console.log("using jdyn")
    const key = {userID};
    const patients = await jdyn.getItem("users", key, projection);
    console.log("pacientes", patients)
    return patients;
}


module.exports = {
    getPatients
};
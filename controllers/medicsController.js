
const { jdyn } = require("./db")

async function getPatients(userID) {
    const projection = ["userID", "username", "email", "patients"]
    // return users.getFromUser(medicID, projectionArr);
    console.log("using jdyn")
    const key = {userID};
    const patients = await jdyn.getItem("users", key, projection);
    console.log("pacientes", patients)
    return patients;
}

async function getCenters(userID) {
    const projection = ["userID", "username", "email", "centers"];
    // const userMedics = await users.getFromUser(userID, projection);
    const key = {userID};
    const userCenters = jdyn.getItem("users", key, projection);
    return userCenters;
}



module.exports = {
    getPatients,
    getCenters
};
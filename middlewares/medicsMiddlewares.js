const { medicsController } = require("../controllers");

function medicPath(req, res, next) {
    console.log("esta intentando acceder", req.payload)
    if (req.payload.utype !== "medic") {
        return res.status("403").send("Only accessible for medics")
    }
    next();
}

async function isPatient(req, res, next) {
    const {userID} = req.payload;
    const {patients} = await medicsController.getPatients(userID);
    const patientsArr = Object.values(patients);
    const patient = patientsArr.find(patient => patient.userID === req.body.userID);
    if (!patient && req.body.userID) {
        return res.status("400").send("This userID does not belong to an associated patient");
    } else if (!patient && !req.body.userID) {
        return res.status("400").json({userID: "Must specify the userID of the patient"});
    }
    next();
}

module.exports = {
    medicPath,
    isPatient
}
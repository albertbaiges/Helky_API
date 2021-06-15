const { registersController, medicsController, centersController, patientsController } = require("../controllers");


async function registerInfo(req, res, next) {
    const {registerID} = req.params;
    const {patient: registerPatient} = await registersController.getRegisterPatient(registerID);
    if (req.payload.utype === "patient" && registerPatient.userID !== req.payload.userID) {
        return res.status("403").json({message: "Cannot access registers of other patients"});
    } else if (req.payload.utype === "medic") {
        const {patients} = await medicsController.getPatients(req.payload.userID);
        const patientsIDs = Object.values(patients).map(patient => patient.userID);
        if (!patientsIDs.includes(registerPatient.userID)) {
            return res.status("403").json({message: "Cannot access the register, it is not an associated patient"});
        }
    } else if (req.payload.utype === "center") {
        const {patients} = await centersController.getPatients(req.payload.userID);
        const patientsIDs = Object.values(patients).map(patient => patient.userID);
        if (!patientsIDs.includes(registerPatient.userID)) {
            return res.status("403").json({message: "Cannot access the register, it is not an associated patient"});
        }
    }
    next();
}

async function createRegister(req, res, next) {
    const supported = registersController.getSupported();
    const {payload} = req;
    const {body} = req;
    if (payload.utype !== "patient") {
        return res.status("403").json({message: "Only patients can create registers"});
    }

    const family = supported.find(disorder => disorder === body.family);
    if (!family) {
        return res.status("400").json({message: `Can only create registers for ${supported}`});
    }

    const {disorders} =  await patientsController.getDisorders(payload.userID);
    const registeredDisorder = Object.values(disorders).find(disorder => disorder.family === family);

    if(!registeredDisorder) {
        return res.status("400").json({message: "Disorder not associated, please add a disorder to your account "
                                                + "with that family"});
    } else if (registeredDisorder.registerID) {
        return res.status("400").json({message: `Register already created for this family of disorders`});
    }

    next();
}

async function patchTracking(req, res, next) {
    const {body} = req;
    let invalid = false;
    const response = {};
    const {registerID} = req.params;

    const {patient: registerPatient} = await registersController.getRegisterPatient(registerID);

    if(registerPatient.userID !== req.payload.userID) {
        response.data = `Only the patient can add lectures to registers`;
        return res.status("403").json(response);
    }

    if (!body.data || body.data.constructor !== Number) {
        response.data = `Number must be provided`;
        invalid = true;
    }

    if (!body.timestamp || body.timestamp.constructor !== String) {
        response.timestamp = `String timestamp must be provided`;
        invalid = true;
    } else {
        let date = new Date(body.timestamp);
        let timestamp = date.valueOf();
        if (isNaN(timestamp)) {
            response.timestamp = `String timestamp must be provided`;
            invalid = true;
        } else if (date.getFullYear() < 2021) {
            response.timestamp = `Registers are nor allowed for dates prior to 1/1/2021`;
            invalid = true;
        }
    }

    if (invalid) {
        return res.status("400").json(response);
    }

    next();
}





module.exports = {
    registerInfo,
    createRegister,
    patchTracking
};


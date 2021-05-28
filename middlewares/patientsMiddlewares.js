const { registersController } = require("../controllers");


function patientPath(req, res, next) {
    console.log("esta intentando acceder", req.payload)
    if (req.payload.utype !== "patient") {
        return res.status("403").send("Only accessible for patients")
    }
    next();
}


function patchPatient(req, res, next) {
    const {medicines, disorders} = req.body;
    let invalid = false;
    const response = {};

    if (medicines) {
        if (medicines.constructor !== Array || !medicines.every(code => code.constructor === String)) {
            response.medicines = "Must be an array of medicine register numbers in string datatype";
            invalid = true;
        }
    }

    if(disorders) {
        if(disorders.constructor !== Array || !disorders.every(disorder => validDisorder(disorder))) {

            response.disorders = "Must be an array of disorder objects";
            invalid = true;
        } else if (!checkFamilies(disorders)) {
            console.log("hay una familia soportada que está repetida!")
            response.disorders = `Only allowed to have one disorder belonging to a family that supports registers (${registersController.getSupported()})`;
            invalid = true;
        }
    }

    if (invalid) {
        return res.status("400").json(response);
    }
    
    next();
}

function validDisorder(disorder) {
    return (disorder.family && disorder.family.constructor === String) && (disorder.type && disorder.type.constructor === String);
}

//Check if multiple disorders belong to a same family that is supports registers
//The app will only allow to have 1 disorder per registerable family
function checkFamilies(disorders) {
    const supportedRegisters = registersController.getSupported();
    const valid = disorders.every(disorder => {
        if (supportedRegisters.includes(disorder.family)) {
            const matches =  disorders.filter(filterDisorder => filterDisorder.family === disorder.family);
            return matches.length === 1;
        }
        return true;
    });
    return valid;
}


module.exports = {
    patientPath,
    patchPatient
};
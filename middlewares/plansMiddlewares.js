const { centersController, medicsController } = require("../controllers");



async function planInfo(req, res, next) {
    const {planID} = req.params;
    if (req.payload.utype === "patient" && planID !== req.payload.userID) {
        return res.status("403").json({message: "Cannot access the plan of other patients"});
    } else if (req.payload.utype === "medic") {
        const {patients} = await medicsController.getPatients(req.payload.userID);
        const patientsIDs = Object.values(patients).map(patient => patient.userID);
        if (!patientsIDs.includes(planID)) {
            return res.status("403").json({message: "Cannot access the register, it is not an associated patient"});
        }
    } else if (req.payload.utype === "center") {
        const {patients} = await centersController.getPatients(req.payload.userID);
        const patientsIDs = Object.values(patients).map(patient => patient.userID);
        if (!patientsIDs.includes(planID)) {
            return res.status("403").json({message: "Cannot access the register, it is not an associated patient"});
        }
    }
    next();
}




function patchMeals(req, res, next) {
    const {body} = req;
    let invalid = false;
    const response = {};
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday',
                    'friday', 'saturday', 'sunday'];
    const meals = ["breakfast", "lunch", "dinner"];

    if (!body.day || body.day.constructor !== String || !weekdays.includes(body.day)) {
        response.day = `String day (${weekdays}) must be provided`;
        invalid = true;
    }

    if (!body.meal || body.meal.constructor !== String || !meals.includes(body.meal)) {
        response.meal = `String meal (${meals}) must be provided`;
        invalid = true;
    }

    const info = body.info;
    if (!info || typeof info !== "object") {
        response.info = "Object info: {menu: string, comments: string} must be provided";
        invalid = true;
    } else if (!Object.keys(info).includes("menu") || !Object.keys(info).includes("comments")) {
        response.info = "Object info: {menu: string, comments: string} must be provided";
        invalid = true;
    } else if (info.menu.constructor !== String || info.comments.constructor !== String ) {
        response.info = "Object info: {menu: string, comments: string} must be provided";
        invalid = true;
    }

    if (invalid) {
        return res.status("400").json(response);
    }

    next();
}


function patchMedicines(req, res, next) {
    const {body} = req;
    let invalid = false;
    const response = {};
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday',
    'friday', 'saturday', 'sunday'];

    if (!body.day || body.day.constructor !== String || !weekdays.includes(body.day)) {
        response.day = `String day (${weekdays}) must be provided`;
        invalid = true;
    }

    if (!body.medicines || body.medicines.constructor !== Array) {
        console.log("nos saca el primero")
        response.medicines = `Array of entries must be provided`;
        response.entry = "{ code: Number (spanish medicine register code), at: hh:mm:ss | [hh:mm:ss] }"
        invalid = true;
    } else {
        const check = body.medicines.every(entry => entry.code && entry.code.constructor === Number && entry.at &&
                                                    (entry.at.constructor === String || entry.at.constructor === Array));
        
        if (!check) {
            console.log("nos echa este")
            response.medicines = `Array of entries must be provided`;
            response.entry = "{ code: Number (spanish medicine register code), at: hh:mm:ss | [hh:mm:ss] }"
            invalid = true;
        }
    }

    if (invalid) {
        return res.status("400").json(response);
    }

    next(); 
}


function patchActivities(req, res, next) {
    const {body} = req;
    let invalid = false;
    const response = {};
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday',
                    'friday', 'saturday', 'sunday'];

    if (!body.day || body.day.constructor !== String || !weekdays.includes(body.day)) {
        response.day = `String day (${weekdays}) must be provided`;
        invalid = true;
    }

    const activities = body.activities;
    if (!activities || typeof activities !== "object") {
        response.activities = "Object activities: {exercises: string, comments: string} must be provided";
        invalid = true;
    } else if (!Object.keys(activities).includes("exercises") || !Object.keys(activities).includes("comments")) {
        response.activities = "Object activities: {exercises: string, comments: string} must be provided";
        invalid = true;
    } else if (activities.exercises.constructor !== String || activities.comments.constructor !== String ) {
        response.activities = "Object activities: {exercises: string, comments: string} must be provided";
        invalid = true;
    }

    if (invalid) {
        return res.status("400").json(response);
    }

    next();
}



module.exports = {
    planInfo,
    patchMeals,
    patchMedicines,
    patchActivities
}

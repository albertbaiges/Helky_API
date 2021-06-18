

const {jdyn} = require("./db");
const registersController = require("./registersController");

async function getDisorders(userID) {
    const projection = ["userID", "username", "email", "disorders"];
    // const userDisorders = await users.getFromUser(userID, projection);
    const key = {userID};
    const userDisorders = jdyn.getItem("users", key, projection);
    return userDisorders;
}

async function getMedicines(userID) {
    const projection = ["userID", "username", "email", "medicines"];

    console.log("usando a jdyn")
    const key = {userID};
    // const data = await users.getFromUser(userID, fields);
    const userMedicines = jdyn.getItem("users", key, projection);
    return userMedicines;
}

async function getMedics(userID) {
    const projection = ["userID", "username", "email", "medics"];
    const key = {userID};
    console.log("usando a jdyn")
    const userMedics = jdyn.getItem("users", key, projection);
    // const userMedics = await users.getFromUser(userID, projection);
    return userMedics;
}

async function getCenters(userID) {
    const projection = ["userID", "username", "email", "centers"];
    // const userMedics = await users.getFromUser(userID, projection);
    const key = {userID};
    const userCenters = jdyn.getItem("users", key, projection);
    return userCenters;
}


async function update(userID, data) {
    //Cogemos el paciente y sus campos
    const fields = ["medicines", "disorders", "medics", "centers"];
    const user = await jdyn.getItem("users", {userID}, fields);


    //Si los datos recibidos tienen medicinas
    if (data.medicines) {
        user.medicines = data.medicines;
        console.log("Medicinas del usuario", user.medicines)
        //update the plan
        const planProjection = ["planID", "weekdays"];
        const plan = await jdyn.getItem("plans", {planID: userID}, planProjection);
        console.log("plan a actualizar", plan)
        const weekdays = Object.values(plan.weekdays)
        console.log("dias de la semana", weekdays);
        const updatedWeekMedicines = {
            weekdays: { }
        }

        weekdays.forEach(weekday => {
            updatedWeekMedicines.weekdays[weekday.day] = {
                medicines: plan.weekdays[weekday.day].medicines.filter(medicine => user.medicines.includes(medicine.code))
            }
        })

        console.log("actualizacion", updatedWeekMedicines);
        //Quitamos las medicinas del calendario
        const response = await jdyn.updateItem("plans", {planID: plan.planID}, updatedWeekMedicines);
    }

    //Si recibimos enfermedades
    if(data.disorders) {
        //Array de nuevas enfermedades
        const updatedDisorders = [];
        //Recorremos el array de enfermedades
        for (let disorder of data.disorders) {
            console.log("Enfermedad", disorder)
            const storedDisorder = user.disorders.find(storedDisorder => {
                return storedDisorder.family === disorder.family && storedDisorder.type === disorder.type;
            });

            user.disorders.splice(user.disorders.indexOf(storedDisorder), 1);
            


            if (storedDisorder) {
                console.log("lo tenemos y lo copiamos", storedDisorder)
                updatedDisorders.push(storedDisorder);
            } else {
                if (registersController.getSupported().includes(data)) {
                    disorder.registerID = null;
                }
                updatedDisorders.push(disorder);
            }
        }

        user.disorders.forEach(async disorder => {
            if (disorder.registerID) {
                await jdyn.deleteteItem("registers", {registerID: disorder.registerID});
            }
        });
        
        user.disorders = updatedDisorders;
    }

    const userUpdate = {
        medicines: user.medicines,
        disorders: user.disorders
    }
    //Actualizamos el usuario
    const response = await jdyn.updateItem("users", {userID}, userUpdate);
    // console.log("la respuesta es", response);

    const medic_centerUpdate = {
        patients: {
            [userID]: {
                medicines: response.medicines,
                disorders: response.disorders
            }
        }
    }

    const medics = Object.values(user.medics);
    medics.forEach(async medic => {
        await jdyn.updateItem("users", {userID: medic.userID}, medic_centerUpdate);
    });

    const centers = Object.values(user.centers);
    centers.forEach(async center => {
        await jdyn.updateItem("users", {userID: center.userID}, medic_centerUpdate);
    });

    return {userID, medicines: response.medicines, disorders: response.disorders};
}

module.exports = {
    getDisorders,
    getMedicines, 
    getMedics,
    getCenters,
    update
}
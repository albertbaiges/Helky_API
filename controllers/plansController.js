
const usersController = require("./usersController");
const { plans, jdyn } = require("./db"); 

async function getMealPlan(planID) {
    const projection = ["patient", "weekdays"];
    try {
        // const data = await plans.get(planID, fields);
        const key = {planID};
        const data = jdyn.getItem("plans", key, projection);
        return data;
    } catch (error) {
        console.error("Something went wrong", error);
    }
}

async function getMedicines(planID) {
    const projection = ["patient", "weekdays"];
    try {
        // const data = await plans.get(planID, fields);
        const key = {planID}
        const data = await jdyn.getItem("plans", key, projection);
        // console.log("datos obtenidos", data.weekdays)
        for(let day in data.weekdays){
            data.weekdays[day] = {
                day,
                medicines: data.weekdays[day].medicines
            }
        }
        return data;
    } catch (error) {
        console.error("Something went wrong", error);
    }
}

async function updateMeals(planID, data) {

    const update = {
        weekdays: {
            [data.day]: {
                [data.meal]: data.info
            }
        }
    }

    // const response = await plans.update(planID, update);
    const key = {planID};
    const response = await jdyn.updateItem("plans", key, update);
    return response.weekdays;
}

async function updateMedicines(planID, data) {
    //Verificar que el paciente tenga todas las medicinas que se le van a asingar
    const user = await usersController.getUser(planID);
    console.log("Queremos actualizar los datos para", user)
    const check = data.medicines.every(medicine => user.medicines.includes(medicine.code));
    if(!check) {
        throw new Error("Trying to plan a medicine that is not assigned");
    }
    //Actualizar las medicinas del plan
    const update = {
        weekdays: {
            [data.day]: {
                medicines: data.medicines
            }
        }
    }
    console.log("Objeto de actualizacion", update);
    // const response = await plans.update(planID, update);
    const key = {planID};
    const response = jdyn.updateItem("plans", key, update);
    return response;
}

async function getActivities(planID) {
    const projection = ["patient", "weekdays"];
    try {
        // const data = await plans.get(planID, fields);
        // console.log("datos obtenidos", data.weekdays)
        console.log("using jdyn")
        const key = {planID};
        const data = await jdyn.getItem("plans", key, projection)
        for(let day in data.weekdays){
            data.weekdays[day] = {
                day,
                activities: data.weekdays[day].activities
            }
        }
        return data;
    } catch (error) {
        console.error("Something went wrong", error);
    }
}

async function updateActivities(planID, data) {
    const update = {
        weekdays: {
            [data.day]: {
                activities: data.activities
            }
        }
    }
    // const response = await plans.update(planID, update);
    const key = {planID};
    const response = await jdyn.updateItem("plans", key, update);
    return response.weekdays;
}


module.exports = {
    getMealPlan,
    getMedicines,
    updateMeals,
    updateMedicines,
    getActivities,
    updateActivities
}
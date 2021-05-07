
const usersController = require("./usersController");
const { plans } = require("./db"); 

async function getMealPlan(planID) {
    const fields = ["patient", "weekdays"];
    try {
        const data = await plans.get(planID, fields);
        console.log("tenemos estos datos", data)
        return data;
    } catch (error) {
        console.error("Something went wrong", error);
    }
}

async function getMedicines(planID) {
    const fields = ["patient", "weekdays"];
    try {
        const data = await plans.get(planID, fields);
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

async function update(planID, data) {

    const update = {
        weekdays: {
            [data.day]: {
                [data.meal]: data.info
            }
        }
    }

    const response = await plans.update(planID, update);
    console.log("repuesta", response);
    return response.weekdays;
}

async function updateMedicines(planID, data) {
    //Verificar que el paciente tenga todas las medicinas que se le van a asingar
    const user = await usersController.getUser(planID);
    console.log("Queremos actualizar los datos para", user)
    const check = data.medicines.every(medicine => user.medicines.includes(medicine.code));
    if(!check) {
        throw new Error("Trying to plan a medicine that is not assigned to the patient of that plan");
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
    const response = await plans.update(planID, update);
    console.log("Valores actualizados", response);
    return response;
}


module.exports = {
    getMealPlan,
    getMedicines,
    update,
    updateMedicines
}
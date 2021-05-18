

const {Converter, users, jdyn} = require("./db");

async function update(userID, data) {
    const fields = ["utype", "medicines", "disorders", "medics"];
    const user = await users.getFromUser(userID, fields);

    if(user.utype !== "patient")
        return {Error: "Not allowed"}

    delete user.utype;

    if (data.medicines) {
        // console.log("cambiado")
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

        // const weekMedicines = weekdays.map(day => day.medicines);
        // console.log("medicinas semanales", weekMedicines)
        // weekMedicines.forEach(medicines => medicines.filter(medicine => user.medicines.includes(medicine.code)));
        // console.log("medicinas semanales actualizadas", weekMedicines)

        // const update = {
        //     weekdays: { }
        // }

        // weekdays.forEach(weekday => {
        //     update.weekdays[weekday.day] = {
        //         medicines: weekday.medicines
        //     }
        // });

        //console.log("actualizacion", update);

        const response = await jdyn.updateItem("plans", {planID: plan.planID}, updatedWeekMedicines);

    }

    // console.log("nuevos datos", data)
    delete user.disorders;

    const response = await users.update(userID, user);
    // console.log("la respuesta es", response);

    const medicUpdate = {
        patients: {
            [userID]: {
                medicines: response.medicines
            }
        }
    }

    const medics = Object.values(user.medics);
    medics.forEach(async medic => {
        const response = await users.update(medic.userID, medicUpdate);
    });

    return {userID, medicines: response.medicines};
}

module.exports = {
    update
}


const {Converter, users} = require("./db");

async function update(userID, data) {
    const fields = ["utype", "medicines", "disorders", "medics"];
    const user = await users.getFromUser(userID, fields);

    if(user.utype !== "patient")
        return {Error: "Not allowed"}

    delete user.utype;

    if (data.medicines) {
        // console.log("cambiado")
        user.medicines = data.medicines;
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
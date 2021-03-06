

const md5 = require("md5");
const {jdyn} = require("./db");

let lastRegisterID = 1;

function getSupported() {
    return ["diabetes", "blood pressure"];
}

async function getRegisterPatient(registerID) {
    const projection = ["patient"];
    try {
        const key = {registerID};
        const data = jdyn.getItem("registers", key, projection);
        return data;
    } catch (err) {
        throw err;
    }
}

async function getRegister(registerID) {
    const projection = ["registerID", "disorder", "disorderFamily", "patient"];
    try {
        const key = {registerID};
        const data = jdyn.getItem("registers", key, projection);
        return data;
    } catch (err) {
        throw err;
    }
}


async function createRegister(userID, family) {


    const projection = ["userID", "username", "email", "disorders", "medics", "centers"];
    const user = await jdyn.getItem("users", {userID}, projection);

    const patient = {
        userID: user.userID,
        username: user.username,
        email: user.email
    };

    const disorderInfo = user.disorders.find(disorder => disorder.family === family);


    const now = Date.now();
    const hex = now.toString(16)
    const registerID = md5(hex);

    console.log("registerID", registerID);

    const item = {
        registerID,
        disorderFamily: disorderInfo.family,
        disorder: disorderInfo.type,
        patient,
        tracking: { }
    }
    
    console.log("item", item);

    const response = await jdyn.putItem("registers", item);

    disorderInfo.registerID = registerID;

    const update = {
        disorders: user.disorders
    }

    console.log("item", update);

    const updateResponse = await jdyn.updateItem("users", {userID}, update);


    const relativesUpdate = {
        patients: {
            [user.userID]: {
                disorders: user.disorders
            }
        }
    }

    const medics = Object.values(user.medics);

    medics.forEach(async medic => {
        await jdyn.updateItem("users", {userID: medic.userID}, relativesUpdate);
    });

    const centers = Object.values(user.centers);

    centers.forEach(async center => {
        await jdyn.updateItem("users", {userID: center.userID}, relativesUpdate);
    });

    return disorderInfo;
}


async function getTracking(registerID, month, year) {
    //month and year are used to return specific trackings, by default we get current ones
    console.log("procesando con la version nueva")
    console.log("Se quiere el mes", month, "y a??o", year)
    const date = new Date();
    if(!month) {
        month = date.getMonth() + 1;
    }

    if(!year) {
        year = date.getFullYear();
    }

    const projection = [`tracking.${year}.${month}`, "patient", "disorder", "disorderFamily"];
    // const data = await registers.get(registerID, projection);
    const key = {registerID};
    const data = jdyn.getItem("registers", key, projection)
    return data;
}


async function addTrackingEvent(registerID, event) {
    // const {year, month, day, value} = event;
    const value = event;
    const date = new Date(event.timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Check if we have that month and day on the register
    const tracking = `tracking.${year}.${month}.${day}`;
    let projection = ["registerID", "patient", tracking];

    const data = await jdyn.getItem("registers", {registerID}, projection);

    let aux = 3;
    while(!data.tracking) {
        projection = [tracking.split(".").slice(0, aux).join(".")];
        const temp = await jdyn.getItem("registers", {registerID}, projection);
        data.tracking = temp.tracking;
        aux--;
    }

    console.log(data);
    console.log(data.tracking[2021])
    console.log("aux", aux)
    
    //If different the tracking has not been captured by the while-loop
    //meaning there was tracking.yyyy.mm.dd
    let response;
    
    if (aux >= 2) {
        console.log("modo automatico")
        let values = [];
        if(aux === 3){
            values = data.tracking[year][month][day];
        }

        values.push(value);
        
        const update = {
            tracking: {
                [year]: {
                    [month]: {
                        [day]: values
                    }
                }
            }
        }
    
    
        const key = {registerID};
        response = await jdyn.updateItem("registers", key, update);
    } else {
        console.log("modo manual")

        const update = {
            tracking: {
                [year]: {
                    [month]: {
                        stamp: (new Date(year, month-1)).toISOString(),
                        [day]: [value]
                    }
                }
            }
        }
        

        const updateNames = {};
        let updateExpression = "";
        console.log("Valor de aux")
        const attributes = tracking.split(".").splice(0, aux+2); //Aux siempre vale 1 menos del que coindice, y sumamos 1 pq el de corte se excluye
        console.log("atributos existentes", attributes)
        attributes.forEach((value, index) => {
            if ((isNaN(value))) {
                updateExpression += value;
            } else {
                if(index !== 0) {
                    updateExpression += ".";
                }
                updateExpression += "#n"+value;
                updateNames["#n"+value] = value;
            }
        });

        let updateValue = attributes.reduce((prev, curr)=> {
            return prev[curr];
        }, update)
        const reversed = attributes.reverse();
        let updateValueName = ":" + reversed.join("_");

        const updateValues = {[updateValueName]: updateValue}
        updateExpression += `=${updateValueName}`;

        const updateManual = {
            updateExpression,
            updateValues,
            updateNames
        }

        console.log(updateManual);
        const key = {registerID};
        response = await jdyn.updateItem("registers", key, updateManual, true);

    }

    return response;
}


module.exports = {
    getSupported,
    getRegisterPatient,
    getRegister,
    getTracking, 
    createRegister,
    addTrackingEvent
}
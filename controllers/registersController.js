

const {registers, Converter, users, jdyn} = require("./db");

let lastRegisterID = 1;

function getSupported() {
    return ["Diabetes", "High Blood Preassure"];
}

async function getRegister(registerID) {
    const projection = ["registerID", "disorder", "patient"];
    console.log("procesando este")
    try {
        // const data = await registers.getFromRegister(registerID, projection);
        const key = {registerID};
        const data = jdyn.getItem("registers", key, projection);
        return data;
    } catch (err) {
        throw err;
    }
}


async function createRegister(patientID, disorder) {
    const arr = ["userID", "email", "username", "disorders"];
    const patient = await users.getFromUser(patientID, arr);
    if (patient) {
        //!Must check if user has this disorders, and if not return that it does not have that disorder
        //!On client, if received it does not suffer it, ask if want to add it and repeat the creation
        //!of the register --> request to API to add disorder and request this endpoint again
        //! also check that this user does not already have a register for that disorder


        //!! MUST TURN THE CODE INTO SINGLE RESPONSIBILITY PRINCIPLE
        //Now this asumes it does not have it and that the user suffers from that disorder
        const tracking = {};
        for (let i = 1; i <= 31; i++) {
            tracking["day_" + i] = new Array(3);
        }
        
        try {
            const register = {
                registerID: String(++lastRegisterID),
                user: {
                    userID: patient.userID,
                    email: patient.email,
                    username: patient.username
                },
                disorder,
                tracking
    
            }

            let response = await registers.create(register);
            // const itemMarshall = Converter.marshall(item);
            // const putItemInput = {
            //     TableName: "registers",
            //     Item: itemMarshall
            // }
            // const putItemCommand = new DDB.PutItemCommand(putItemInput);
            // const response = await client.send(putItemCommand);
            // const update = {
            //     disorders: {
            //         demodisorder: "testing2"
            //     },
            //     name: "testingtest"
            // }
            // response = await users.update(patientID, update);

            const update = {
                disorders: {...patient.disorders}
            };


            update.disorders[disorder].registerID = register.registerID;

            response = await users.update(patientID, update);

            // console.log(patient.disorders);
            return {id: register.registerID};
        } catch (err) {
            console.error("Something went wrong", err);
            //! Warn front about an error
        }
        
    } else {
        //! WARN THE RESPONSE THAT THE USER DID NOT EXIST --> patient === undefined
    }
}


async function getTracking(registerID, month, year) {
    //month and year are used to return specific trackings, by default we get current ones
    console.log("procesando con la version nueva")
    console.log("Se quiere el mes", month, "y año", year)
    const date = new Date();
    if(!month) {
        month = date.getMonth() + 1;
    }

    if(!year) {
        year = date.getFullYear();
    }

    const projection = [`tracking.${year}.${month}`, "patient"];
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

    const data = await registers.get(registerID, projection);

    let aux = 3;
    while(!data.tracking) {
        projection = [tracking.split(".").slice(0, aux).join(".")];
        const temp = await registers.get(registerID, projection);
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
    
    
    // If we do not have anything:
        // PutItem info as new month and add month timestamp on the shoot
        // console.log("update", update.tracking[year][month])
        // response = await registers.update(registerID, update, false);
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
    getRegister,
    getTracking, 
    createRegister,
    addTrackingEvent
}
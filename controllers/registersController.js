

const {registers, Converter, users} = require("./db");

let lastRegisterID = 1;

function getSupported() {
    return ["Diabetes", "High Blood Preassure"];
}

async function getRegister(registerID) {
    const fields = ["registerID", "disorder", "user"];
    try {
        const data = await registers.getFromRegister(registerID, fields);
        return data;
    } catch (error) {
        console.error("Something went wrong", err);
    }
}

async function getTracking(registerID) {
    const fields = ["tracking"];
    try {
        const data = await registers.getFromRegister(registerID, fields);
        return data;
    } catch (err) {
        console.error("Something went wrong", err);
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

//! Ready to use but requires the registerID to have all the lists dayX: [empty, empty, empty]
async function addTrackingEvent(registerID, tracking) {
    const date = new Date(tracking.date);
    //console.log(date.getHours(), date.getMinutes())
    const day = date.getDate();
    const hour = date.getHours();
    let slot;
    console.log(hour)
    if (6 < hour && hour < 10) { //!Must be improved
        slot = 0;
    } else if (12 < hour && hour < 16) {
        slot = 1;
    } else if (19 < hour && hour < 23 || true) { //! Remove that true when completed
        slot = 2;
    } else {
        return "not supported"
    }
    const registerIDMarsh = Converter.marshall({registerID})
    const marshall = Converter.marshall({tracking});
    try {
        const updateInput = {
            TableName: "registers",
            Key: registerIDMarsh,
            UpdateExpression: `SET tracking.day_1[2] = :tracking`, //! Add the day from the petition
            ExpressionAttributeValues: {
                ":tracking": marshall.tracking
            },
            ReturnValues: "UPDATED_OLD"
        };
        console.log(updateInput.ExpressionAttributeValues)
        const updateCommand = new DDB.UpdateItemCommand(updateInput);
        const response = await client.send(updateCommand);
        console.log(response);
        //Prepared to return old values if something gets overwritten
    } catch (err) {
        console.error("Something went wrong", err);
    }
    return "done";
}



async function getNewTracking(registerID, month, year) {
    //month and year are used to return specific trackings, by default we get current ones
    console.log("Se quiere el mes", month, "y año", year)
    const date = new Date();
    if(!month) {
        month = date.getMonth() + 1;
    }

    if(!year) {
        year = date.getFullYear();
    }

    const projection = [`tracking.${year}.${month}`];
    console.log(projection)
    const data = await registers.get(registerID, projection);

    return data;
}


async function addTrackingEventNew(registerID, event) {
    const {year, month, day, value} = event;
    console.log(registerID, year, month, day, value)

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
        response = await registers.update(registerID, update, false);
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

        response = await registers.update(registerID, updateManual, true);
    }

    return data;
}


module.exports = {
    getSupported,
    getRegister,
    getTracking, 
    createRegister,
    addTrackingEvent,
    getNewTracking,
    addTrackingEventNew
}
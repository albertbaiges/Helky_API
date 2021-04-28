

const {registers, Converter, users} = require("./db");

let lastRegisterID = 1;


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



module.exports = {
    getRegister,
    getTracking, 
    createRegister,
    addTrackingEvent
}
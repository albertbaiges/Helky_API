
// const AWS = require("aws-sdk");

// const config = {
//     region: "eu-west-3",
//     accessKeyId: "AKIATJZDFZROOUEDIA5B",
//     secretAccessKey: "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"
// }

// const dynamodb = new AWS.DynamoDB(config);

// var params = {
//     Item: {
//         "userID": {S: "Albert"},
//         "surname": {S: "Baiges"}
//     },
//     ReturnConsumedCapacity: "TOTAL",
//     TableName: "users"
// };
// dynamodb.putItem(params, function (err, data) {
//     if (err) console.log(err, err.stack); // an error occurred
//     else console.log(data);           // successful response
// });

//const AWS = require("aws-sdk");


const DDB = require("@aws-sdk/client-dynamodb");
const {DynamoDB: {Converter}} = require("aws-sdk");


const config = {
    region: "eu-west-3",
    credentials: {
        accessKeyId: "AKIATJZDFZROOUEDIA5B",
        secretAccessKey: "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"
    }
}

// Old
//const dynamodb = new AWS.DynamoDB(config);

// New
const client = new DDB.DynamoDBClient(config);


async function getItem(input) {
    try {
        const getItemCommand = new DDB.GetItemCommand(input);
        const response = await client.send(getItemCommand);
        const item = response.Item;
        return item && Converter.unmarshall(item); // Short-Circuit: item unmarshalled if exists or undefined if not
    } catch (err) {
        throw err;
    }
}

async function scanTable(input) {
    try {
        const scanCommand = new DDB.ScanCommand(input);
        const response = await client.send(scanCommand);
        const items = response.Items;
        const itemsUnmarsh = [];
        items.forEach(item => {
            itemsUnmarsh.push(Converter.unmarshall(item));
        });
        return itemsUnmarsh;
    } catch (err) {
        throw err;
    }
}

async function putItem(input) {
    try {
        const putItemCommand = new DDB.PutItemCommand(input); 
        const response = await client.send(putItemCommand);
        // //! Verify it worked using the http status code of the response
        // //! improve the return
        return;
    } catch (err) {
        throw err;
    }
}

async function updateItem(input) {
    try {
        const updateCommand = new DDB.UpdateItemCommand(input);
        const response = await client.send(updateCommand);

                // //! Verify it worked using the http status code of the response
        // //! improve the return
        //! the updated values??
        return response;
    } catch (err) {
        throw err;
    }
}


module.exports = {
    Converter, 
    getItem,
    scanTable,
    putItem,
    updateItem
}


const {Converter, getItem, putItem} = require("./dynamoDB");

async function getFromRegister(registerID, projectionArr) {
    const registerIDMarsh = Converter.marshall({registerID});
    const input = {
        TableName: "registers",
        Key: registerIDMarsh
    }
    if (projectionArr.includes("user")) { //! user is a received keyword
        projectionArr.splice(projectionArr.indexOf("user"), 1, "#user");
        input.ExpressionAttributeNames = {"#user": "user"};
    }
    const projection = projectionArr.reduce((prev, curr, i) => prev + (i !== 0 ? ", ": "") + curr, "");
    input.ProjectionExpression = projection

    try {
        const data = await getItem(input); //! must check if data is not undefined
        data.date = new Date(2021, 2); //! Set to correcponding moth-year (date) of the tracking
        return data;
    } catch (err) {
        console.error("Something went wrong", err);
    }
}

async function create(register) {
    const registerMarshall = Converter.marshall(register);
    const input = {
        TableName: "registers",
        Item: registerMarshall
    }

    const response = await putItem(input);
    // const putItemCommand = new DDB.PutItemCommand(putItemInput); 
    // const response = await client.send(putItemCommand);
    // //! Verify it worked using the http status code of the response
    // //! improve the return
}

module.exports = {
    getFromRegister,
    create
}
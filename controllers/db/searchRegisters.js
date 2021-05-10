

const {Converter, getItem, putItem, updateItem} = require("./dynamoDB");

async function getFromRegister(registerID, projection) {
    const registerIDMarsh = Converter.marshall({registerID});

    let {projectionExpression, expressionAttributeNames} = buildProjection(projection);


    const input = {
        TableName: "registers",
        Key: registerIDMarsh,
        ProjectionExpression: projectionExpression,
    }

    if (Object.keys(expressionAttributeNames).length !== 0) {
        input.ExpressionAttributeNames = expressionAttributeNames
    }

    try {
        const data = await getItem(input);
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

async function get(registerID, projection) {
    const registerIDMarsh = Converter.marshall({registerID});
    let {projectionExpression, expressionAttributeNames} = buildProjection(projection);

    console.log("nueva peticion")
    const input = {
        TableName: "registers",
        Key: registerIDMarsh,
        ProjectionExpression: projectionExpression,
    }

    if (Object.keys(expressionAttributeNames).length !== 0) {
        input.ExpressionAttributeNames = expressionAttributeNames
    }

    const response = await getItem(input);
    return response;
}


function buildProjection(projection) {
    let expressionAttributeNames = {};
    let projectionExpression = "";

    for (let i = 0; i < projection.length; i++) {
        const chainProperty = projection[i];
        const properties = chainProperty.split(".");
        for (let j = 0; j < properties.length; j++) {
            const property = properties[j];
            const expKey = (isNaN(property)) ? property : "#n"+property;
            if(expKey !== property) {
                expressionAttributeNames[expKey] = property;
            }
            if (j === 0) {
                projectionExpression += expKey
            } else {
                projectionExpression += "." + expKey
            }
        }
        if(i !== projection.length - 1) {
            projectionExpression += ",";
        }
    }
    return {projectionExpression, expressionAttributeNames};
}

function buildUpdate(update) {
    // console.log("la update es", update)
    let updateExpressions = [];
    const updateNames = {};
    const updateValues = {};
    for (const key in update) {
        const expKey = (isNaN(key)) ? key : "#n"+key;
        console.log("miramos diferencias", expKey, key)
        if(expKey !== key) {
            console.log("eran diferentes", expKey, key)
            updateNames[expKey] = key;
        }
        if(update[key].constructor === Object) {
            // console.log("la key tiene un objeto dentro")
            const subObject = buildUpdate(update[key]); //Que le haga lo mismo a ese objeto
            subObject.updateExpressions = subObject.updateExpressions.map(update => expKey + "." + update + "_" + key);
            
            //Maybe needed in the future
            // const mappedNameEntries = Object.entries(subObject.updateNames).map(entry => [entry[0] + "_" + expKey, entry[1]]); 
            // subObject.updateNames = Object.fromEntries(mappedNameEntries);
            
            const mappedValueEntries = Object.entries(subObject.updateValues).map(entry => [entry[0] + "_" + key, entry[1]]); 
            subObject.updateValues = Object.fromEntries(mappedValueEntries);
            updateExpressions = updateExpressions.concat(subObject.updateExpressions);
            Object.assign(updateNames, subObject.updateNames);
            Object.assign(updateValues, subObject.updateValues);
        } else {
            // console.log("la key no contiene un objecto")
            updateExpressions.push(`${expKey}=:${key}`);
            updateValues[`:${key}`] = update[key];
        }
    }
    return {updateExpressions, updateNames, updateValues}


}

async function update(registerID, update, manual) {

    console.log("procesando update")
    const registerIDMarsh = Converter.marshall({registerID});

    let updateExpressionData, updateValues, updateNames;
    if(manual) {
        updateExpressionData = update.updateExpression;
        updateValues = update.updateValues;
        updateNames = update.updateNames;
    } else {
        const result = buildUpdate(update);
        console.log("resultado build", result);
        updateExpressionData = result.updateExpressions.join();
        updateNames = result.updateNames;
        updateValues = result.updateValues;
    }

    const updateValuesMarsh = Converter.marshall(updateValues);


    const input = {
        TableName: "registers",
        Key: registerIDMarsh,
        UpdateExpression: "SET " + updateExpressionData,
        ExpressionAttributeValues: updateValuesMarsh,
        ReturnValues: "UPDATED_NEW"
    }


    if(Object.keys(updateNames).length !== 0) {
        input.ExpressionAttributeNames = updateNames;
    }

    const response = await updateItem(input);
    return response;
}


module.exports = {
    getFromRegister,
    create,
    get,
    update
}
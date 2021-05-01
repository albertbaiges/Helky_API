

const {Converter, getItem, scanTable, updateItem} = require("./dynamoDB");

async function getFromUser(userID, projectionArr) {
    const userIDMarsh = Converter.marshall({userID});
    const projection = projectionArr.reduce((prev, curr, i) => prev + (i !== 0 ? ", ": "") + curr, "");
    const input = {
        TableName: "users",
        Key: userIDMarsh,
        ProjectionExpression: projection
    }

    try {
        return await getItem(input); //!Can directly return the promise, without await
    } catch (err) {
        console.error("Something went wrong", err);
    }
}

async function queryUser(query, queryParams, projectionArr) {
    const projection = projectionArr.reduce((prev, curr, i) => prev + (i !== 0 ? ", ": "") + curr, "");
    const marshall = Converter.marshall(queryParams);
    const input = {
        TableName: "users",
        FilterExpression: query,
        ExpressionAttributeValues: marshall,
        ProjectionExpression: projection
    }

    try {
        return await scanTable(input); //!Can directly return the promise, without await
    } catch (e) {
        console.log("something went wrong")
    }

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


async function update(userID, update) {
    const userIDMarsh = Converter.marshall({userID});
    console.log("datos a actualizar****", update)
    // let updateExpressions = [];
    // const updateValues = {};

    // for (const key in update) {
    //     console.log(key, update[key].constructor)
    //     updateExpressions.push(`${key}=:${key}`);
    //     updateValues[`:${key}`] = update[key];
    // }

    
    // const updateExpressionData = updateExpressions.join();
    // const updateValuesMarsh = Converter.marshall(updateValues);

    const {updateExpressions, updateNames, updateValues} = buildUpdate(update);
    const updateExpressionData = updateExpressions.join();
    // console.log("Update expression array", updateExpressions);
    // console.log("Update expression final", updateExpressionData);
    // console.log("Update names final", updateNames);
    // console.log("Update values final", updateValues)
    const updateValuesMarsh = Converter.marshall(updateValues);

    // console.log(updateExpressionData);
    // console.log(updateValuesMarsh);

    const input = {
        TableName: "users",
        Key: userIDMarsh,
        UpdateExpression: "SET " + updateExpressionData,
        ExpressionAttributeValues: updateValuesMarsh,
        ReturnValues: "UPDATED_NEW"
    }

    console.log("los nombres a actualizar son", updateNames);

    if(Object.keys(updateNames).length !== 0) {
        input.ExpressionAttributeNames = updateNames;
    }

    // console.log(input)
    const response = await updateItem(input);
    const attributes = Converter.unmarshall(response.Attributes); //!MOver esto dentro
    return attributes;
}

async function deleteField(userID, field) {
}

module.exports = {
    getFromUser,
    queryUser,
    update
}
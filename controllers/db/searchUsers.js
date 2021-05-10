

const {Converter, getItem, scanTable, updateItem, putItem} = require("./dynamoDB");

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


async function update(userID, update, manual) {

    const userIDMarsh = Converter.marshall({userID});

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
        TableName: "users",
        Key: userIDMarsh,
        UpdateExpression: "SET " + updateExpressionData,
        ExpressionAttributeValues: updateValuesMarsh,
        ReturnValues: "UPDATED_NEW"
    }


    if(Object.keys(updateNames).length !== 0) {
        input.ExpressionAttributeNames = updateNames;
    }

    const response = await updateItem(input);
    const attributes = Converter.unmarshall(response.Attributes); //!MOver esto dentro
    return attributes;
}



async function getUsers(filter) {

    const {updateExpressions: filterExpressions, updateNames: filterNames, updateValues: filterValues} = buildUpdate(filter);
    const filterValuesMarsh = Converter.marshall(filterValues);
    wildcardFormat = filterExpressions.map(filterExpression => {
        const formated = filterExpression.replace("=", ",");
        return `contains(${formated})`;
    });
    const wildcardData = wildcardFormat.join(" AND ");

    const input = {
        TableName: "users",
        Limit: 10,
        ProjectionExpression: "userID, username, email, utype",
        FilterExpression: wildcardData,
        ExpressionAttributeValues: filterValuesMarsh
    }

    if(Object.keys(filterNames).length !== 0) {
        input.ExpressionAttributeNames = filterNames;
    }

    const data = await scanTable(input);
    return data;

}



async function put(user) {
    const userMarsh = Converter.marshall(user);
    const input = {
        TableName: "users",
        Item: userMarsh,
    };
    const response = await putItem(input);
    return response;
}

module.exports = {
    getFromUser,
    queryUser,
    update,
    getUsers,
    put
}

const {Converter, getItem, putItem, updateItem} = require("./dynamoDB");


async function get(planID, projectionArr) {
    const projection = projectionArr.reduce((prev, curr, i) => prev + (i !== 0 ? ", ": "") + curr, "");
    const planIDMarsh = Converter.marshall({planID});

    const input = {
        TableName: "plans",
        Key: planIDMarsh,
        ProjectionExpression: projection
    }

    console.log("buscamos con este input", input)

    try {
        const response = await getItem(input); //!Can directly return the promise, without await
        console.log("obtenemos este item", response)
        return response;
    } catch (err) {
        console.error("Something went wrong", err);
    }

}

//!Crear la liberia con esto
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



async function update(planID, update) {
    const planIDMarsh = Converter.marshall({planID});
    const {updateExpressions, updateNames, updateValues} = buildUpdate(update);
    const updateExpressionData = updateExpressions.join();
    // console.log("Update expression array", updateExpressions);
    // console.log("Update expression final", updateExpressionData);
    // console.log("Update names final", updateNames);
    // console.log("Update values final", updateValues)
    const updateValuesMarsh = Converter.marshall(updateValues);
    const input = {
        TableName: "plans",
        Key: planIDMarsh,
        UpdateExpression: "SET " + updateExpressionData,
        ExpressionAttributeValues: updateValuesMarsh,
        ReturnValues: "UPDATED_NEW"
    }


    if(Object.keys(updateNames).length !== 0) {
        input.ExpressionAttributeNames = updateNames;
    }

    const response = await updateItem(input);
    const attributes = Converter.unmarshall(response.Attributes); //!MOver esto dentro
    console.log(attributes)
    return attributes;

}


module.exports = {
    get,
    update
}
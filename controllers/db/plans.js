
const {Converter, getItem, putItem} = require("./dynamoDB");


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

module.exports = {
    get
}
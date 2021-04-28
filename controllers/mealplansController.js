
const { plans } = require("./db"); 

async function getMealPlan(planID) {
    const fields = ["patient", "weekdays"];
    try {
        const data = await plans.get(planID, fields);
        console.log("tenemos estos datos", data)
        return data;
    } catch (error) {
        console.error("Something went wrong", error);
    }
}

module.exports = {
    getMealPlan
}
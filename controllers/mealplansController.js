
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


async function update(planID, data) {

    const update = {
        weekdays: {
            [data.day]: {
                [data.meal]: data.info
            }
        }
    }

    const response = await plans.update(planID, update);
    console.log("repuesta", response);
    return response.weekdays;
}

module.exports = {
    getMealPlan,
    update
}
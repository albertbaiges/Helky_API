
const express = require("express");
const { mealPlansController } = require("../../controllers");

const router = express.Router();


router.get("/:planID", async (req, res) => {
    const {planID} = req.params;
    const data = await mealPlansController.getMealPlan(planID);
    console.log(data)
    if (data) {
        const {day, slot} = req.query;
        if(day && slot) {
            console.log(data);
            data.weekdays[day] = data.weekdays[day][slot];
            data.weekdays = {[day]: data.weekdays[day]}
            res.json(data);
        } else { //Remove all the comments and return only what is important
            for (const day in data.weekdays) {
                for (const slot in data.weekdays[day]) {
                    if (slot === "day")
                        continue;
                    data.weekdays[day][slot] = data.weekdays[day][slot].menu;
                }
            }
            res.json(data);
        }
    } else {
        const message = {
            error: "There is no such data"
        }
        res.json(message);
    }

});

router.post("/:planID", async (req, res) => {
    const {planID} = req.params;
    console.log("recibimos el body", req.body)
    const data = await mealPlansController.update(planID, req.body);
    res.json(data);
});

//!Add delete for this and other routers


module.exports = router;


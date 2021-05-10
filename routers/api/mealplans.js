
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

router.get("/:planID/medicines", async (req, res) => {
    const {planID} = req.params;
    const data = await mealPlansController.getMedicines(planID);
    res.json(data);
});


router.patch("/:planID/medicines", async (req, res) => {
    const {planID} = req.params;
    const body = req.body;
    try{
        const data = await mealPlansController.updateMedicines(planID, body);
        res.json({data});
    } catch(err) {
        res.json({error: "error", message: err.message});
    }
});


router.get("/:planID/activities", async (req, res) => {
    const {planID} = req.params;
    const data = await mealPlansController.getActivities(planID);
    console.log(data)
    if (data) {
        const {day} = req.query;
        if(day) {
            data.weekdays = {[day]: data.weekdays[day]}
            res.json(data);
        } else { //Remove all the comments and return only what is important
            for (const day in data.weekdays) {
                for(const slot in data.weekdays[day]) {
                    if(slot === "day")
                        continue;
                    data.weekdays[day][slot] = data.weekdays[day][slot].exercises;
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


router.patch("/:planID/activities", async (req, res) => {
    const {planID} = req.params;
    const body = req.body;
    try{
        const data = await mealPlansController.updateActivities(planID, body);
        res.json(data);
    } catch(err) {
        res.json({error: "error", message: err.message});
    }
});

module.exports = router;


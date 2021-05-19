
const express = require("express");
const { plansController } = require("../../controllers");
const {plansMiddlewares} = require("../../middlewares");

const router = express.Router();


router.get("/:planID/meals", plansMiddlewares.planInfo,async (req, res) => {
    const {planID} = req.params;
    const data = await plansController.getMealPlan(planID);
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

router.patch("/:planID/meals", plansMiddlewares.patchMeals, async (req, res) => {
    const {planID} = req.params;
    console.log("recibimos el body", req.body)
    const data = await plansController.updateMeals(planID, req.body);
    res.json(data);
});

router.get("/:planID/medicines", plansMiddlewares.planInfo, async (req, res) => {
    const {planID} = req.params;
    const data = await plansController.getMedicines(planID);
    res.json(data);
});


router.patch("/:planID/medicines", plansMiddlewares.patchMedicines, async (req, res) => {
    const {planID} = req.params;
    const body = req.body;
    try{
        const data = await plansController.updateMedicines(planID, body);
        res.json({data});
    } catch(err) {
        res.json({error: "error", message: err.message});
    }
});


router.get("/:planID/activities", plansMiddlewares.planInfo, async (req, res) => {
    const {planID} = req.params;
    const data = await plansController.getActivities(planID);
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


router.patch("/:planID/activities", plansMiddlewares.patchActivities, async (req, res) => {
    const {planID} = req.params;
    const body = req.body;
    try{
        const data = await plansController.updateActivities(planID, body);
        res.json(data);
    } catch(err) {
        res.json({error: "error", message: err.message});
    }
});

module.exports = router;


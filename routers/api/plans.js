
const express = require("express");
const { plansController } = require("../../controllers");
const {plansMiddlewares} = require("../../middlewares");

const router = express.Router();


router.get("/:planID/meals", plansMiddlewares.planInfo, async (req, res) => {
    try {
        const {planID} = req.params;
        const data = await plansController.getMealPlan(planID);
        if (data) {
            const {day, slot} = req.query;
            if(day) {
                console.log(data)
                data.weekdays = {
                    day: data.weekdays[day].day,
                    [day]: data.weekdays[day].meals
                    }
                if(slot){
                    data.weekdays = {[day]: data.weekdays[day][slot],
                    }
                }
                res.json(data);
            } else { //Remove all the comments and return only what is important
                console.log("before mapping", data)
                for (const day in data.weekdays) {
                    for (const slot in data.weekdays[day].meals) {
                        console.log("slot", slot)
                        data.weekdays[day].meals[slot] = data.weekdays[day].meals[slot].menu;
                    }
                }
                console.log("data to return2", data)
                res.json(data);
            }
        } else {
            const message = {
                error: "There is no such data"
            }
            res.json(message);
        }
    } catch(error) {
        return res.status(500).json({"Error": error.message});
    }
});

router.patch("/:planID/meals", plansMiddlewares.planInfo, plansMiddlewares.patchMeals, async (req, res) => {
    try {
        const {planID} = req.params;
        const data = await plansController.updateMeals(planID, req.body);
        res.json(data);
    } catch (error) {
        return res.status(500).json({"Error": error.message});
    }
});

router.get("/:planID/medicines", plansMiddlewares.planInfo, async (req, res) => {
    try {
        const {planID} = req.params;
        const data = await plansController.getMedicines(planID);
        const {day} = req.query;
        if (day) {
            data.weekdays = {[day]: data.weekdays[day]}
        }
        res.json(data);
    } catch(error) {
        return res.status(500).json({"Error": error.message});
    }
});


router.patch("/:planID/medicines", plansMiddlewares.planInfo, plansMiddlewares.patchMedicines, async (req, res) => {
    try{
        const {planID} = req.params;
        const body = req.body;
        const data = await plansController.updateMedicines(planID, body);
        res.json({data});
    } catch(error) {
        return res.status(500).json({"Error": error.message});
    }
});


router.get("/:planID/activities", plansMiddlewares.planInfo, async (req, res) => {
    try {
        const {planID} = req.params;
        const data = await plansController.getActivities(planID);
        console.log(data)
        if (data) {
            const {day} = req.query;
            if(day) {
                data.weekdays = {[day]: data.weekdays[day]}
                res.json(data);
            } else { //Remove all the comments and return only what is important
                console.log("before sending the data", data)
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
    } catch (error) {
        return res.status(500).json({"Error": error.message});
    }
});


router.patch("/:planID/activities", plansMiddlewares.planInfo, plansMiddlewares.patchActivities, async (req, res) => {
    try{
    const {planID} = req.params;
    const body = req.body;
        const data = await plansController.updateActivities(planID, body);
        res.json(data);
    } catch(error) {
        return res.status(500).json({"Error": error.message});
    }
});

module.exports = router;


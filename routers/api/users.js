
const {usersController} = require("../../controllers");
const { usersMiddlewares } = require("../../middlewares");

const express = require("express");
const router = express.Router();

router.get("/:userID", async (req, res) => {
    console.log("ha llegado a este endpoint")
    const {userID} = req.params;
    const data = await usersController.getUser(userID);
    res.json(data);
});


router.get("/:userID/disorders", async (req, res) => {
    console.log("ha llegado a este endpoint")
    const {userID} = req.params;
    const data = await usersController.getDisorders(userID);
    res.json(data);
});

router.get("/:userID/medicines", async (req, res) => {
    const {userID} = req.params;
    const data = await usersController.getMedicines(userID);
    console.log("respondiendo con", data)
    res.json(data);
});

router.get("/:userID/medics", async (req, res) => {
    console.log("ha llegado a este endpoint")
    const {userID} = req.params;
    const data = await usersController.getMedics(userID);
    res.json(data);
});

router.get("/:userID/centers", async (req, res) => {
    console.log("ha llegado a este endpoint")
    const {userID} = req.params;
    const data = await usersController.getCenters(userID);
    res.json(data);
});

router.patch("/:userID", async (req, res) => {
    const {userID} = req.params;
    const data = await usersController.update(userID, req.body);
    res.json(data);
});

router.get("/:userID/notifications", async (req, res) => {
    const {userID} = req.params;
    const data = await usersController.getNotifications(userID);
    res.json(data);
});


router.post("/:userID/relations", usersMiddlewares.postRelation, async (req, res) => {
    try {
        const {userID} = req.params;
        const relationAction = req.body;
        const data = await usersController.handleRelation(userID, relationAction);
        res.json(data);
    } catch (error) {
        return res.status(400).json({"Error": error.message});
    }
});


module.exports = router;
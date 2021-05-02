
const {usersController} = require("../../controllers");
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

router.get("/:userID/medics", async (req, res) => {
    console.log("ha llegado a este endpoint")
    const {userID} = req.params;
    const data = await usersController.getMedics(userID);
    res.json(data);
});


module.exports = router;
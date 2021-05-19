
const {usersController} = require("../../controllers");
const { usersMiddlewares } = require("../../middlewares");

const express = require("express");
const router = express.Router();

router.get("", async (req, res) => {
    console.log("procesamos este get de aqui")
    const {userID} = req.payload;
    console.log("ha llegado a este endpoint")
    const data = await usersController.getUser(userID);
    res.json(data);
});

router.patch("", async (req, res) => {
    try {
        console.log("procesamos este de aqui")
        const {userID} = req.payload;
        const data = await usersController.update(userID, req.body);
        res.json(data);
    } catch (error) {
        return res.status(400).json({"Error": error.message});
    }
});

router.get("/notifications", async (req, res) => {
    try {
        console.log("entramos a este")
        const {userID} = req.payload;
        const data = await usersController.getNotifications(userID);
        res.json(data);
    } catch (error) {
        return res.status(400).json({"Error": error.message});
    }
});


router.post("/relations", usersMiddlewares.postRelation, async (req, res) => {
    try {
        const {userID} = req.payload;
        const relationAction = req.body;
        const data = await usersController.handleRelation(userID, relationAction);
        res.json(data);
    } catch (error) {
        return res.status(400).json({"Error": error.message});
    }
});


module.exports = router;
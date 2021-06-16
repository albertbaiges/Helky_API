
const {usersController} = require("../../controllers");
const { usersMiddlewares } = require("../../middlewares");

const express = require("express");
const router = express.Router();

router.get("", async (req, res) => {
    try {
        const {userID} = req.payload;
        const data = await usersController.getUser(userID);
        res.json(data);
    } catch (error) {
        return res.status(500).json({"Error": error.message});   
    }
});

router.patch("", usersMiddlewares.patchUser, async (req, res) => {
    try {
        const {userID} = req.payload;
        const data = await usersController.update(userID, req.body);
        res.json(data);
    } catch (error) {
        return res.status(500).json({"Error": error.message});
    }
});

router.get("/notifications", async (req, res) => {
    try {
        console.log("entramos a este")
        const {userID} = req.payload;
        const data = await usersController.getNotifications(userID);
        res.json(data);
    } catch (error) {
        return res.status(500).json({"Error": error.message});
    }
});


router.post("/relations", usersMiddlewares.postRelation, async (req, res) => {
    try {
        const {userID} = req.payload;
        const relationAction = req.body;
        const data = await usersController.handleRelation(userID, relationAction);
        res.json(data);
    } catch (error) {
        return res.status(500).json({"Error": error.message});
    }
});


module.exports = router;
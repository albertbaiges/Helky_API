

const express = require("express");
const { centersController } = require("../../controllers");
const { centersMiddlewares, authMiddlewares } = require("../../middlewares")


const router = express.Router();


router.get("/patients", async (req, res) => {
    try {
        const {userID} = req.payload;
        const data = await centersController.getPatients(userID);
        res.send(data);
    } catch (error) {
        return res.status(500).json({"Error": error.message});
    }
});

router.get("/medics", async (req, res) => {
    try {
        const {userID} = req.payload;
        const data = await centersController.getMedics(userID);
        res.send(data);
    } catch (error) {
        return res.status(500).json({"Error": error.message});
    }
});

router.post("/signmedic", authMiddlewares.registerFields ,async (req, res) => {
    try {
        const {userID} = req.payload;
        const medic = req.body;
        const data = await centersController.registerMedic(userID, medic);
        res.send(data);
    } catch (error) {
        return res.status(500).json({"Error": error.message});
    }
});


module.exports = router;
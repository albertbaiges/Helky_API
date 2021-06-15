

const express = require("express");
const { centersController } = require("../../controllers");
const { centersMiddlewares, authMiddlewares } = require("../../middlewares")


const router = express.Router();


router.get("/patients", async (req, res) => {
    const {userID} = req.payload;
    const data = await centersController.getPatients(userID);
    res.send(data);
});

router.get("/medics", async (req, res) => {
    const {userID} = req.payload;
    const data = await centersController.getMedics(userID);
    res.send(data);
});

router.post("/signmedic", authMiddlewares.registerFields ,async (req, res) => {
    try {
        const {userID} = req.payload;
        const medic = req.body;
        const data = await centersController.registerMedic(userID, medic);
        res.send(data);
    } catch (error) {
        return res.status(400).json({"Error": error.message});
    }
});


module.exports = router;
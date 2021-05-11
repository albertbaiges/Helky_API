

const express = require("express");
const { centersController } = require("../../controllers");
const { centersMiddlewares } = require("../../middlewares")


const router = express.Router();


router.get("/:centerID/patients", async (req, res) => {
    const {centerID} = req.params;
    const data = await centersController.getPatients(centerID);
    res.send(data);
});

router.get("/:centerID/medics", async (req, res) => {
    const {centerID} = req.params;
    const data = await centersController.getMedics(centerID);
    res.send(data);
});

router.post("/:centerID/signmedic", centersMiddlewares.signMedicFields ,async (req, res) => {
    try {
        const {centerID} = req.params;
        const medic = req.body;
        const data = await centersController.registerMedic(centerID, medic);
        res.send(data);
    } catch (error) {
        return res.status(400).json({"Error": error.message});
    }
});


module.exports = router;
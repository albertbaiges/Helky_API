

const express = require("express");
const { centersController } = require("../../controllers");
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



module.exports = router;
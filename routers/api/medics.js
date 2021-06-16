
const express = require("express");
const router = express.Router();
const {medicsController, patientsController} = require("../../controllers")
const {patientsMiddlewares, medicsMiddlewares} = require("../../middlewares");



router.get("/patients", async (req, res) => {
    try {
        const {userID} = req.payload;
        const data = await medicsController.getPatients(userID);
        res.json(data);
    } catch (error) {
        return res.status(500).json({"Error": error.message});
    }
});

router.patch("/patients", patientsMiddlewares.patchPatient, medicsMiddlewares.isPatient, async (req, res) => {
    try {
        const {userID, medicines} = req.body;
        const update = {medicines};
        const data = await patientsController.update(userID, update);
        res.send(data);
    } catch (error) {
        return res.status(500).json({"Error": error.message});
    }
});


router.get("/centers", async (req, res) => {
    try {
        const {userID} = req.payload;
        const data = await medicsController.getCenters(userID);
        res.json(data);
    } catch (error) {
        return res.status(500).json({"Error": error.message});
    }
});




module.exports = router;
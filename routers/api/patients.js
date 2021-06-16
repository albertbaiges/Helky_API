
const express = require("express");
const router = express.Router();
const { patientsController } = require("../../controllers");
const {patientsMiddlewares} = require("../../middlewares");


router.patch("", patientsMiddlewares.patchPatient, async (req, res) => {
    try {
        const {userID} = req.payload;
        const {disorders, medicines} = req.body;
        const update = {disorders, medicines};
        const data = await patientsController.update(userID, update);
        res.send(data);
    } catch (error) {
        return res.status(500).json({"Error": error.message});
    }
});


router.get("/disorders", async (req, res) => {
    try {
        const {userID} = req.payload;
        const data = await patientsController.getDisorders(userID);
        console.log("Devolvemos", data)
        res.json(data);
    } catch (error) {
        return res.status(500).json({"Error": error.message});
    }
});

router.get("/medicines", async (req, res) => {
    try {
        const {userID} = req.payload;
        const data = await patientsController.getMedicines(userID);
        console.log("respondiendo con", data)
        res.json(data);
    } catch (error) {
        return res.status(500).json({"Error": error.message});
    }
});

router.get("/medics", async (req, res) => {
    try {
        const {userID} = req.payload;
        const data = await patientsController.getMedics(userID);
        res.json(data);
    } catch (error) {
        return res.status(500).json({"Error": error.message});
    }
});

router.get("/centers", async (req, res) => {
    try {
        const {userID} = req.payload;
        const data = await patientsController.getCenters(userID);
        res.json(data);
    } catch (error) {
        return res.status(500).json({"Error": error.message});
    }
});


module.exports = router;
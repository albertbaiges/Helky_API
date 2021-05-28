
const express = require("express");
const router = express.Router();
const {medicsController, patientsController} = require("../../controllers")
const {patientsMiddlewares, medicsMiddlewares} = require("../../middlewares");



router.get("/patients", async (req, res) => {
    console.log("reached this endpoint")
    const {userID} = req.payload;
    const data = await medicsController.getPatients(userID);
    res.json(data);
});

router.patch("/patients", patientsMiddlewares.patchPatient, medicsMiddlewares.isPatient, async (req, res) => {
    const {userID, medicines} = req.body;
    const update = {medicines};
    const data = await patientsController.update(userID, update);
    console.log("los datos a devolver son", data)
    const response = {
        message: "Successfully updated",
        data
    }
    res.send(response);
});


router.get("/centers", async (req, res) => {
    console.log("ha llegado a este endpoint")
    const {userID} = req.payload;
    const data = await medicsController.getCenters(userID);
    res.json(data);
});




module.exports = router;
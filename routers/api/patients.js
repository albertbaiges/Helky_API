
const express = require("express");
const router = express.Router();
const { patientsController } = require("../../controllers");
const {patientsMiddlewares} = require("../../middlewares");


router.get("/disorders", async (req, res) => {
    console.log("ha llegado a este endpoint");
    console.log(req.payload)
    const {userID} = req.payload;
    const data = await patientsController.getDisorders(userID);
    res.json(data);
});

router.get("/medicines", async (req, res) => {
    const {userID} = req.payload;
    const data = await patientsController.getMedicines(userID);
    console.log("respondiendo con", data)
    res.json(data);
});

router.get("/medics", async (req, res) => {
    console.log("ha llegado a este endpoint")
    console.log("payload recibida", req.payload)
    const {userID} = req.payload;
    const data = await patientsController.getMedics(userID);
    res.json(data);
});

router.get("/centers", async (req, res) => {
    console.log("ha llegado a este endpoint")
    const {userID} = req.payload;
    const data = await patientsController.getCenters(userID);
    res.json(data);
});

router.patch("/:userID", async (req, res) => {
    const {userID} = req.params;
    const {disorders, medicines} = req.body;
    const update = {disorders, medicines};
    const data = await patientsController.update(userID, update);
    // console.log("los datos a devolver son", data)
    const response = {
        message: "Successfully updated",
        data
    }
    res.send(response);
});


module.exports = router;
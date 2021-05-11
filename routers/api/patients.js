
const express = require("express");
const router = express.Router();
const { patientsController } = require("../../controllers");
const {patientsMiddlewares} = require("../../middlewares");


router.patch("/:userID", patientsMiddlewares.pathPatient, async (req, res) => {
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
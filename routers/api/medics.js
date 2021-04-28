
const express = require("express");
const router = express.Router();
const {medicsController} = require("../../controllers")


router.get("/:medicID/patients", async (req, res) => {
    console.log("reached this endpoint")
    const {medicID} = req.params;
    const data = await medicsController.getPatients(medicID);
    res.json({patients: data.patients});
});


module.exports = router;
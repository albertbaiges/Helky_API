
const express = require("express");
const router = express.Router();
const {medicinesController} = require("../../controllers");

router.get("/:patientID", async (req, res) => {
    try {
        const {patientID} = req.params;
        const data = await medicinesController.getMedicines(patientID);
        res.json(data);
    } catch (error) {
        console.log("Something went wrong", error);
    }
});

module.exports = router;
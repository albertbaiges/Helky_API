
const express = require("express");
const router = express.Router();

const {disordersController} = require("../../controllers");


router.get("/:patientID", async (req, res) => {
    const patientID = req.params.patientID;
    const {userID, role} = req.payload;
    try {
        const response = await disordersController.getDisorders(patientID, userID, role);
        if (response)
            res.json(response);
        else 
            res.sendStatus(404);
    } catch(err) {
        res.sendStatus(Number(err));
    }
});


module.exports = router;

const express = require("express");
const router = express.Router();
const {medicsController} = require("../../controllers")


router.get("/:medicID/patients", async (req, res) => {
    console.log("reached this endpoint")
    const {medicID} = req.params;
    const data = await medicsController.getPatients(medicID);
    res.json({patients: data.patients});
});


// router.patch("/:medicID/patients", async (req, res) => {
//     const {userID, disorders, medicines} = req.body;
//     const update = {disorders, medicines};
//     const data = await patientsController.update(userID, update);
//     console.log("los datos a devolver son", data)
//     const response = {
//         message: "Successfully updated",
//         data
//     }
//     res.send(response);
// });

module.exports = router;
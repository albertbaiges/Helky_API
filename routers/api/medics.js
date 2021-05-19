
const express = require("express");
const router = express.Router();
const {medicsController} = require("../../controllers")


router.get("/patients", async (req, res) => {
    console.log("reached this endpoint")
    const {userID} = req.payload;
    const data = await medicsController.getPatients(userID);
    res.json(data);
});

router.get("/centers", async (req, res) => {
    console.log("ha llegado a este endpoint")
    const {userID} = req.payload;
    const data = await medicsController.getCenters(userID);
    res.json(data);
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
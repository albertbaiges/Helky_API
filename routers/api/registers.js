
const express = require("express");
const router = express.Router();

const {registersController} = require("../../controllers");

// Returns the register document

// router.get("/:registerID", async (req, res) => {
//     const {registerID} = req.params;
//     const response = await registersController.getRegister(registerID);
//     if (response)
//         res.json({register: response})
//     else 
//         res.sendStatus(404);

// });

// Creates a register document (must be a valid document) //! Control other people cannot create it for you (middleware)
router.post("", async (req, res) => {
    const {patientID, disorder} = req.body;
    const {id} = await registersController.createRegister(patientID, disorder);
    if (id) { //! Complete with more informative return to the front
        res.json({message: "Register created", registerId: id})
    } else {
        res.json({error: "to do"}) //! to complete
    }

});

// Gets the tracking data from the register document

// router.get("/:registerID/tracking", async (req, res) => {
//     const {registerID} = req.params;
//     const response = await registersController.getTracking(registerID);
//     console.log("reponse", response)
//     if (response)
//         res.json({tracking: response.tracking, date: response.date})
//     else 
//         res.sendStatus(404);
// });


// // Posts tracking data from the register document //! PROBABLY PUT OR PATCH
// router.post("/:registerID/tracking", async (req, res) => {
//     const tracking = req.body;
//     const {registerID} = req.params;
//     const data = await registersController.addTrackingEvent(registerID, tracking);
//     res.json({data});
// });

router.get("/supported", async (req, res) => {
    const data = registersController.getSupported();
    res.json(data);
});

router.get("/:registerID", async (req, res) => {
    console.log("Nuevo endpoint registros");
    const {registerID} = req.params;
    console.log("registro", registerID)
    const data = await registersController.getRegister(registerID);
    res.json(data);
});

router.get("/:registerID/tracking", async (req, res) => {
    console.log("Nuevo endpoint tracking registros");
    const {registerID} = req.params;
    const data = await registersController.getNewTracking(registerID);
    res.json(data);
});

router.patch("/:registerID/tracking", async (req, res) => {
    //En el middleware de esto hay que mirar que el año, mes y dia
    //del body sean el mismo que se obtiene en el timestamp
    //Sino es badrequest, no coinciden los datos

    //Inlcuso mejor simplemente coger año mñes y dia del timestamp!!!!!

    const event = req.body;
    const {registerID} = req.params;
    const data = await registersController.addTrackingEventNew(registerID, event);
    res.json(data);
});

module.exports = router;
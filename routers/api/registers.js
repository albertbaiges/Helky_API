
const express = require("express");
const router = express.Router();

const {registersController} = require("../../controllers");
const {registersMiddlewares} = require("../../middlewares");

// Creates a register document (must be a valid document) //! Control other people cannot create it for you (middleware)

router.post("", registersMiddlewares.createRegister ,async (req, res) => {
    try {        
        const {userID} = req.payload;
        const {family} = req.body;
        const data = await registersController.createRegister(userID, family);
        res.json(data);
    } catch (error) {
        return res.status(500).json({"Error": error.message});   
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

router.get("/:registerID", registersMiddlewares.registerInfo, async (req, res) => {
    try {
        const {registerID} = req.params;
        const data = await registersController.getRegister(registerID);
        res.json(data);        
    } catch (error) {
        return res.status(500).json({"Error": error.message});
    }

});

router.get("/:registerID/tracking", registersMiddlewares.registerInfo, async (req, res) => {
    try {
        console.log("Nuevo endpoint tracking registros");
        const {registerID} = req.params;
        const {month, year} = req.query;
        const data = await registersController.getTracking(registerID, month, year);
        res.json(data);
    } catch (error) {
        return res.status(500).json({"Error": error.message});
    }

});

router.patch("/:registerID/tracking", registersMiddlewares.registerInfo, registersMiddlewares.patchTracking, async (req, res) => {
    try {
        const event = req.body;
        const {registerID} = req.params;
        const data = await registersController.addTrackingEvent(registerID, event);
        res.json(data);
    } catch (error) {
        return res.status(500).json({"Error": error.message});   
    }
});

module.exports = router;
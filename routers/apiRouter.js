
const jwt = require("jsonwebtoken"); // JWT
const {patients, registers, plans, medics, users, centers, searches} = require("./api"); //Routers
const {patientsMiddlewares, medicsMiddlewares, centersMiddlewares} = require("../middlewares");
const express = require("express");
const router = express.Router();

//MIDDLEWARES
//All calls to API must have a JWT
router.use(authenticateJWT);

function authenticateJWT(req, res, next) {
    const header = req.headers["authorization"];
    let token;
    if (header) {
        token = header.split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                return res.status(403).json({JWT: "Invalid JWT"});
            }
            req.payload = payload;
            next();
        });
    } else {
        return res.status(401).json({JWT: "Bearer token authorization must be provided"})
    }
}


router.use("/patient", patientsMiddlewares.patientPath, patients);
router.use("/registers", registers);
router.use("/plans", plans);
router.use("/medic", medicsMiddlewares.medicPath, medics);
router.use("/user", users);
router.use("/center", centersMiddlewares.centerPath, centers);
router.use("/search", searches);

module.exports = router;
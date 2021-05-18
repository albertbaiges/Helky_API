
const jwt = require("jsonwebtoken"); // JWT
const {patients, registers, plans, medics, users, centers, searches} = require("./api"); //Routers
const {medicsMiddlewares, centersMiddlewares} = require("../middlewares");
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
        console.log("Token recibido", token)
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                return res.sendStatus("403");
            }
            req.payload = payload;
            next();
        });
    } else {
        return res.sendStatus("401")
    }
}


router.use("/patients", patients);
router.use("/registers", registers);
router.use("/plans", plans);
router.use("/medics", medicsMiddlewares.medicPath, medics);
router.use("/users", users);
router.use("/centers", centersMiddlewares.centerPath, centers);
router.use("/search", searches);

module.exports = router;
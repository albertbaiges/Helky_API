
const jwt = require("jsonwebtoken"); // JWT
const {disorders, patients, registers, mealplans, medics, medicines, users, centers} = require("./api"); //Routers
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
                return res.sendStatus("403");
            }
            req.payload = payload;
            next();
        });
    } else {
        return res.sendStatus("401")
    }
}


router.use("/disorders", disorders);
router.use("/patients", patients);
router.use("/registers", registers);
router.use("/mealplans", mealplans);
router.use("/medics", medics);
router.use("/medicines", medicines);
router.use("/users", users);
router.use("/centers", centers);

module.exports = router;
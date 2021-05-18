
const express = require("express");
const app = express();
const cors = require('cors');
const {apiRouter} = require("./routers");
const jwt = require("jsonwebtoken"); // JWT
const { authController } = require("./controllers")


require("dotenv").config()






app.listen(3000, () => console.log("Server listening...."));

// High Level Middlewares
app.use(cors()); // for parsing application/json
app.use(express.json()) // for parsing application/json
app.use(pathLogger); // Get logs of the application

// ROUTERS
app.use("/api", apiRouter);

//! Mirar si cambiar el login a email-password
// 404 Not Registered - 401 Bad User-Password 
app.post("/login", async (req, res) => {
    const {username, password} = req.body;
    const data = await authController.checkLogin(username, password);
    if (data.status === 1) {
        console.log("Firmamos para el usuario", data)
        const accessToken = jwt.sign(data.user, process.env.ACCESS_TOKEN_SECRET);
        const user = {
            userID: data.user.userID,
            username: data.user.username,
            utype: data.user.utype,
            authorization: {
                jwt: accessToken,
                iat: Date.now()
            }
        }
        console.log("Usuario con firma", user)
        // const response = {username: data.user.username, jwt: accessToken}; // Warn deprecation of jwt?
        res.json(user);
    } else if (data.status === 0) {
        res.sendStatus(401).statusMessage("Invalid password");
    } else if (data.status === -1) {
        res.sendStatus(400).statusMessage("Not registered");
    }
});

app.post("/signup", async (req, res) => {
    try {
        const user = req.body;
        const data = await authController.registerUser(user);
        res.json(data);
    } catch (error) {
        return res.status(400).json({"Error": error.message});
    }
});


function pathLogger(req, res, next){
    const date = new Date();
    const now = + date.getDate() + "/"
                + date.getMonth() + "/" + date.getFullYear()
                + "  " + date.getHours() + ":" + date.getMinutes()
                + ":" + date.getSeconds();
    const petition = req.method + " " + req.originalUrl;
    console.log(now + ":", petition);
    next();
}
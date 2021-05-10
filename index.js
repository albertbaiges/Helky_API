
const express = require("express");
const app = express();
const cors = require('cors');
const {apiRouter} = require("./routers");
const jwt = require("jsonwebtoken"); // JWT
const { authController } = require("./controllers")

require("dotenv").config()


app.listen(3000, () => console.log("Server listening...."));

// MIDDLEWARES
app.use(cors()); // for parsing application/json
app.use(express.json()) // for parsing application/json
app.use(pathLogger); // Get logs of the application

// ROUTERS
app.use("/api", apiRouter);

// Webapp landing and login (get the api token)
app.get("/", (req, res) => {
    // if (!req.session.user) {
    //     res.sendFile("index.html", {root: "./views"});
    // } else {
    //     console.log("Thie user has already been logged");
    //     console.log("This user has on its cookie:", req.session.user);
    //     res.send("You were already logged in, no need to take the form :)")
    // }
});

// app.route("/login")
//     .get((req, res) => {
//         res.sendFile("index.html", {root: "./views"});
//     })
//     .post((req, res) => {
//         console.log("Vamos a procesar un post")
//         const data = {username: req.body.username, token: "This is the token for the api"}
//         console.log("Han intentado un login con", req.body.username, req.body.password);
//         // db.checkLogin(req.body.username, req.body.password)
//         //     .then(obj => {
//         //         const response = {status: obj.status};
//         //         if (obj.status === 1) {
//         //             response.message = "Sucessful login";
//         //             req.session.user =  obj.user;
//         //         } else if (obj.status === 0) {
//         //             response.message = "Wrong password";
//         //         } else if (obj.status === -1){
//         //             response.message = "Unregistered user";
//         //         }
//         //         res.json(response);
//         //     });

//         // Sucessful login...
//         // Payload to serialize
//         payload = {user: "albert", userID: 1, role: "dev"};
//         const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
//         res.json({jwt: accessToken});
//     });


//! Mirar si cambiar el login a email-password
// 404 Not Registered - 401 Bad User-Password 
app.post("/login", async (req, res) => {
    const {username, password} = req.body;
    const data = await authController.checkLogin(username, password);
    if (data.status === 1) {
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
        // const response = {username: data.user.username, jwt: accessToken}; // Warn deprecation of jwt?
        res.json(user);
    } else if (data.status === 0) {
        res.sendStatus(401);
    } else if (data.status === -1) {
        res.sendStatus(404);
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
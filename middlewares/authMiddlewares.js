
const {jdyn} = require("../controllers/db");

function loginFields(req, res, next) {
    const {body} = req;
    let invalid = false;
    const response = {};

    if (!body.email || body.email.constructor !== String) {
        response.email = "String type email must be provided";
        invalid = true;
    }

    if (!body.password || body.password.constructor !== String) {
        response.password = "String type password must be provided";
        invalid = true;

    }

    if (invalid) {
        return res.status("400").json(response);
    }

    next();
}


function registerFields(req, res, next) {
    const {body} = req;
    let invalid = false;
    const response = {};

    if (!body.username || body.username.constructor !== String) {
        response.username = "String type username must be provided";
        invalid = true;
    }

    if (!body.email || body.email.constructor !== String) {
        response.email = "String type email must be provided";
        invalid = true;
    }  else if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(body.email)) {
        response.email = "Invalid email";
        invalid = true;
    }

    if (!body.password || body.password.constructor !== String) {
        response.password = "String type password must be provided";
        invalid = true;
    } else if (!/^(?=.*[A-Z])(?=.*\d)[\w]{8,}$/.test(body.password)) {
        response.password = "Invalid password";
        invalid = true;
    }

    if (invalid) {
        return res.status("400").json(response);
    }

    next();
}

async function isRegistered(req, res, next) {
    const {email} = req.body;
    let userID;
    if(req.payload) {
        userID = req.payload.userID;
    }

    if(email) {
        const filter = {
            email
        }
        const users = await jdyn.scan("users", ["userID", "email"], filter);
        if (users.length && userID && !users.map(user => user.userID).includes(userID)) {
            return res.status("400").json({Error: "Email in use"});
        } else if (users.length && !userID) {
            return res.status("400").json({Error: "Email in use"});
        }
    }

    next();
}

module.exports = {
    loginFields,
    registerFields,
    isRegistered
};
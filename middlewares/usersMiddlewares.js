
const {jdyn} = require("../controllers/db");

function postRelation(req, res, next) {
    const {body} = req;
    let invalid = false;
    const response = {};
    const actions = ["request", "accept", "reject"];

    if (!body.target || body.target.constructor !== String) {
        response.target = "String userID must be provided, target of the action";
        invalid = true;
    }

    if (!body.action || body.action.constructor !== String || !actions.includes(body.action)) {
        response.action = `String action (${actions}) must be provided`;
        invalid = true;
    }

    if (invalid) {
        return res.status("400").json(response);
    }

    next();

}

async function patchUser(req, res, next) {

    const {body} = req;
    let invalid = false;
    const response = {};

    if (body.username && body.username.constructor !== String) {
        response.username = "String type username must be provided";
        invalid = true;
    }

    if (body.email && body.email.constructor !== String) {
        response.action = `"String type email must be provided"`;
        invalid = true;
    } else if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(body.email)) {
        response.email = "Invalid email";
        invalid = true;
    }

    if (body.password && body.password.constructor !== String) {
        response.username = "String type password must be provided";
        invalid = true;
    } else if (body.password && !/^(?=.*[A-Z])(?=.*\d)[\w]{8,}$/.test(body.password)) {
        response.password = "Invalid password";
        invalid = true;
    }

    if (invalid) {
        return res.status("400").json(response);
    }

    next();

}

module.exports = {
    postRelation,
    patchUser
};
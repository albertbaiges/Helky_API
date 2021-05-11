

function centerPath(req, res, next) {
    if (req.payload.utype !== "center") {
        return res.status("403").send("Only accessible for centers")
    }
    next();
}

function signMedicFields(req, res, next) {
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

module.exports = {
    centerPath,
    signMedicFields
}
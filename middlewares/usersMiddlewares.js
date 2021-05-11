

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

module.exports = {
    postRelation
};
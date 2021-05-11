

function patchTracking(req, res, next) {
    const {body} = req;
    let invalid = false;
    const response = {};

    if (!body.data || body.data.constructor !== Number) {
        response.data = `Number must be provided`;
        invalid = true;
    }

    if (!body.timestamp || body.timestamp.constructor !== String) {
        response.timestamp = `String timestamp must be provided`;
        invalid = true;
    } else {
        let date = new Date(body.timestamp);
        let timestamp = date.valueOf();
        if (isNaN(timestamp)) {
            response.timestamp = `String timestamp must be provided`;
            invalid = true;
        } else if (date.getFullYear() < 2021) {
            response.timestamp = `Registers are nor allowed for dates prior to 1/1/2021`;
            invalid = true;
        }
    }

    if (invalid) {
        return res.status("400").json(response);
    }

    next();
}





module.exports = {
    patchTracking
};


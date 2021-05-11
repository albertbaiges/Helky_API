
function medicPath(req, res, next) {
    console.log(req.payload)
    if (req.payload.utype !== "medic") {
        return res.status("403").send("Only accessible for medics")
    }
    next();
}

module.exports = {
    medicPath
}
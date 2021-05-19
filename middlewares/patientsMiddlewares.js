

function patientPath(req, res, next) {
    console.log("esta intentando acceder", req.payload)
    if (req.payload.utype !== "patient") {
        return res.status("403").send("Only accessible for patients")
    }
    next();
}


module.exports = {
    patientPath
};
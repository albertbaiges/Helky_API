

function pathPatient(req, res, next) {
    console.log(req.params);
    console.log("cuerpo", req.body);
    console.log(req.payload)

    next();
}


module.exports = {
    pathPatient
};
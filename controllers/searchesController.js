const { jdyn } = require("./db");

async function getUsers(values) {
    const filter = {};
    if (values.u) {
        filter.username = values.u
    }

    if (values.e) {
        filter.email = values.e
    }

    if (values.t && values.t !== "any") {
        filter.utype = values.t
    }
    console.log("filtro", filter)
    // const data = users.getUsers(filter);
    const projection = ["userID", "username", "email", "utype"]
    const data = await jdyn.scan("users", projection, filter, true);
    console.log("datos a retornar", data)
    return data;
}

module.exports = {
    getUsers
}
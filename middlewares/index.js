

const authMiddlewares = require("./authMiddlewares");
const patientsMiddlewares = require("./patientsMiddlewares");
const medicsMiddlewares = require("./medicsMiddlewares");
const centersMiddlewares = require("./centersMiddlewares");
const plansMiddlewares = require("./plansMiddlewares");
const registersMiddlewares = require("./registersMiddlewares");
const usersMiddlewares = require("./usersMiddlewares");


module.exports = {
    authMiddlewares,
    patientsMiddlewares,
    medicsMiddlewares,
    centersMiddlewares,
    plansMiddlewares,
    registersMiddlewares,
    usersMiddlewares
}
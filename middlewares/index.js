

const patientsMiddlewares = require("./patientsMiddlewares");
const medicsMiddlewares = require("./medicsMiddlewares");
const centersMiddlewares = require("./centersMiddlewares");
const plansMiddlewares = require("./plansMiddlewares");

const usersMiddlewares = require("./usersMiddlewares");

module.exports = {
    patientsMiddlewares,
    medicsMiddlewares,
    centersMiddlewares,
    plansMiddlewares,

    usersMiddlewares
}
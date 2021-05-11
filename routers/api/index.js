
// WRAPPER
// Allows importing eveything from same module
// while code is modulated in several modules

const patients = require("./patients");
const registers = require("./registers");
const plans = require("./plans");
const medics = require("./medics");
const users = require("./users");
const centers = require("./centers");
const searches = require("./searches");

module.exports = {
    patients,
    registers,
    plans,
    medics,
    users,
    centers,
    searches
}
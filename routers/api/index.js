
// WRAPPER
// Allows importing eveything from same module
// while code is modulated in several modules

const patients = require("./patients");
const disorders = require("./disorders");
const registers = require("./registers");
const mealplans = require("./mealplans");
const medics = require("./medics");
const medicines = require("./medicines");
const users = require("./users");
const centers = require("./centers");

module.exports = {
    patients,
    disorders,
    registers,
    mealplans,
    medics,
    medicines,
    users,
    centers
}
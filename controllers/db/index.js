

const {Converter} = require("./dynamoDB");
const users = require("./searchUsers")
const registers = require("./searchRegisters");
const plans = require("./plans");

module.exports = {
    Converter,
    users,
    registers,
    plans
}
